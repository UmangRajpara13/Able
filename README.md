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

## Installation ##

    git clone git@github.com:UmangRajpara13/able.git
    cd ./able
    cd ./whisper-mint
    python3 -m venv venv
    pip install -r requirements.txt
    cd..
    npm install

## Run ##

    npm run dev


