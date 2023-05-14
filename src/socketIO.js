import { WebSocketServer } from "ws";

import chalk from "chalk";
// import { MessageHandlerGen2 } from "./Gens/Gen2/MessageHandlerGen2.js";
import { MessageHandlerGen3 } from "./Gens/Gen3/MessageHandlerGen3.js";
import { CommandProcessor, scheduledTask } from "./Gens/Gen3/commandProcessor.js";


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
      // console.log(`${recievedData}`)

      message = JSON.parse(`${recievedData}`)
      // console.log(message,Object.keys(message)[0])

      switch (Object.keys(message)[0]) {
        case 'id':
          console.log(chalk.magenta(`\n${message["id"]}\n`));

          if (wsMap.get(message["id"])) {
            var allWsClients = wsMap.get(message["id"]);
            allWsClients.push(ws);
            wsMap.set(message["id"], allWsClients);
          } else {
            wsMap.set(message["id"], [ws]);
          }
          console.log(scheduledTask)
          scheduledTask.forEach(commandObj => {
            if (commandObj.client == message["id"]) {
              CommandProcessor({ ...commandObj, isScheduledTask: true }, commandObj.client, false,
                wsMap)
            }
          })

          console.log(
            `Services Connected : ${wsMap.get(message["id"])}, ${wsMap.get(message["id"]).length
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
