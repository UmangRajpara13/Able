import asyncio
import sys
from websocketInterface import connectWebSocket
import os, signal
import json


def handler(signum, frame):
    signame = signal.Signals(signum).name
    print(f'Signal handler called with signal {signame} ({signum})')
    deregisterTranscriptionPid()
    # raise OSError("Couldn't open device!")


def deregisterTranscriptionPid(signum, frame):
    signame = signal.Signals(signum).name

    print(f'Signal handler called with signal {signame} ({signum})')
    sys.exit('\nInterrupted by user')

    # os.remove("action.wav")

    # # Load JSON file
    # with open('pid.json', 'r') as f:
    #     data = json.load(f)

    # # Delete key from dictionary
    # if 'sttPid' in data:
    #     del data['sttPid']

    # # Write updated data to JSON file
    # with open('pid.json', 'w') as f:
    #     json.dump(data, f)
        
    # sys.exit('\nInterrupted by user')

signal.signal(signal.SIGHUP,deregisterTranscriptionPid)

async def registerTranscriptionPid():
    # Load JSON file
    with open('pid.json', 'r') as f:
        data = json.load(f)

    # Add new key-value pair
    data['sttPid'] = os.getpid()

    # Write updated data to JSON file
    with open('pid.json', 'w') as f:
        json.dump(data, f)


async def main(frames=100_000_000, channels=1, dtype='float32', **kwargs):
    print(sys.argv[1:],os.getpid())
    await registerTranscriptionPid()
    await connectWebSocket("ws://localhost:"+str(sys.argv[1]))

    # await record_buffer(**kwargs)

if __name__ == "__main__":
    try:
        print(sys.argv[1:],os.getppid(),os.getpid())
        asyncio.run(main())
    except KeyboardInterrupt:
        deregisterTranscriptionPid()
