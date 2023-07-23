import { execSync, exec, spawn } from "child_process";
import { existsSync, unlink, unlinkSync } from "fs";

import { StartWebSocketServer } from "./webSocketIO.js";
import { StartTranscription } from "./transcriptionService.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).parse();
// const port = process.env.NODE_ENV == "production" ? 1111 : 2222;
const sttPort = 1111

// collect commandline args
console.log(argv);
// outputJSONSync("./pid.json", { parent: argv.parentPID, engine: process.pid });

// handle engine exit
// process.on("SIGINT", function () { console.log('SIGINT-able') });

// process.once('SIGUSR2', function () {
//   console.log('SIGUSR2')
// });


// handle errors if any, apply trouble shoot and then run again
process.on("uncaughtException", (error) => {
  // console.log("uncaught\n", error);
  if (error.code == "EADDRINUSE") {
    const kill = spawn(`bash`, ['killPort.sh'], {
      cwd: './src/Generations/Gen3/helper-scripts',
      detached: true,
      stdio: 'ignore',
    })
    kill.unref();
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
  // WindowManager()
  // start websocet server
  StartWebSocketServer(argv);
  // start STT engine with cli args if any
  console.log(!execSync(`nvidia-smi | grep python | awk '{print $5}' | cut -d '.' -f 1`).toString())
  if (!execSync(`nvidia-smi | grep python | awk '{print $5}' | cut -d '.' -f 1`).toString()) {
    if (argv.stt != "OFF") StartTranscription(sttPort, argv);  
  }
}

main();  