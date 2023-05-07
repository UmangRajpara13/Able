import asyncio
import torch
import whisper
import numpy as np
import gc, time,ffmpeg

model = whisper.load_model("base.en")
torch.device("cpu")
# Define a coroutine that performs inference on the AI model with a given input string
async def infer_on_model(input_string):
    # Load the AI model onto the GPU
    print('running t1',input_string)
    start = time.perf_counter()

    # torch.cuda.empty_cache()
    try:
        # This launches a subprocess to decode audio while down-mixing and resampling as necessary.
        # Requires the ffmpeg CLI and `ffmpeg-python` package to be installed.
        out, _ = (
            ffmpeg.input(input_string, threads=0)
            .output("-", format="s16le", acodec="pcm_s16le", ac=1, ar=16000)
            .run( capture_stdout=True, capture_stderr=True)
        )
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to load audio: {e.stderr.decode()}") from e

    arr = np.frombuffer(out, np.int16).flatten().astype(np.float32) / 32768.0

    
    # Perform inference on the AI model with the input string
    result = model.transcribe(arr)
    # print(result["text"])

    end = time.perf_counter()
    print(end - start)

    # Return the results of the inference
    return result["text"]

async def main():
    # Define a list of input strings to pass to the coroutines
    input_strings = ["my.wav", "my1.wav"]
    
    # Create a list of coroutines to execute, one for each input string
    coroutines = [infer_on_model(input_string) for input_string in input_strings]
    
    # Execute the coroutines concurrently using asyncio.gather()
        # Create a list of tasks for the coroutines
    tasks = [asyncio.create_task(infer_on_model(input_string)) for input_string in input_strings]
       # Execute the tasks concurrently using asyncio.gather()
    results = await asyncio.gather(*tasks) 
    # results = await asyncio.gather(*coroutines)
    print(results)
    # Process the results of the coroutines
    # ...
    
if __name__ == "__main__":
    # Start the event loop and run the main coroutine
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
