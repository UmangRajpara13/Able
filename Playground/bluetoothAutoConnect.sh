#!/bin/bash

# Set the Bluetooth device address
DEVICE_ADDR="5C:56:A4:68:4A:3D"

# Attempt to connect to the Bluetooth device
sudo bluetoothctl <<EOF
connect $DEVICE_ADDR
EOF

# # Wait for the connection to be established
sleep 5



# Set the microphone input to the Bluetooth device using PortAudio
pactl set-default-source "bluez_input.5C_56_A4_68_4A_3D.headset-head-unit"

echo "Microphone input set to 5C_56_A4_68_4A_3D"
