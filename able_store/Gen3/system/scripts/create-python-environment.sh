#!/bin/bash

# Get the list of available Python versions
python_versions=($(ls /usr/bin/python* | sort -u))

# Prompt the user to select a Python version
selected_version=$(zenity --list \
                        --title="Select Python Version $PWD" \
                        --text="Select the Python version for the virtual environment:" \
                        --column="Version" "${python_versions[@]}")


# Check if a version was selected
if [ -n "$selected_version" ]; then
    # Create a virtual environment using the selected Python version
    python_path="/usr/bin/$selected_version"
    venv_name="myenv"
    venv_dir="$venv_name"
    
    # Check if the virtual environment directory already exists
    if [ -d "$venv_dir" ]; then
        zenity --error --text="Virtual environment directory already exists: $venv_dir"
        exit 1
    fi
    
    # Create the virtual environment
    $python_path -m venv "$venv_dir"
    
    # Activate the virtual environment
    source "$venv_dir/bin/activate"
    
    # Show success message
    zenity --info --text="Virtual environment '$venv_name' created and activated!"
else
    zenity --info --text="No Python version selected. Exiting..."
fi
