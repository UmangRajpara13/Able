#!/bin/bash

echo -e "-----Start Of Script-----\n"

for ARGUMENT in "$@"
do
   KEY=$(echo $ARGUMENT | cut -f1 -d=)

   KEY_LENGTH=${#KEY}
   VALUE="${ARGUMENT:$KEY_LENGTH+1}"

   export "$KEY"="$VALUE"
done

# use here your expected variables

# send api call to currently focused app as -> echo "$ActiveApp:<API>"

# init empty arrays

# if runnig -> open all windows
# if ! running -> open new window

isJennyActivated=false

COUNTER=0

winIDs=()
for id in $WindowIDs; do
  winIDs+=($id)
done
echo $WindowIDs
for name in $WindowClassNames; do
    echo $name
    if [[ "$ActiveApp" == "$name" ]]
    then
        echo "switch to ${winIDs[$COUNTER]}"
        wmctrl -i -a ${winIDs[$COUNTER]}
        isJennyActivated=true
    fi
    COUNTER=$[$COUNTER +1]
done

if [[ "$isJennyActivated" != true ]]
then
    # echo statement is executed by able 
    echo -e "run:nautilus"
fi

echo -e "\n-----End Of Script-----\n"
