import { WebSocketServer } from "ws";
import { execSync, exec, spawn, spawnSync } from "child_process";
import { homedir } from "os";
import { join } from "path";
import chalk from "chalk";
<<<<<<< Updated upstream:src/socketIO.js
import { WMCtrl } from "./WmCtrl/WmCtrl.js";
import { appendFile } from "fs";
import { watch } from "chokidar";
import { readJson, outputJSONSync } from "fs-extra/esm";
import { ActionProcessor, CrawlWeb } from "./sentenceProcessor.js";
import { cwd } from "process";
=======
// import { MessageHandlerGen2 } from "./Generations/Gen2/MessageHandlerGen2.js";
import { MessageHandlerGen3 } from "./Generations/Gen3/MessageHandlerGen3.js";
import { CommandProcessor, scheduledTask } from "./Generations/Gen3/commandProcessor.js";
>>>>>>> Stashed changes:src/webSocketIO.js

import { readFileSync } from 'fs';
import https from 'https'
import { join } from "path";
import { cwd } from "process";

<<<<<<< Updated upstream:src/socketIO.js
const wm = new WMCtrl();
var globalActions, globalActionsKeys, allActions = {}, allActionsKeys = []
var wss, wssDev, sttpid, wsMap = new Map(), wsMapDev = new Map(), wsChannel = 'production', awareness = {}

var interrogativeWords = [
  "what",
  "which",
  "when",
  "where",
  "how",
  "whom",
  "who",
  "weather",
  "why",
  "whose",
];

var nativeActions = ['switch-to-development', 'switch-to-production', 'open-your-source-code']
var sttRecipient = null

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

// read actions 
const globalWatcher = watch(join(process.cwd(), 'able_store/'))

globalWatcher.on('all', (event, path) => {
  // console.log(path) 
  // if (path != 'global/global.json') return
  try {
    if (path.endsWith('.json')) {
      readJson(path, (err, file) => {
        // console.log(file, Object.keys(file))
        if (err) return
        // allActions = { ...allActions, {appKey:appObject}        }; // Objects
        if (path == join(process.cwd(), 'able_store/all/global.json')) {
          globalActions = file.global; // Objects
          globalActionsKeys = Object.keys(globalActions); // its an array
          console.log('added Global Actions')
        } else {
          var appKey = Object.keys(file)[0]
          var appObject = file[`${appKey}`]
          allActions[appKey] = appObject
          allActionsKeys = allActionsKeys.concat(Object.keys(appObject))
          console.log(`added Actions for app, ${Object.keys(allActions)}`)
        }
      });
    }
  } catch (error) { }
})



