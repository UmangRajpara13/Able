import whisper
import torch
import time
import gc
import os

print("Is cuda available?", torch.cuda.is_available(), end=". ")

print("Is cuDNN version:", torch.backends.cudnn.version())

print("cuDNN enabled? ", torch.backends.cudnn.enabled)

print("Device count?", torch.cuda.device_count())

print("Current device?", torch.cuda.current_device())

print("Device name? ", torch.cuda.get_device_name(torch.cuda.current_device()))

gc.collect()
torch.cuda.empty_cache()

model = whisper.load_model("base.en")


