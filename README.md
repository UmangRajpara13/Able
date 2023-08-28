<div align="left">

# Voice Interface for Computer #
Add voice commands to any Desktop App, Automation scripts or CLI with system-wide **shared** Speech to Text Engine.​
</div >


#### [Watch Demo](https://youtu.be/WQbUCbn8PN0)


## Features ##

Real-Time transcription - starts recording when a speaker says something, stops recording(after 0.5s) when speaker stops speaking.  

Sharing ASR(speech-to-text) with  

  - Exensions/Plugins/Add-ons for a desktop app (ex. [Code](https://github.com/UmangRajpara13/TalkGPT))    
  - Any Desktop app without integration of extension (ex. [TalkGPT](https://github.com/UmangRajpara13/Code))    

Executes user defined voice commands defined in a simple .json file  

Google Anything - start by saying google followed by 'your_search_query' (ex: Google what the weather outside?)

## Architecture ##

<p align="center">
  <a aria-label="Arrow logo" href="">
    <img src="./assets/able_architecture.png">
  </a>
</p>  

## Software Environment ##

  python 3.9.9  
  Nodejs 18.9  
  OS: Linux (very likely it will work on OSX without any tweaks. On Windows bash scripts(in ./universal-commands/scripts and anywhere in src) will have to converted into batch scripts)  

## Hardware Config used during Development and Execution ##

System Ram : 8Gb (2x4Gb) [Recommended > 16Gb]  
Graphic card : Nvidia Graphics MX350(Pascal Architecture, CUDA capability 6.1, VRAM 2GB)  
Microphone : External Bluetooth Headeset with Microphone Arm (Recommended). Avoid using in-built microphone of your laptop.  

The project uses [Whisper](https://github.com/openai/whisper) by OpenAI which requires the command-line tool [`ffmpeg`](https://ffmpeg.org/) to be installed on your system, which is available from most package managers:


```bash
# on Ubuntu or Debian
sudo apt update && sudo apt install ffmpeg

# on Arch Linux
sudo pacman -S ffmpeg

# on MacOS using Homebrew (https://brew.sh/)
brew install ffmpeg

# on Windows using Chocolatey (https://chocolatey.org/)
choco install ffmpeg

# on Windows using Scoop (https://scoop.sh/)
scoop install ffmpeg
```


## Installation ##

    git clone git@github.com:UmangRajpara13/able.git
    cd ./able/listen
    python3 -m venv venv
    source "venv/bin/activate"
    pip install -r requirements.txt
    deactivate
    cd ..
    npm install

## Run ##   


#### In 1st Terminal window  

    npm run engine

#### and in 2nd Terminal window.

    npm run listen


Avoid using in-built microphone of your laptop, External headset with Microphone is recommended

