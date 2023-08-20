import { WebSocketServer } from "ws";
import chalk from "chalk";
import { MessageHandlerGen3 } from "./Generations/MessageHandlerGen3.js";

var wsMap = new Map()
var focusedIdentifier = null
var focusedConnectionId = null

function SetupWebSocketServer(wss) {

  wss.on("connection", async (ws, req) => {
    console.log(`Connection Established! -> (PORT=1111)`);
    ws = ws;

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

      var message = `${recievedData}`

      message = JSON.parse(`${recievedData}`)

      switch (Object.keys(message)[0]) {
        case 'identifier':

          console.log(chalk.magenta(`\n${message["identifier"]}\n`));

          const timeStamp = Date.now()

          ws.send(JSON.stringify({ connectionId: { timeStamp: timeStamp } }))

          if (wsMap.get(message["identifier"])) {

            const clientMap = wsMap.get(message["identifier"])
            clientMap.set(timeStamp, ws)
            // console.log(clientMap.keys())
            wsMap.set(message["identifier"], clientMap);

          } else {
            const clientMap = new Map()
            clientMap.set(timeStamp, ws)
            wsMap.set(message["identifier"], clientMap);
          }
          console.log(`Services Connected >`, wsMap.keys());
          break;
        case 'windowState':
          console.log(message.windowState)
          if (message.windowState.isWindowFocused) {
            focusedIdentifier = message.windowState.identifier
            focusedConnectionId = message.windowState.connectionId
          }
          console.log(focusedIdentifier, focusedConnectionId)
          break;
        default:
          MessageHandlerGen3(message, wsMap, focusedIdentifier, focusedConnectionId)
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
