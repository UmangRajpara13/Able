import whisper
import torch
import gc
import os

'''
setting CUDA_LAUNCH_BLOCKING to 1. To get more info on the following error.

RuntimeError: CUDA error: unspecified launch failure
CUDA kernel errors might be asynchronously reported at some other API call,
so the stacktrace below might be incorrect.
'''
os.environ["CUDA_LAUNCH_BLOCKING"] = '1'


print("Is cuda available?", torch.cuda.is_available(), end=". ")
print("Is cuDNN version:", torch.backends.cudnn.version())
print("cuDNN enabled? ", torch.backends.cudnn.enabled)
print("Device count?", torch.cuda.device_count())

'''
The code "torch.cuda.current_device()" generates the following error on some occasions.

RuntimeError: CUDA unknown error - this may be due to an incorrectly set up environment, 
e.g. changing env variable CUDA_VISIBLE_DEVICES after program start. Setting the available devices to be zero.
'''

# print("Current device?", torch.cuda.current_device())
# print("Device name? ", torch.cuda.get_device_name(torch.cuda.current_device()))
   
gc.collect()
torch.cuda.empty_cache()

 
model = whisper.load_model("base.en")
