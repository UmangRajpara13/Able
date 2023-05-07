#!/bin/bash

WINDOW_ID="$1"

# Get the position of the mouse pointer
eval $(xdotool getmouselocation --shell)

# Get information about the connected monitors
MONITOR_INFO=$(xrandr | grep ' connected')

# Loop through the monitor information to find the monitor that the mouse is on
while read -r MONITOR; do
  # Extract the position and size of the monitor using a regular expression
#   echo $MONITOR
  if [[ $MONITOR =~ ^(.*)\ connected(\ primary)?\ ([0-9]+)x([0-9]+)\+([0-9]+)\+([0-9]+) ]]; then
    MONITOR_NAME="${BASH_REMATCH[1]}"
    MONITOR_WIDTH="${BASH_REMATCH[3]}"
    MONITOR_HEIGHT="${BASH_REMATCH[4]}" 
    MONITOR_X="${BASH_REMATCH[5]}"
    MONITOR_Y="${BASH_REMATCH[6]}"

    # echo "${BASH_REMATCH[1]},${BASH_REMATCH[2]},${BASH_REMATCH[3]},${BASH_REMATCH[4]}"

    # echo $MONITOR_NAME,$MONITOR_WIDTH,$MONITOR_X,$MONITOR_Y,

    # Check if the mouse is within the bounds of this monitor
    if (( X >= MONITOR_X && X <= MONITOR_X + MONITOR_WIDTH && Y >= MONITOR_Y && Y <= MONITOR_Y + MONITOR_HEIGHT )); then
      # Move the window to this monitor
      # echo $MONITOR_X,$MONITOR_Y
      xdotool windowmove $WINDOW_ID $MONITOR_X $MONITOR_Y

      # Exit the loop
      break
    fi
  fi
done <<< "$MONITOR_INFO"
