import asyncio
import sys
from websocketInterface import connectWebSocket
import os, signal
import json
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import importlib

MODULE_NAME = "main"

class MyHandler(FileSystemEventHandler):
    print("MyHandler")
        
    def on_any_event(self, event):
        # print("on_any_event..",event.src_path)  

        if event.is_directory:
            return None

        # Check if the event is for a Python file
        if event.event_type == 'modified' and event.src_path.endswith(".py"):
            print("\n Reloading modules...\n")
            # Reload the main module  
            if MODULE_NAME in sys.modules: 
                importlib.reload(sys.modules[MODULE_NAME])

            # Cancel and recreate the async task to start it again with the new code
            # cancel_async_task()
            # start_async_task()   

async def main(frames=100_000_000, channels=1, dtype='float32', **kwargs):
    
    print(sys.argv[1:],os.getppid(),os.getpid())
    # Start the watchdog observer
    observer = Observer()
    observer.schedule(MyHandler(), path='.', recursive=True)
    observer.start()

    await asyncio.create_task(connectWebSocket("ws://localhost:"+str(sys.argv[1])))
       
    
 
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join() 


if __name__ == "__main__":
    try:
        # print(sys.modules)
        asyncio.run(main())
        # main()

    except KeyboardInterrupt:
        sys.exit('Interrupted by user!\n')
