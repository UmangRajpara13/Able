import { WebSocketServer } from "ws";

import chalk from "chalk";
import { MessageHandlerGen2 } from "./Gens/Gen2/MessageHandlerGen2.js";
import { MessageHandlerGen3 } from "./Gens/Gen3/MessageHandlerGen3.js";


var wss
var wsMap = new Map()
var message



function SetupWebSocketServer(port) {

  wss.on("connection", async (ws, req) => {
    console.log(`Connection Established! -> (PORT=${port})`);
    ws = ws;
    // console.log(ws)
    ws.on("close", (wsc) => {
      console.log("Connection Closed", wsc["_closeCode"], wsMap.keys());

      wsMap.forEach((value, key, map) => {
        // console.log('before', key)
        var tmpArr = []
        wsMap.get(key).forEach(client => {
          if (!client["_socket"]["_readableState"]["ended"]) {
            tmpArr.push(client)
          }
        })
        // console.log(tmpArr.length)

        wsMap.set(key, tmpArr)
       
      })
    });

    ws.on("error", (error) => { console.log(`!!! Connection Failed ${error}`); });


    ws.on("message", async (recievedData) => {

      message = `${recievedData}`

      switch (message.split(":")[0]) {
        case 'id':
          console.log(chalk.magenta(`\n${recievedData}\n`));

          if (wsMap.get(message.split(":")[1])) {
            var allWsClients = wsMap.get(message.split(":")[1]);
            allWsClients.push(ws);
            wsMap.set(message.split(":")[1], allWsClients);
          } else {
            wsMap.set(message.split(":")[1], [ws]);
          }
          console.log(
            `Services Connected : ${wsMap.get(message.split(":")[1])}, ${wsMap.get(message.split(":")[1]).length
            }`
          );
          break;

        default:
          // MessageHandlerGen2(message, wsMap)
          MessageHandlerGen3(message, wsMap)
          break;
      }
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
