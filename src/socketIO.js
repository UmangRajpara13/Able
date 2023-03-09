import { WebSocketServer } from "ws";
import { execSync, exec, spawn, spawnSync } from "child_process";
import { homedir } from "os";
import { join } from "path";
import chalk from "chalk";
import { WMCtrl } from "./WmCtrl/WmCtrl.js";
import { appendFile } from "fs";
import { watch } from "chokidar";
import { readJson, outputJSONSync } from "fs-extra/esm";
import { ActionProcessor, CrawlWeb } from "./sentenceProcessor.js";
import { cwd } from "process";


const wm = new WMCtrl();
var globalActions, globalActionsKeys, allActions = {}, allActionsKeys = []
var wss, sttpid, wsMap = new Map(), awareness = {}

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

        var appKey = Object.keys(file)[0]
        var appObject = file[`${appKey}`]
        allActions[appKey] = appObject
        allActionsKeys = allActionsKeys.concat(Object.keys(appObject))

        if (path == join(process.cwd(), 'able_store/all/global.json')) {
          globalActions = file.global; // Objects
          globalActionsKeys = Object.keys(globalActions); // its an array
          console.log('added Global Actions')
        }
      });
    }
    console.log(`added Actions for app, ${Object.keys(allActions)}`)

  } catch (error) { }
})



function SetupWebSocketServer(port) {
  wss.on("connection", async (ws, req) => {
    console.log(`Connection Established! -> (PORT=${port})`);
    ws = ws;

    ws.on("close", () => { console.log("Connection Closed"); });

    ws.on("error", (error) => { console.log(`!!! Connection Failed ${error}`); });

    var query, raw, action;

    ws.on("message", async (recievedData) => {
      (raw = "");
      var message = `${recievedData}`


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
          awareness = { ...awareness, [message.split(":")[1]]: {} }
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

          // if sttRecipient return
          if (sttRecipient) {
            console.log(chalk.yellowBright(`redirecting \n${recievedData}\n`));

            wsMap?.get(sttRecipient)?.forEach((client) => {
              // console.log(client)
              client.send(`sttRedirect,${query}`);
            })
            return
          }
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
                case "open-your-source-code":
                  spawn('code', ['-r', '.'], { cwd: cwd(), detached: true, stdio: 'ignore' })
                  break;
                default:
                  break;
              }
              return
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
              ActionProcessor(commandObj, undefined,
                wsMap)

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

              ActionProcessor(commandObj, activeApp,
                wsMap)

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
          // const dataPacket = JSON.parse(message.substring(message.indexOf(':') + 1))
          // console.log(dataPacket)
          if (dataPacket.type == 'inform') {

            const updatedInfo = Object.assign({}, awareness[dataPacket.id], dataPacket["payload"])
            // console.log(updatedInfo)
            awareness = {
              ...awareness,
              [dataPacket.id]: Object.assign({}, awareness[dataPacket.id],updatedInfo)
            }
            console.log(awareness[dataPacket.id])

          }
          if (dataPacket.type == 'actions') {
            const actions = Object.assign({}, allActions[dataPacket.scope], dataPacket["payload"])
            // console.log(actions)
            allActions = { ...allActions, [dataPacket.scope]: actions }
            // console.log(allActions)  
          }
          globalActions = allActions["global"]
          globalActionsKeys = Object.keys(allActions["global"])
          // console.log(globalActions,globalActionsKeys)
          break;
        case `requestSTT`:
          sttRecipient = JSON.parse(message.substring(message.indexOf(':') + 1))["id"]
          // console.log('requestSTT', sttRecipient)
          break;
        case `surrenderSTT`:
          // console.log('surrenderSTT', JSON.parse(message.substring(message.indexOf(':') + 1))["id"])
          sttRecipient = null
          break;
        default:
          console.log(`Unhandled -> ${recievedData}`);
          break;
      }
    });
  });
}


export function StartWebSocketServers(argv) {
  try {
    wss = new WebSocketServer({ port: 1111 });
    SetupWebSocketServer(1111);
  } catch (error) {
    console.log(`error caught`, error);
  }
}
