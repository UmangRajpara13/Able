#!/bin/bash

WINDOW_CLASS="$1"

window_id=$(wmctrl -l -x | awk '{print $1,$3}' | grep "$WINDOW_CLASS" | awk "{print \$1}")
echo "$window_id"