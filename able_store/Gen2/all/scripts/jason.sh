#!/bin/bash

if pgrep -x "code" > /dev/null
then
    # VSCode is already running, focus on it
    wmctrl -a "Visual Studio Code"
else
    # VSCode is not running, launch a new window
    code &
fi
