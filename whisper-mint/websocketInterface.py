import asyncio
from websockets import connect

ws = None


async def connectWebSocket(uri, ):
    global ws
    ws = await connect(uri)


async def send(msg):
    await ws.send(msg)
