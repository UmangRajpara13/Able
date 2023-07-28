#!/bin/bash


export PATH=/usr/local/cuda-11.8/bin${PATH:+:${PATH}}
export CUDA_HOME=/usr/local/cuda
export LD_LIBRARY_PATH=$CUDA_HOME/lib64


./listen/venv/bin/python3 ./listen/main.py 1111