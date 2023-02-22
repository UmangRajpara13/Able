#!/bin/bash


# Set directory path
directory_path="$HOME/Desktop/My Projects"


# Prompt user for directory name
directory_name=$(zenity --entry --text "Enter the name of New Project")

# Check if directory name is empty
if [ -z "$directory_name" ]; then
  zenity --error --text "Directory name cannot be empty"
  exit 1
fi

# Create directory
mkdir -p "$directory_path/$directory_name"

# Open directory in Nautilus
nautilus "$directory_path/$directory_name"