#!/bin/bash

# Set directory path
directory_path="$HOME/Desktop/My Projects"

while true; do
  # Prompt user for directory name
  directory_name=$(zenity --entry --text "What would you like to call this project?")

  # Check if directory name is empty
  if [ -z "$directory_name" ]; then
    zenity --error --text "Directory name cannot be empty"
    continue
  fi

  # Check if directory already exists
  if [ -d "$directory_path/$directory_name" ]; then
    zenity --error --text "Directory already exists"
    continue
  fi

  # Create directory
  mkdir -p "$directory_path/$directory_name"

  # Prompt user to open in Visual Studio Code
  if zenity --question --text "Do you want to open the directory in Visual Studio Code?"; then
    # Open directory in Visual Studio Code
    code "$directory_path/$directory_name"
  else
    # Open directory in Nautilus
    nautilus "$directory_path/$directory_name"
  fi

  # Exit loop
  break
done
