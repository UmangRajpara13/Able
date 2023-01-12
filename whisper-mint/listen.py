import asyncio
import sys
from websocketInterface import send
import numpy as np
import sounddevice as sd
from timer import Timer
import soundfile as sf
import queue
from transcribe import stt
from websocketInterface import connectWebSocket
import os

tmp = None


async def record_buffer(**kwargs):
    print('Start Listening ...')

    loop = asyncio.get_event_loop()
    event = asyncio.Event()
    idx = 0
    idy = 0
    threshold = 10
    listening_initialized = False
    timer = Timer()
    prefix_indata = np.empty((100_000_000, 1), dtype='float32')
    buffer = np.empty((100_000_000, 1), dtype='float32')
    # q = queue.Queue()

    def callback(indata, frame_count, time_info, status):
        # print(np.concatenate(indata, axis=0))
        nonlocal idx, idy, listening_initialized
        nonlocal buffer, prefix_indata, threshold

        prefix_indata[idy: idy + len(indata)] = indata
        idy += len(indata)

        # calc abs of samples -> x
        x = np.absolute(indata)

        # calc volume -> y
        y = np.sum(x)

        # volume control y > threshold
        if y > threshold:
            # print(y)

            if listening_initialized:
                # print('add highs to listening')
                buffer[idx:idx + len(indata)] = indata
                idx += len(indata)
                timer.stop()
            else:
                # print('Start Listening')

                listening_initialized = True
                threshold = 5

                # here idx is 0
                buffer[idx:100] = prefix_indata[-101:-1]

                buffer[101:101 + len(indata)] = indata
                idx += len(indata)
        else:
            if listening_initialized:
                if timer.is_running():
                    if timer.is_timeout():
                        threshold = 7.5

                        buffer = buffer[0:idx]

                        with sf.SoundFile('./action.wav', mode='x', samplerate=16000,
                                          channels=1) as file:
                            file.write(buffer)
                            file.close()
                        stt()

                        listening_initialized = False
                        timer.stop()
                        idx = 0
                        buffer = np.empty((100_000_000, 1), dtype='float32')
                        prefix_indata = np.empty(
                            (100_000_000, 1), dtype='float32')

                        # loop.call_soon_threadsafe(event.set)
                        # stream.abort()
                        # raise sd.CallbackStop
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


async def main(frames=100_000_000, channels=1, dtype='float32', **kwargs):
    # asyncio.run()
    await connectWebSocket("ws://localhost:1111")
    await send("sttpid:"+str(os.getpid()))
    await record_buffer(**kwargs)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit('\nInterrupted by user')
