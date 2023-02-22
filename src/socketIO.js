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

var wss,
  sttpid,
  wsMap = new Map();


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
// var systemActions = ['jenny', 'charlie']

function SetupWebSocketListener(port) {
  wss.on("connection", async (ws, req) => {
    console.log(`Connection Established! -> (PORT=${port})`);
    ws = ws;

    ws.on("close", () => {
      console.log("Connection Closed");
    });

    ws.on("error", (error) => {
      console.log(`!!! Connection Failed ${error}`);
    });

    var actionScript, query, raw, action;

    ws.on("message", async (recievedData) => {
      (actionScript = ""), (raw = "");

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
              cwd: join(process.cwd(), "./able_store/scripts"),
              detached: true,
              stdio: "ignore",
            });
            execute.unref();
          } else {

            raw = query
              .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "")
              .replace(/\s{2,}/g, " ");

            process.stdout.write(chalk.yellow(`(raw) ${raw} `));


            if (raw.length == 0) return;

            action = raw.replaceAll(" ", "-");
            var commandObj
            // check if its global action
            if (global_actions_keys.includes(action)) {
              process.stdout.write(chalk.green(`(action) ${action} `));

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

            } else {
              console.log("exe app command");
              // return

              // var command = raw.replaceAll(" ", "-");
              var activeApp = `${execSync("./src/activeApp.sh")}`
                .split("=")[1]
                .replace(", ", ".")
                .replaceAll('"', "")
                .trim();

              console.log(activeApp)

              if (!allAppsActions[activeApp]) return
              if (!allAppsActions[activeApp][action]) return
              commandObj = allAppsActions[activeApp][action]

              console.log(commandObj)

              if (commandObj?.api) {
                wsMap.get(activeApp)?.forEach((client) => {
                  // console.log(client)
                  client.send(commandObj.api);
                });
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
          break;
        default:
          console.log(`Unhandled -> ${recievedData}`);
          break;
      }
    });
  });
}

export function StartWebSocketServer(port, argv) {
  if (argv.stt != "OFF")
    process.on("SIGINT", () => {
      console.log(`SIGINT: kill transcription with PID:${sttpid}`);
      execSync(`kill -9 ${sttpid}`);
    });
  try {
    wss = new WebSocketServer({ port: port });
    SetupWebSocketListener(port);
  } catch (error) {
    console.log(`error caught`, error);
  }
}
