import { execSync, exec, spawn } from "child_process";
import { existsSync, unlink, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { StartWebSocketServer } from "./socketIO.js";
import { StartTranscription } from "./transcriptionService.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readJson, outputJSONSync } from "fs-extra/esm";
import { watch } from "chokidar";

const argv = yargs(hideBin(process.argv)).parse();
const port = process.env.NODE_ENV == "production" ? 1111 : 2222;

var global_actions, global_actions_keys;
var allAppsActions = {}


// collect commandline args
console.log(argv);
outputJSONSync("./pid.json", { parent: argv.parentPID, engine: process.pid });

// handle engine exit
process.on("SIGINT", function () { });

// handle errors if any, apply trouble shoot and then run again
process.on("uncaughtException", (error) => {
  console.log("uncaught", error);
  if (error.code == "EADDRINUSE") {
   if(error.port == 1111) execSync(`fuser -k 1111/tcp`, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
    if(error.port == 2222) execSync(`fuser -k 2222/tcp`, (error, stdout, stderr) => {
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
  if (!existsSync('~/able_store')) execSync('rsync -av ./able_store/ $HOME/able_store')
  
  const globalWatcher = watch(join(homedir(),'able_store/all/*'))

  globalWatcher.on('all', (event, path) => {
    console.log(path)
    // if (path != 'global/global.json') return
    try {
      readJson(path, (err, file) => {
        // console.log(file, Object.keys(file))

        // allAppsActions = { ...allAppsActions, {appKey:appObject}        }; // Objects
        if (path == join(homedir(),'able_store/all/global.json')) {
          global_actions = file.global; // Objects
          global_actions_keys = Object.keys(global_actions); // its an array
          console.log('added Global Actions')
        } else {
          var appKey = Object.keys(file)[0]
          var appObject = file[`${appKey}`]
          allAppsActions[appKey] = appObject
          console.log(`added Actions for app, ${Object.keys(allAppsActions)}`)
        }
        execSync('rsync -av $HOME/able_store/ ./able_store/')
      });
    } catch (error) { }
  })

  // start websocet server
  StartWebSocketServer(port, argv);
  // start STT engine with cli args if any
  if (argv.stt != "OFF") StartTranscription(port, argv);
}
main();

export { global_actions, global_actions_keys, allAppsActions };