function SetupWebSocketServer(port) {
  wss.on("connection", async (ws, req) => {
    console.log(`Connection Established! -> (PORT=${port})`);
    ws = ws;

    ws.on("close", () => { console.log("Connection Closed"); });
=======
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
>>>>>>> Stashed changes:src/webSocketIO.js

    ws.on("error", (error) => { console.log(`!!! Connection Failed ${error}`); });

    var query, raw, action;

    ws.on("message", async (recievedData) => {
      (raw = "");
      var message = `${recievedData}`

<<<<<<< Updated upstream:src/socketIO.js
=======
      message = JSON.parse(`${recievedData}`)
>>>>>>> Stashed changes:src/webSocketIO.js

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
<<<<<<< Updated upstream:src/socketIO.js
          query = message.split(":")[1].trim().toLowerCase();

          console.log(chalk.blue(`\n${recievedData}\n`));

          raw = query
            .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "")
            .replace(/\s{2,}/g, " ");

          if (raw.length == 0) return;

          process.stdout.write(chalk.yellow(`(raw) ${raw} `));

          action = raw.replaceAll(" ", "-");
          var commandObj

          // check if its a Question
          if (interrogativeWords.some((startString) => query.startsWith(startString)) |
            query.endsWith("?") |
            query.startsWith("google")
          ) {
            // if query ends with ? and its a command.
            if (query.endsWith('?') &&
              (globalActionsKeys.includes(action) || allActionsKeys.includes(action))) {
              commandObj = globalActions[action] || allActions[action]
              ActionProcessor(commandObj)
              return
            }

            if (query.startsWith("google"))
              query = query.replace("google", "").trim();

            // open(`https://www.google.com/search?q=${query}`)
            CrawlWeb(query)


          } else {
            // Native, Global, API, CLI

            // check if its native action
            if (nativeActions.includes(action)) {
              process.stdout.write(chalk.green(`(Native) ${action} `));

              switch (action) {
                case "switch-to-development":
                  wsChannel = 'development'
                  break;
                case "switch-to-production":
                  wsChannel = 'production'
                  break;
                case "open-your-source-code":
                  // execSync(`kill -9 ${sttpid}`);
                  spawn('code', ['-r', '.'], { cwd: cwd(), detached: true, stdio: 'ignore' })
                  // execSync(`fuser -k 1111/tcp`, (error, stdout, stderr) => {
                  //   console.log(stdout);
                  //   console.log(stderr);
                  //   if (error !== null) {
                  //     console.log(`exec error: ${error}`);
                  //   }
                  // });
                  // execSync(`fuser -k 2222/tcp`, (error, stdout, stderr) => {
                  //   console.log(stdout);
                  //   console.log(stderr);
                  //   if (error !== null) {
                  //     console.log(`exec error: ${error}`);
                  //   }
                  // });
                  break;
                default:
                  break;
              }
              return
=======
          scheduledTask.forEach(commandObj => {
            if (commandObj.client == message["id"]) {
              CommandProcessor({ ...commandObj, isScheduledTask: true }, commandObj.client, false,
                wsMap)
>>>>>>> Stashed changes:src/webSocketIO.js
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

              // for (const word of raw.split(' ')) {
              //     if (actionWords.includes(word)) {
              //         actionScript = word
              //         process.stdout.write(chalk.green(`(run) ${actionScript} `));

              //         var activeApp = `${execSync('./activeApp.sh')}`
              //         console.log(activeApp)
              //         activeApp = activeApp.split('=')[1].split(',')[1].replaceAll('"', '').trim()
              //         const execute = spawn(`./${actionScript}.sh`, [`ActiveApp=${activeApp}`], {
              //             cwd: join(process.cwd(), './able_scripts'),
              //         })

              //         execute.stdout.on('data', (data) => {
              //             process.stdout.write(`<< ${data} `.replace('\n', ''));
              //             var appName = `${data}`.split(':')[0]
              //             var api = `${data}`.split(':')[1]
              //             wsMap.get(appName) ? wsMap.get(appName).send(`${api}`) :
              //                 process.stdout.write(chalk.red('NO WebSocket Connection Available!'))

              //         });

              //         execute.stderr.on('data', (data) => {
              //             console.error(`stderr: ${data}`);
              //         });

              //         execute.on('close', (code) => {
              //             code == 0 ?
              //                 process.stdout.write(chalk.green(`| Exit Code ${code}`)) :
              //                 process.stdout.write(chalk.bgRed(`| Exit Code ${code}`));
              //         });

              //         break
              //     }
              // }
            }
          }
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
}

function SetupWebSocketDevServer(port) {
  wssDev.on("connection", async (ws, req) => {
    console.log(`DEV Connection Established! -> (PORT=${port})`);
    ws = ws;

    ws.on("close", () => {
      console.log("DEV Connection Closed");
    });

    ws.on("error", (error) => {
      console.log(`!!! DEV Connection Failed ${error}`);
    });

    ws.on("message", async (recievedData) => {
      var message = `${recievedData}`
      switch (message.split(":")[0]) {
        case `id`:
          console.log(chalk.magenta(`\n${recievedData}\n`));

          if (wsMapDev.get(message.split(":")[1])) {
            var allWsClients = wsMapDev.get(message.split(":")[1]);
            allWsClients.push(ws);
            wsMapDev.set(message.split(":")[1], allWsClients);
          } else {
            wsMapDev.set(message.split(":")[1], [ws]);
          }
          console.log(
            `Services Connected : ${wsMapDev.keys()}, ${wsMapDev.get(message.split(":")[1]).length
            }`
          );
          break;
        case `awareness`:
          console.log(message)
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
        case `switchWsChannel`:
          console.log('switchWsChannel', message.split(":")[1])
          wsChannel = message.split(":")[1] === 'development' ? 'development' : 'production'
          break;
        default:
<<<<<<< Updated upstream:src/socketIO.js
          console.log(`Unhandled DEV-> ${recievedData}`);
=======
          MessageHandlerGen3(message, wsMap)
>>>>>>> Stashed changes:src/webSocketIO.js
          break;
      }
    });
  });

<<<<<<< Updated upstream:src/socketIO.js
export function StartWebSocketServers(argv) {
  // if (argv.stt != "OFF")

=======
  server.listen(1111, () => {
    console.log('Server listening on port 1111');
  });
}
 
>>>>>>> Stashed changes:src/webSocketIO.js

  try {
<<<<<<< Updated upstream:src/socketIO.js
    wss = new WebSocketServer({ port: 1111 });
    SetupWebSocketServer(1111);
    wssDev = new WebSocketServer({ port: 2222 });
    SetupWebSocketDevServer(2222);
=======

    const options = {
      key: readFileSync(join(cwd(),'src/certificates/server.key')),
      cert: readFileSync(join(cwd(),'src/certificates/server.crt'))
    };

    const server = https.createServer(options);
    wss = new WebSocketServer({ server });
    SetupWebSocketServer(server);
>>>>>>> Stashed changes:src/webSocketIO.js
  } catch (error) {
    console.log(`error caught`, error);
  }
}
