import asyncio
import websockets
import time,os
import numpy as np
import sounddevice as sd
from timer import Timer
import soundfile as sf
from transcribe import model
import json
import ffmpeg
import numpy as np
from termcolor import colored

ws=None

def transcribe():
    try:
        # This launches a subprocess to decode audio while down-mixing and resampling as necessary.
        # Requires the ffmpeg CLI and `ffmpeg-python` package to be installed.
        out, _ = (
            ffmpeg.input('action.wav', threads=0)
            .output("-", format="s16le", acodec="pcm_s16le", ac=1, ar=16000)
            .run(capture_stdout=True, capture_stderr=True)
        )
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to load audio: {e.stderr.decode()}") from e
 
    arr = np.frombuffer(out, np.int16).flatten().astype(np.float32) / 32768.0
    os.remove("action.wav")
 
    result = model.transcribe(arr)
    transcript = result["text"]
    print(f"\n{colored(transcript,'blue')}\n")
    transcription = {"transcription": result["text"]}
    if(len(result["text"])): asyncio.run(send_message(json.dumps(transcription)))
    # asyncio.create_task(Transcribe(arr))



async def record_buffer(**kwargs):
    print('Listening...')
    # asyncio.run(send_message('info:' + 'Listening'))
    # loop = asyncio.get_event_loop()
    event = asyncio.Event()
    idx = 0
    idy = 0
    threshold = 2 #init volume
    listening_initialized = False
    timer = Timer()
    prefix_indata = np.empty((100_000_000, 1), dtype='float32')
    buffer = np.empty((100_000_000, 1), dtype='float32')
    highVolIndex = 0
    # q = queue.Queue()

    def callback(indata, frame_count, time_info, status):
        # print(np.concatenate(indata, axis=0))
        nonlocal idx, idy, listening_initialized,highVolIndex
        nonlocal buffer, prefix_indata, threshold

        # print(prefix_indata.size , prefix_indata.size - idy ,indata.sie)

        if prefix_indata.size - idy < indata.size:
            prefix_indata = np.empty((100_000_000, 1), dtype='float32')
            idy = 0

        else:
            prefix_indata[idy: idy + len(indata)] = indata

            idy += len(indata)

        # calc abs of samples -> x
        x = np.absolute(indata)

        # calc volume -> y
        y = np.sum(x)
        # print(y)  
        # volume control y > threshold
        if y > threshold:
            print(y)

            if listening_initialized:
                # print('add highs to listening')
                buffer[idx:idx + len(indata)] = indata
                idx += len(indata)

                highVolIndex += len(indata)

                timer.stop()
            else:
                # print('Start Listening')

                listening_initialized = True
                threshold = 1 # lower vol threshold after speaker started speaking

                # here idx is 0, add left hand buffer before threshold
                buffer[idx:100] = prefix_indata[-101:-1]
                # regularly appending buffer
                buffer[101:101 + len(indata)] = indata
                idx += len(indata)

                highVolIndex += len(indata)

        else:
            if listening_initialized:
                if timer.is_running():
                    if timer.is_timeout():
                        threshold = 2 # restore init volume

                        buffer = buffer[0:idx]

                        print('buffer',len(buffer))

                        print('high vol buffer Index',highVolIndex)
                        

                        if(highVolIndex < 4000): 

                            print(colored(f"\n[{highVolIndex}] Deflecting Ripple noise!\n",'green'))
                            listening_initialized = False
                            timer.stop()
                            
                            buffer = np.empty((100_000_000, 1), dtype='float32')
                            idx = 0
                            prefix_indata = np.empty(
                            (100_000_000, 1), dtype='float32')

                            highVolIndex = 0

                        else:
                            # print('buff',len(buffer))

                            try:
                                os.remove('./action.wav')
                            except:
                                print('action.wav not exists')
                            with sf.SoundFile('./action.wav', mode='x', samplerate=16000,
                                            channels=1) as file:
                                file.write(buffer)
                                file.close()
                    
                            transcribe()

                            listening_initialized = False
                            timer.stop()
                            idx = 0
                            buffer = np.empty((100_000_000, 1), dtype='float32')
                            prefix_indata = np.empty(
                                (100_000_000, 1), dtype='float32')

                            highVolIndex = 0

                    else:
                        # print('await timer')

                        buffer[idx:idx + len(indata)] = indata
                        idx += len(indata)
                else:
                    # print('add lows to listening')

                    timer.start()
                    buffer[idx:idx + len(indata)] = indata
                    idx += len(indata)
            else:
                # print('stop timer')

                timer.stop()

    stream = sd.InputStream(callback=callback, dtype=buffer.dtype,
                            channels=1, samplerate=16000, **kwargs)
    with stream:
        await event.wait()


async def connectWebSocket(uri):
    global ws
    another_task = None

    while True:
        try:
            async with websockets.connect(uri) as websocket:
                # Send and receive messages using the WebSocket connection
                ws=websocket
                sttpid = {"sttpid": str(os.getpid())}
                await send_message(json.dumps(sttpid))

                if not another_task:
                    another_task = asyncio.create_task(record_buffer())
                    print("Started Listening task")

                # Wait for the connection to close
                await websocket.wait_closed()

                # Handle the connection close event
                print("Connection closed")

        except:
            print("Connection error. Retrying in 1 second.")
            time.sleep(1)

async def send_message(message):
    await ws.send(message)
    # print(f"Sent message to server: {message}")

