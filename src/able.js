import { execSync, exec, spawn } from "child_process";
import { existsSync, unlink, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import chalk from "chalk";
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

const globalWatcher = watch('./able_store/all/*')

// collect commandline args
console.log(argv);
outputJSONSync("./pid.json", { parent: argv.parentPID, engine: process.pid });

// handle engine exit
process.on("SIGINT", function () { });

// handle errors if any, apply trouble shoot and then run again
process.on("uncaughtException", (error) => {
  console.log("uncaught", error);
  if (error.code == "EADDRINUSE") {
    execSync(`fuser -k ${port}/tcp`, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
    throw "exit";
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
  globalWatcher.on('all', (event, path) => {
    console.log(path)
    // if (path != 'global/global.json') return
    try {
      readJson(path, (err, file) => {
        // console.log(file, Object.keys(file))
        var appKey = Object.keys(file)[0]
        var appObject = file[`${appKey}`]
        allAppsActions[appKey] = appObject
        // allAppsActions = { ...allAppsActions, {appKey:appObject}        }; // Objects
        if (path == 'able_store/all/global.json') {
          global_actions = file.global; // Objects
          global_actions_keys = Object.keys(global_actions); // its an array
          console.log('added Global Actions')
        }
        console.log(`added Actions for app, ${Object.keys(allAppsActions)}`)

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
