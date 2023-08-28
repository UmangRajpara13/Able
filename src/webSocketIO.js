import { WebSocketServer } from "ws";
import chalk from "chalk";
import { MessageHandlerGen3 } from "./Generations/MessageHandlerGen3.js";

var wsMap = new Map()
var focusedIdentifier = null
var focusedConnectionId = null

function SetupWebSocketServer(wss) {

  wss.on("connection", async (ws, req) => {
    console.log(`Connection Established! -> (PORT=1111)`);
    // ws = ws;
    // console.log(ws)
    ws.on("close", (wsc) => {
      console.log("Connection Closed");

      wsMap.forEach((connections, identifier, map) => {
        // console.log(clients)

        connections.forEach((client, timeStamp, map) => {
          // console.log(client)
          // console.log(timeStamp)

          if (client["_socket"]["_readableState"]["ended"]) {
            wsMap.get(identifier).delete(timeStamp)
          }
        })
      })
    });

    ws.on("error", (error) => { console.log(`!!! Connection Failed ${error}`); });

    ws.on("message", async (recievedData) => {

      // var dataPacket = `${recievedData}`

      const dataPacket = JSON.parse(`${recievedData}`)
      // console.log(dataPacket)

      switch (Object.keys(dataPacket)[0]) {
 
        case 'registerConnection':


          const connection = dataPacket["registerConnection"]

          console.log(chalk.magenta(`\n${connection["identifier"]},${connection["connectionId"]}\n`));

          if (wsMap.get(connection["identifier"])) {

            const clientMap = wsMap.get(connection["identifier"])
            clientMap.set(connection['connectionId'], ws)
            // console.log(clientMap.keys())
            wsMap.set(connection["identifier"], clientMap);

          } else {
            const clientMap = new Map()
            clientMap.set(connection['connectionId'], ws)
            wsMap.set(connection["identifier"], clientMap);
          }
          if (connection.isWindowFocused) {
            focusedIdentifier = connection.identifier
            focusedConnectionId = connection.connectionId
            console.log(focusedIdentifier, focusedConnectionId)
          }
          console.log(`Services Connected >`, wsMap.keys());
          break;
        case 'windowState':

          const windowState = dataPacket["windowState"]

          console.log(windowState)
          if (windowState.isWindowFocused) {
            focusedIdentifier = windowState.identifier
            focusedConnectionId = windowState.connectionId

            // console.log(focusedIdentifier, focusedConnectionId)

          }
          break;
        default:
          MessageHandlerGen3(dataPacket, wsMap, focusedIdentifier, focusedConnectionId)
          break;
      }
    });
  });
}



export function StartWebSocketServer() {

  try {
    const wss = new WebSocketServer({ port: 1111 });
    SetupWebSocketServer(wss);
  } catch (error) {
    console.log(`error caught`, error);
  }
}
