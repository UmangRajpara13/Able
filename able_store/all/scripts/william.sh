#!/bin/bash

if pgrep "firefox" > /dev/null
then
    # echo "Firefox Developer Edition is running, focusing..."
    wmctrl -a "Firefox"
else
    # echo "Firefox Developer Edition is not running, launching..."
    /opt/firefox/firefox &
    sleep 3
fi