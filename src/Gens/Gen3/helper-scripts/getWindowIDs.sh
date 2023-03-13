#!/bin/bash

WINDOW_TITLE="$1"

# Search for windows by title and output their IDs
xdotool search --name "$WINDOW_TITLE" | while read -r window_id; do
  echo "$window_id"
done
