#!/bin/bash

# echo -e "-----Start Of Script-----\n"

# for ARGUMENT in "$@"
# do
#    KEY=$(echo $ARGUMENT | cut -f1 -d=)

#    KEY_LENGTH=${#KEY}
#    VALUE="${ARGUMENT:$KEY_LENGTH+1}"

#    export "$KEY"="$VALUE"
# done

# # use here your expected variables

# # send api call to currently focused app as -> echo "$ActiveApp:<API>"

# # init empty arrays

# # if runnig -> open all windows
# # if ! running -> open new window

# isJennyActivated=false

# COUNTER=0

# winIDs=()
# for id in $WindowIDs; do
#   winIDs+=($id)
# done
# echo $WindowIDs
# for name in $WindowClassNames; do
#     echo $name
#     if [[ "$ActiveApp" == "$name" ]]
#     then
#         echo "switch to ${winIDs[$COUNTER]}"
#         wmctrl -i -a ${winIDs[$COUNTER]}
#         isJennyActivated=true
#     fi
#     COUNTER=$[$COUNTER +1]
# done

# if [[ "$isJennyActivated" != true ]]
# then
#     # echo statement is executed by able 
#     echo -e "run:nautilus"
# fi

# echo -e "\n-----End Of Script-----\n"

#!/bin/bash

# Check if Nautilus is already running
#!/bin/bash

# Check if Nautilus is already running
# if wmctrl -x -l | grep -i "org.gnome.Nautilus.Org.gnome.Nautilus" > /dev/null
# then
#     # Nautilus is already running, activate the window
#     wmctrl -x -a "org.gnome.Nautilus.Org.gnome.Nautilus"

#     # Get the current monitor where the mouse is present
#     current_monitor=$(xdotool getdisplaygeometry | awk '{print $1}')

#     # Get the monitor where Nautilus is currently displayed
#     nautilus_monitor=$(wmctrl -x -lG | grep -i "org.gnome.Nautilus.Org.gnome.Nautilus" | awk '{print $2}' | grep -n -w -m 1 "$(wmctrl -x -d | awk '{print $6}')" | awk -F: '{print $1}')

#     # If Nautilus is not on the current monitor, move it
#     if [[ $current_monitor != $nautilus_monitor ]]
#     then
#         wmctrl -x -r "org.gnome.Nautilus.Org.gnome.Nautilus" -e 0,0,0,-1,-1
#     fi
# else
#     # Nautilus is not running, start it
#     nautilus &
# fi

#!/bin/bash

# Check if Nautilus is already running
if wmctrl -x -l | grep -i "org.gnome.Nautilus.Org.gnome.Nautilus" > /dev/null
then
    # Nautilus is already running, activate the window
    wmctrl -x -a "org.gnome.Nautilus.Org.gnome.Nautilus"

    # Get the current monitor where the mouse is present
    current_monitor=$(xdotool getdisplaygeometry | awk '{print $1}')

    # Get the position and size of the Nautilus window
    nautilus_geom=$(wmctrl -x -lG | grep -i "org.gnome.Nautilus.Org.gnome.Nautilus" | awk '{print $3 " " $4 " " $5 " " $6}')

    # Get the position and size of the current monitor
    current_geom=$(xdotool getdisplaygeometry --screen $current_monitor | awk '{print $3 " " $4}')

    # If Nautilus is not on the current monitor, move it
    if [[ $nautilus_geom != *"$current_geom"* ]]
    then
        # Calculate the new position of the Nautilus window
        read nautilus_x nautilus_y nautilus_width nautilus_height <<< $nautilus_geom
        read current_width current_height <<< $current_geom
        new_nautilus_x=$((current_width / 2 - nautilus_width / 2))
        new_nautilus_y=$((current_height / 2 - nautilus_height / 2))

        # Move the Nautilus window to the new position
        wmctrl -x -r "org.gnome.Nautilus.Org.gnome.Nautilus" -e 0,$new_nautilus_x,$new_nautilus_y,-1,-1
    fi
else
    # Nautilus is not running, start it
    nautilus &
fi

