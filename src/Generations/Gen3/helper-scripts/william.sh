#!/bin/bash -x

if pgrep "firefox" > /dev/null
then
    echo "Firefox Developer Edition is running, focusing..."
    wmctrl -a "Firefox"
    exit
else
    echo "Firefox Developer Edition is not running, launching..."
    /opt/firefox/firefox &
    sleep 4
    exit
fi
