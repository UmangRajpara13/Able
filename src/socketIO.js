import { WebSocketServer } from "ws";
import { execSync, exec, spawn, spawnSync } from "child_process";
import { homedir } from "os";
import { join } from "path";
import chalk from "chalk";
import open from "open";
import { WMCtrl } from "./WmCtrl/WmCtrl.js";
import { appendFile } from "fs";
import { allAppsActions, global_actions, global_actions_keys } from "./able.js";
import { Execute } from "./Execute.js";

const wm = new WMCtrl();

var wss, wssDev,
  sttpid,
  wsMap = new Map(),
  wsMapDev = new Map(),
  isDev = false


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

// var actionWords = ['refresh', 'clean']
var nativeActions = ['switch-to-development', 'switch-to-production', 'restart']

function SetupWebSocketServer(port) {
  wss.on("connection", async (ws, req) => {
    console.log(`Connection Established! -> (PORT=${port})`);
    ws = ws;

    ws.on("close", () => {
      console.log("Connection Closed");
    });

    ws.on("error", (error) => {
      console.log(`!!! Connection Failed ${error}`);
    });

    var  query, raw, action;

    ws.on("message", async (recievedData) => {
       (raw = "");

      switch (`${recievedData}`.split(":")[0]) {
        case `id`:
          console.log(chalk.magenta(`\n${recievedData}\n`));

          if (wsMap.get(`${recievedData}`.split(":")[1])) {
            var allWsClients = wsMap.get(`${recievedData}`.split(":")[1]);
            allWsClients.push(ws);
            wsMap.set(`${recievedData}`.split(":")[1], allWsClients);
          } else {
            wsMap.set(`${recievedData}`.split(":")[1], [ws]);
          }
          console.log(
            `Services Connected : ${wsMap.keys()}, ${wsMap.get(`${recievedData}`.split(":")[1]).length
            }`
          );
          break;
        case `stt`:
          console.log(chalk.blue(`\n${recievedData}\n`));

          appendFile(
            "record.txt",
            `${`${recievedData}`.split(":")[1].trim()}\n`,
            (err) => {
              if (err) throw err;
              // console.log('The "data to append" was appended to file!')
            }
          );

          query = `${recievedData}`.split(":")[1].trim().toLowerCase();

          // check if its a Question
          if (interrogativeWords.some((startString) => query.startsWith(startString)) |
            query.endsWith("?") |
            query.startsWith("google")
          ) {
            if (query.startsWith("google"))
              query = query.replace("google", "").trim();

            // open(`https://www.google.com/search?q=${query}`)

            const execute = spawn(`bash`, ["browse.sh", `Search=${query}`], {
              cwd: join(homedir(),"able_store/scripts"),
              detached: true,
              stdio: "ignore",
            });
            execute.unref();
          } else {

            raw = query
              .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "")
              .replace(/\s{2,}/g, " ");

            process.stdout.write(chalk.yellow(`${isDev ? `[dev]` : `[prod]`}`));
            process.stdout.write(chalk.yellow(`(raw) ${raw} `));


            if (raw.length == 0) return;

            action = raw.replaceAll(" ", "-");

            var commandObj

            // check if its native action
            if (nativeActions.includes(action)) {
              process.stdout.write(chalk.green(`(Native) ${action} `));

              switch (action) {
                case "switch-to-development":
                  isDev = true
                  break;
                case "switch-to-production":
                  isDev = false
                  break;
                case "restart":
                  // execSync(`kill -9 ${sttpid}`);
                  // spawn('bash', ['start_prod.sh'], { cwd: '.', detached: true, stdio: 'ignore' })
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
            }
            // check if its global action
            if (global_actions_keys.includes(action)) {
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
              commandObj = global_actions[`${action}`]

              Execute(commandObj)
              return
            } else {

              // return

              // var command = raw.replaceAll(" ", "-");
              var activeApp = `${execSync("./src/activeApp.sh")}`
                .split("=")[1]
                .replace(", ", ".")
                .replaceAll('"', "")
                .trim();

              process.stdout.write(chalk.green(`${action}->(App)${activeApp}`));

              if (!allAppsActions[activeApp]) return
              if (!allAppsActions[activeApp][action]) return
              commandObj = allAppsActions[activeApp][action]

              console.log(commandObj)

              if (commandObj?.api) {
                isDev ? wsMapDev.get(activeApp)?.forEach((client) => {
                  // console.log(client)
                  client.send(commandObj.api);
                }) : wsMap.get(activeApp)?.forEach((client) => {
                  // console.log(client)
                  client.send(commandObj.api);
                })
              } else {
                Execute(commandObj)
              }
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
          sttpid = `${recievedData}`.split(":")[1];
          console.log(sttpid)
          break;
        default:
          console.log(`Unhandled -> ${recievedData}`);
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

      switch (`${recievedData}`.split(":")[0]) {
        case `id`:
          console.log(chalk.magenta(`\n${recievedData}\n`));

          if (wsMapDev.get(`${recievedData}`.split(":")[1])) {
            var allWsClients = wsMapDev.get(`${recievedData}`.split(":")[1]);
            allWsClients.push(ws);
            wsMapDev.set(`${recievedData}`.split(":")[1], allWsClients);
          } else {
            wsMapDev.set(`${recievedData}`.split(":")[1], [ws]);
          }
          console.log(
            `Services Connected : ${wsMapDev.keys()}, ${wsMapDev.get(`${recievedData}`.split(":")[1]).length
            }`
          );
          break;
        default:
          console.log(`Unhandled DEV-> ${recievedData}`);
          break;
      }    
    });
  });
}

export function StartWebSocketServers(argv) {
  // if (argv.stt != "OFF")
    // process.on("SIGINT", () => {
    //   // console.log(`SIGINT: kill transcription with PID:${sttpid}`);
    //   // execSync(`kill -9 ${sttpid}`);
    // });

  try {
    wss = new WebSocketServer({ port: 1111 });
    SetupWebSocketServer(1111);
    wssDev = new WebSocketServer({ port: 2222 });
    SetupWebSocketDevServer(2222);
  } catch (error) {
    console.log(`error caught`, error);
  }
}
