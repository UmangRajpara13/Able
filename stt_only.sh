#!/bin/bash

nvidia-smi | grep python | awk '{print $5}' | cut -d '.' -f 1 | while read pid; do
    echo "Killing process with PID $pid"
    kill -9 $pid
done

export PATH=/usr/local/cuda/bin:$PATH

# export PATH=/usr/local/cuda-11.8/bin${PATH:+:${PATH}}
# export CUDA_HOME=/usr/local/cuda
# export LD_LIBRARY_PATH=$CUDA_HOME/lib64

# export PATH=/usr/local/cuda-11.8/bin${PATH:+:${PATH}}
# export CUDA_HOME=/usr/local/cuda
# export LD_LIBRARY_PATH=$CUDA_HOME/lib64

./whisper-mint/venv/bin/python3 ./whisper-mint/main.py 1111