#!/bin/bash

export PATH=/usr/local/cuda-11.8/bin${PATH:+:${PATH}}
export CUDA_HOME=/usr/local/cuda
export LD_LIBRARY_PATH=$CUDA_HOME/lib64

export PATH=/usr/local/cuda-11.8/bin${PATH:+:${PATH}}
export CUDA_HOME=/usr/local/cuda
export LD_LIBRARY_PATH=$CUDA_HOME/lib64

npx nodemon --watch src src/able.js