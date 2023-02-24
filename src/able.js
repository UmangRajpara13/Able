import { execSync, exec, spawn } from "child_process";
import { existsSync, unlink, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { StartWebSocketServers } from "./socketIO.js";
import { StartTranscription } from "./transcriptionService.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readJson, outputJSONSync } from "fs-extra/esm";
import { watch } from "chokidar";
import { readJsonSync } from "fs-extra/esm";

const argv = yargs(hideBin(process.argv)).parse();
// const port = process.env.NODE_ENV == "production" ? 1111 : 2222;
const sttPort = 1111
var global_actions, global_actions_keys;
var allAppsActions = {}


// collect commandline args
console.log(argv);
// outputJSONSync("./pid.json", { parent: argv.parentPID, engine: process.pid });

// handle engine exit
// process.on("SIGINT", function () { });

// handle errors if any, apply trouble shoot and then run again
process.on("uncaughtException", (error) => {
  console.log("uncaught\n", error);
  if (error.code == "EADDRINUSE") {
    if (error.port == 1111) execSync(`fuser -k 1111/tcp`, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
    if (error.port == 2222) execSync(`fuser -k 2222/tcp`, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
    // throw "exit";
  }
});

//  some error prevention
try {
  if (existsSync("./action.wav")) {
    //file exists
    unlinkSync("./action.wav");
  }
} catch (err) {
  console.error(err);
}

function main() {
  // read actions
  // if (!existsSync('~/able_store')) execSync('rsync -av ./able_store/ $HOME/able_store')

  const globalWatcher = watch(join(process.cwd(), 'able_store/'))

  globalWatcher.on('all', (event, path) => {
    console.log(path)
    // if (path != 'global/global.json') return
    try {
      if (path.endsWith('.json')) {
        readJson(path, (err, file) => {
          // console.log(file, Object.keys(file))
          if (err) return
          // allAppsActions = { ...allAppsActions, {appKey:appObject}        }; // Objects
          if (path == join(homedir(), 'able_store/all/global.json')) {
            global_actions = file.global; // Objects
            global_actions_keys = Object.keys(global_actions); // its an array
            console.log('added Global Actions')
          } else {
            var appKey = Object.keys(file)[0]
            var appObject = file[`${appKey}`]
            allAppsActions[appKey] = appObject
            console.log(`added Actions for app, ${Object.keys(allAppsActions)}`)
          }
        });
      }
      // execSync('rsync -av $HOME/able_store/ ./able_store/')

    } catch (error) { }
  })

  // start websocet server
  StartWebSocketServers(argv);
  // start STT engine with cli args if any
  const PIDs = readJsonSync('./pid.json')
  console.log(PIDs,argv.stt != "OFF" || !PIDs.sttPid)
  
  if (argv.stt != "OFF" && !PIDs.sttPid) StartTranscription(sttPort, argv);
}
main();

export { global_actions, global_actions_keys, allAppsActions };
