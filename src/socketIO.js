import { WebSocketServer } from "ws";
import { spawn } from "child_process";

import { MessageHandlerGen2 } from "./Gens/Gen2/MessageHandler.js";


var wss


process.on("SIGINT", () => {

  const killPort = spawn(`bash`, ['killPort.sh'], {
    cwd: './src/helper-scripts',
    detached: true,
    stdio: 'ignore',
  })
  killPort.unref();

  const restart = spawn(`schnell`, ['/home/user/Desktop/My Projects/able_dev/engine.sh'], {
    detached: true,
    stdio: 'ignore',
  })
  restart.unref();
});

function SetupWebSocketServer(port) {
  wss.on("connection", async (ws, req) => {
    console.log(`Connection Established! -> (PORT=${port})`);
    ws = ws;

    ws.on("close", () => { console.log("Connection Closed"); });

    ws.on("error", (error) => { console.log(`!!! Connection Failed ${error}`); });


    ws.on("message", async (recievedData) => {
      MessageHandlerGen2(recievedData,ws)
    });
  });
}


export function StartWebSocketServer(argv) {
  try {
    wss = new WebSocketServer({ port: 1111 });
    SetupWebSocketServer(1111);
  } catch (error) {
    console.log(`error caught`, error);
  }
}
