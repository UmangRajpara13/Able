#!/bin/bash

# Set directory path
directory_path="$HOME/Desktop/My Projects"

while true; do
  # Prompt user for directory name
  directory_name=$(zenity --entry --text "What would you like to call React App?")

  # Check if directory name is empty
  if [ -z "$directory_name" ]; then
    zenity --error --text "App name cannot be empty!"
    continue
  fi

  # Check if directory already exists
  if [ -d "$directory_path/$directory_name" ]; then
    zenity --error --text "App with same name already exists!"
    continue
  fi

  # Create directory
  mkdir -p "$directory_path/$directory_name"
  cd "$directory_path"
  
  # gnome-terminal -- sh -c "npx create-react-app "$directory_name" --template typescript && code "$directory_path/$directory_name"; exit" &
  # gnome-terminal -- sh -c "sleep 3; exit" && code "$directory_path/$directory_name";
  xterm -fa 'Monospace' -fs 11 -bg '#282c34' -fg '#abb2bf' -e "npx create-react-app "$directory_name" --template typescript;" && code "$directory_path/$directory_name";
  # Exit loop
  break
done

