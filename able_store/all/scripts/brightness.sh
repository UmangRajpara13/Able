#!/bin/bash

displays=()

xrandr -q | grep " connected" | cut -d " " -f 1