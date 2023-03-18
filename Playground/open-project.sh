#!/bin/bash

#!/bin/bash

# Define the directory to search
dir="/home/user/Desktop/My Projects/able_firefox"

# Define the list of extensions to check
extensions=("c" "h" "cpp" "hpp" "py" "js" "html" "css" "json")

escaped_dir=$(echo "$dir" | sed 's/ /\\ /g')
echo $escaped_dir
ls "$dir/*.json"

# Check if VS Code is installed
if [ -x "$(command -v code)" ]; then
  echo Check if there are any programming files in the directory
  for ext in "${extensions[@]}"; do
    # echo "$escaped_dir/*.$ext"
    # $(ls "$escaped_dir/*.$ext")
    $(ls "$dir/*.$ext")
    # if [[ -x $(ls "$escaped_dir/*.$ext") ]]; then
    #   echo Open the directory in VS Code
    #   code "$escaped_dir"
    #   exit
    # fi
  done
else
  # Check if Nautilus is installed
  if [ -x "$(command -v nautilus)" ]; then
    echo Open the directory in Nautilus
    nautilus $escaped_dir
  else
    echo "Neither VS Code nor Nautilus is installed."
  fi
fi

