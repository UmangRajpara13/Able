#!/bin/bash

if pgrep "firefox-bin" > /dev/null
then
    # echo "Firefox Developer Edition is running, focusing..."
    wmctrl -a "Firefox Developer Edition"
else
    # echo "Firefox Developer Edition is not running, launching..."
    /opt/firefox/firefox &
    sleep 3
fi