<div align="center">

<p align="center">
  <a aria-label="Arrow logo" href="">
    <img src="./assets/128x128.jpeg">
  </a>
</p>  

# Able Voice Assisstant #

</div >

## Developed and tested with ##

  python 3.9.9,
  Nodejs 18.9,
  Nvidia Graphics MX350(Pascal Architecture, CUDA capability 6.1, VRAM 2GB)
  OS: Linux (very likely it will work on OSX without any tweaks. On Windows bash scripts(in able_store/*/scripts and anywhere in src) will have to converted into batch scripts)
  Bluetooth Microphone(Recommended because laptop microphone will pickup external noise very easily and bottleneck transcription service provide by Whisper)

It also requires the command-line tool [`ffmpeg`](https://ffmpeg.org/) to be installed on your system, which is available from most package managers:

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
    cd ./able/whisper-mint
    python3 -m venv .venv
    source ".venv/bin/activate"
    pip install -r requirements.txt
    deactivate
    cd ..
    npm install

## Run ##

    # Option 1 #

        npm run dev

    # Option 2 #

        gnome-terminal -- sh -c "npm run engine_only"
        gnome-terminal -- sh -c "npm run stt_only"



