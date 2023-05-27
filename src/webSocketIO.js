import { WebSocketServer } from "ws";
import chalk from "chalk";
import { MessageHandlerGen3 } from "./Generations/Gen3/MessageHandlerGen3.js";
// import { CommandProcessor, scheduledTask } from "./Generations/Gen3/commandProcessor.js";
import { readFileSync } from 'fs';
import https from 'https'
import { join } from "path";
import { cwd } from "process";

var wss
var wsMap = new Map()
var focusedClientId = null

function SetupWebSocketServer(server) {

  wss.on("connection", async (ws, req) => {
    console.log(`Connection Established! -> (PORT=1111)`);
    ws = ws;

    ws.on("close", (wsc) => {
      console.log("Connection Closed");

      wsMap.forEach((value, key, map) => {
        var tmpArr = []
        wsMap.get(key).forEach(client => {
          if (!client["_socket"]["_readableState"]["ended"]) {
            tmpArr.push(client)
          }
        });
        wsMap.set(key, tmpArr)
      })
    });

    ws.on("error", (error) => { console.log(`!!! Connection Failed ${error}`); });

    var query, raw, action;

    ws.on("message", async (recievedData) => {
      (raw = "");
      var message = `${recievedData}`

      message = JSON.parse(`${recievedData}`)

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
          // console.log(scheduledTask)
          // scheduledTask.forEach(commandObj => {
          //   if (commandObj.client == message["id"]) {
          //     CommandProcessor({ ...commandObj, isScheduledTask: true }, commandObj.client, false,
          //       wsMap)
          //   }
          // })

          console.log(
            `Services Connected : ${wsMap.get(message["id"])}, ${wsMap.get(message["id"]).length
            }`
          );
          break;
        case 'focusedClientId':
          focusedClientId = message["focusedClientId"];
          break;
        default:
          MessageHandlerGen3(message, wsMap, focusedClientId)
          break;
      }
    });
  });
  server.listen(1111, () => {
    console.log('Server listening on port 1111');
  });
}



export function StartWebSocketServer() {

  try {

    const options = {
      key: readFileSync(join(cwd(), 'src/certificates/server.key')),
      cert: readFileSync(join(cwd(), 'src/certificates/server.crt'))
    };

    const server = https.createServer(options);
    wss = new WebSocketServer({ server });
    SetupWebSocketServer(server);
  } catch (error) {
    console.log(`error caught`, error);
  }
}
