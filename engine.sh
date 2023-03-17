#!/bin/bash

# echo ParentPID $$ 

# NODE_ENV=development node able.js --parentPID=$$

export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:"/home/user/Desktop/My Projects/able_dev/whisper-mint/whisper/lib/python3.9/site-packages/torch/lib"
export CUDA_HOME=${CUDA_HOME}:"/home/user/Desktop/My Projects/able_dev/whisper-mint/whisper/lib/python3.9/site-packages/torch/cuda"
sounce ~/.zshrc
npx nodemon --watch src src/able.js