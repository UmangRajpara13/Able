#!/bin/bash

nvidia-smi | grep python | awk '{print $5}' | cut -d '.' -f 1 | while read pid; do
    echo "Killing process with PID $pid"
    kill -9 $pid
done


export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:"/home/user/Desktop/My Projects/able_dev/whisper-mint/whisper/lib/python3.9/site-packages/torch/lib"
export CUDA_HOME=${CUDA_HOME}:"/home/user/Desktop/My Projects/able_dev/whisper-mint/whisper/lib/python3.9/site-packages/torch/cuda"
source ~/.zshrc

whisper-mint/whisper/bin/python3 ./whisper-mint/main.py 1111