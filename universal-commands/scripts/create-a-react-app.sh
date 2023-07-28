#!/bin/bash

# Set directory path
project_path="$HOME/Desktop/My Projects"

while true; do
    # Prompt user for directory name
    project_name=$(zenity --entry --text "What would you like to call this React App?") 

    # Check if directory name is empty
    if [ -z "$project_name" ]; then
        zenity --error --text "App name cannot be empty!" --width 500
        continue
    fi

    # Check if directory already exists
    if [ -d "$project_path/$project_name" ]; then
        zenity --error --text "App with same name already exists!" --width 500
        continue
    fi

    # Create directory
    mkdir -p "$project_path/$project_name"
    cd "$project_path/$project_name"

    gnome-terminal -- sh -c "npx create-react-app client --template typescript;"
    # xterm -fa 'Monospace' -fs 11 -bg '#282c34' -fg '#abb2bf' -e "npx create-react-app client --template typescript;"

    # Display a yes/no dialog box
    zenity --question --text "Do you want to create a repository with name "${project_name// /-}" for project \"$project_name?\"" --width 500

    # Check the exit status of the dialog box
    if [[ $? -eq 0 ]]; then

        git init;
        git branch -m main;
        
        zenity --question --text "Do you want to make this remote repository Private?" --width 500

        if [[ $? -eq 0 ]]; then
            echo "creating a private repository"   
            while true; do
                create_private_repo=$(gh repo create "${project_name// /-}" --private 2>/tmp/error.txt)
                
                if [ $? -ne 0 ]; then
                    # Read the error message from the temporary file
                    error_message=$(cat /tmp/error.txt)

                    # Display the error message using Zenity
                    zenity --error --text="$error_message"

                    # Clean up the temporary file
                    rm /tmp/error.txt
                else
                    # No error occurred, display a success message using Zenity
                    break
                fi
            done
        else
            # User selected "No", continue with rest of script
            echo "creating a public repository" 
            while true; do
                create_public_repo=$(gh repo create "${project_name// /-}" --public 2>/tmp/error.txt)

                if [ $? -ne 0 ]; then
                # Read the error message from the temporary file
                error_message=$(cat /tmp/error.txt)

                # Display the error message using Zenity
                zenity --error --text="$error_message"

                # Clean up the temporary file
                rm /tmp/error.txt
                else
                    # No error occurred, display a success message using Zenity
                    break
                fi
            done
        fi  
        
        while true; do

            github_userinfo=$(gh api user 2>/tmp/error.txt)
            # Check if there was an error
            if [ $? -ne 0 ]; then
                # Read the error message from the temporary file
                error_message=$(cat /tmp/error.txt)

                # Display the error message using Zenity
                zenity --error --text="$error_message"

                # Clean up the temporary file
                rm /tmp/error.txt
            else
                # No error occurred, display a success message using Zenity
                github_username=$(echo "$github_userinfo" | grep '"login"' | cut -d '"' -f 4);
                git remote add origin git@github.com:"$github_username"/"${project_name// /-}".git;
               
                break
            fi
        done

    else
        # User selected "No", continue with rest of script
        echo "Continuing with rest of the script"
    fi
    
    # git fetch origin;
    # git push -u origin main;
    
    code "$project_path/$project_name"

    # Exit loop
    break
done

