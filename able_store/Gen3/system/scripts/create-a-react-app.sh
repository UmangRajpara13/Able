#!/bin/bash

# Set directory path
directory_path="$HOME/Desktop/My Projects"

while true; do
  # Prompt user for directory name
  directory_name=$(zenity --entry --text "What would you like to call this React App?") 

  # Check if directory name is empty
  if [ -z "$directory_name" ]; then
    zenity --error --text "App name cannot be empty!" --width 500
    continue
  fi

  # Check if directory already exists
  if [ -d "$directory_path/$directory_name" ]; then
    zenity --error --text "App with same name already exists!" --width 500
    continue
  fi

  # Create directory
  mkdir -p "$directory_path/$directory_name"
  cd "$directory_path"
  
  # gnome-terminal -- sh -c "npx create-react-app "$directory_name" --template typescript && code "$directory_path/$directory_name"; exit" &
  # gnome-terminal -- sh -c "sleep 3; exit";
  xterm -fa 'Monospace' -fs 11 -bg '#282c34' -fg '#abb2bf' -e "npx create-react-app "$directory_name" --template typescript;"

  # Display a yes/no dialog box
  zenity --question --text "Do you want to create a repository on remote for project \"$directory_name?\"" --width 500

  # Check the exit status of the dialog box
  if [[ $? -eq 0 ]]; then
      # Display another yes/no dialog box
      zenity --question --text "Do you want to make this remote repository Private?" --width 500

      if [[ $? -eq 0 ]]; then
          echo "create a private repository"   
          gh repo create "$directory_name" --private
      else
          # User selected "No", continue with rest of script
          echo "create a public repository" 
          gh repo create "$directory_name" --public
      fi  
  else
      # User selected "No", continue with rest of script
      echo "Continuing with rest of script"
  fi
  git remote add origin git@github.com:"$ls"/sonic.git
  code "$directory_path/$directory_name"

  # Exit loop
  break
done

