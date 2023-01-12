import whisper
import torch
import time
import ffmpeg
import numpy as np
import gc
import os
from websocketInterface import send
import asyncio

print("cuda", torch.cuda.is_available(), end=". ")

gc.collect()
torch.cuda.empty_cache()

model = whisper.load_model("base.en")

def stt():

    start = time.perf_counter()
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

    result = model.transcribe(arr)
    os.remove("action.wav")

    # print('\U0001F3A4 \033[92m',result["text"],"\033[0m","{:.2f}".format(time.perf_counter() - start),"s\n")
    asyncio.run(send('stt:' + result["text"]))