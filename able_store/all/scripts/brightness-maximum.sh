#!/bin/bash

# Get list of active monitors
monitor_list=$(xrandr --listactivemonitors | awk '{print $4}')

# Store monitor list as a string
IFS=$'\n' monitors=$monitor_list

# Loop through monitors and set brightness to maximum
for monitor in $monitors
do
    xrandr --output "$monitor" --brightness 1.0
done
