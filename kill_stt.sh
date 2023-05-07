#!/bin/bash

nvidia-smi | grep python | awk '{print $5}' | cut -d '.' -f 1 | while read pid; do
    echo "Killing process with PID $pid"
    kill -9 $pid
done