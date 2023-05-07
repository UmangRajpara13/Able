import { WebSocketServer } from "ws";
import { execSync, exec, spawn, spawnSync } from "child_process";
import { homedir } from "os";
import chalk from "chalk";
// import { MessageHandlerGen2 } from "./Generations/Gen2/MessageHandlerGen2.js";
import { MessageHandlerGen3 } from "./Generations/Gen3/MessageHandlerGen3.js";
import { CommandProcessor, scheduledTask } from "./Generations/Gen3/commandProcessor.js";

import { readFileSync } from 'fs';
import https from 'https'
import { join } from "path";
import { cwd } from "process";

var wss
var wsMap = new Map()
var message 

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

      switch (message.split(":")[0]) {
        case `id`:
          console.log(chalk.magenta(`\n${recievedData}\n`));

          if (wsMap.get(message.split(":")[1])) {
            var allWsClients = wsMap.get(message.split(":")[1]);
            allWsClients.push(ws);
            wsMap.set(message.split(":")[1], allWsClients);
          } else {
            wsMap.set(message.split(":")[1], [ws]);
          }
          console.log(
            `Services Connected : ${wsMap.keys()}, ${wsMap.get(message.split(":")[1]).length
            }`
          );
          break;
        case `stt`:

          appendFile(
            "record.txt",
            `${message.split(":")[1].trim()}\n`,
            (err) => {
              if (err) throw err;
              // console.log('The "data to append" was appended to file!')
            }
          );

          query = message.split(":")[1].trim();
          process.stdout.write(chalk.yellow(`${wsChannel === 'development' ? `[ D ]` : `[ P ]`}`));

          // if sttRecipient return
          if (sttRecipient) {
            console.log(chalk.yellowBright(`redirecting \n${recievedData}\n`));

            wsChannel === 'development' ? wsMapDev?.get(sttRecipient)?.forEach((client) => {
              // console.log(client)
              client.send(`sttRedirect,${query}`);
            }) : wsMap?.get(sttRecipient)?.forEach((client) => {
              // console.log(client)
              client.send(`sttRedirect,${query}`);
            })
            return
          }
          scheduledTask.forEach(commandObj => {
            if (commandObj.client == message["id"]) {
              CommandProcessor({ ...commandObj, isScheduledTask: true }, commandObj.client, false,
                wsMap)
            }
            // check if its global action
            if (globalActionsKeys.includes(action)) {
              process.stdout.write(chalk.green(`(Global) ${action} `));


              //   var allWindow = await wm.getWindows();
              //   allWindow = allWindow.map((winObj) => winObj.className);
              //   var allWindowIDs = allWindow.map((winObj) => winObj.id);
              //   var activeApp = `${execSync("./activeApp.sh")}`;

              //   activeApp = activeApp
              //     .split("=")[1]
              //     .split(",")[1]
              //     .replaceAll('"', "")
              //     .trim();
              commandObj = globalActions[action]
              ActionProcessor(commandObj, wsChannel, undefined,
                wsMap, wsMapDev)

              return
            } else {

              // var command = raw.replaceAll(" ", "-");
              var activeApp = `${execSync("./src/helper-scripts/activeApp.sh")}`
                .split("=")[1]
                .replace(", ", ".")
                .replaceAll('"', "")
                .trim();


              if (!allActions[activeApp]) return
              if (!allActions[activeApp][action]) return

              process.stdout.write(chalk.grey(`(App) ${activeApp} (action) ${action}`));

              commandObj = allActions[activeApp][action]

              console.log(commandObj)

              ActionProcessor(commandObj, wsChannel, activeApp,
                wsMap, wsMapDev)

            }
          })
          break;
        case `sttpid`:
          sttpid = message.split(":")[1];
          console.log(sttpid)
          break;
        case `awareness`:
          const tmp = JSON.parse(message.substring(message.indexOf(':') + 1))
          awareness = { ...awareness, [Object.keys(tmp)[0]]: Object.values(tmp)[0] }
          globalActions = Object.assign({}, globalActions, Object.values(tmp)[0]["actions"])
          var newActions = Object.keys(Object.values(tmp)[0]["actions"])
          newActions = newActions.map(action => action)
          globalActionsKeys = globalActionsKeys.concat(newActions); // its an array
          break;
        case `requestSTT`:
          sttRecipient = JSON.parse(message.substring(message.indexOf(':') + 1))["recipient"]
          console.log('requestSTT', sttRecipient)

          break;
        case `surrenderSTT`:
          console.log('surrenderSTT', JSON.parse(message.substring(message.indexOf(':') + 1))["recipient"])
          sttRecipient = null
          break;
        default:
          console.log(`Unhandled PROD-> ${recievedData}`);
          break;
      }
    });
  });
  server.listen(1111, () => {
    console.log('Server listening on port 1111');
  });
}

 

export function StartWebSocketServer(){

  try {

    const options = {
      key: readFileSync(join(cwd(),'src/certificates/server.key')),
      cert: readFileSync(join(cwd(),'src/certificates/server.crt'))
    };

    const server = https.createServer(options);
    wss = new WebSocketServer({ server });
    SetupWebSocketServer(server);
  } catch (error) {
    console.log(`error caught`, error);
  }
}
