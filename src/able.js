import { execSync, exec, spawn } from "child_process";
import { existsSync, unlink, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { StartWebSocketServers } from "./socketIO.js";
import { StartTranscription } from "./transcriptionService.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readJson, outputJSONSync } from "fs-extra/esm";
import { readJsonSync } from "fs-extra/esm";

const argv = yargs(hideBin(process.argv)).parse();
// const port = process.env.NODE_ENV == "production" ? 1111 : 2222;
const sttPort = 1111



// collect commandline args
console.log(argv); 
// outputJSONSync("./pid.json", { parent: argv.parentPID, engine: process.pid });

// handle engine exit
process.on("SIGINT", function () {console.log('SIGINT-able') });
// process.once('SIGUSR2', function () {
//   console.log('SIGUSR2')
// });


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
  
  // start websocet server
  StartWebSocketServers(argv);
  // start STT engine with cli args if any
  const PIDs = readJsonSync('./pid.json')
  console.log(PIDs,argv.stt != "OFF" && !PIDs.sttPid)
  
  if (argv.stt != "OFF" && !PIDs.sttPid) StartTranscription(sttPort, argv);
}
main();

// export { global_actions, global_actions_keys, allAppsActions };
