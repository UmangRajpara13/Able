import { execSync, exec, spawn } from 'child_process'
import { existsSync, unlink, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { StartWebSocketServer } from './socketIO.js';
import { StartTranscription } from './transcriptionService.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { outputJSONSync } from 'fs-extra/esm';



const argv = yargs(hideBin(process.argv)).parse()
const port = process.env.NODE_ENV == 'production' ? 1111 : 2222



// collect commandline args
console.log(argv)
outputJSONSync('./pid.json', { parent: argv.parentPID, engine: process.pid })


// handle engine exit 
process.on('SIGINT', function () {

});

// handle errors if any, apply trouble shoot and then run again
process.on('uncaughtException', (error) => {
  console.log('uncaught', error)
  if (error.code == 'EADDRINUSE') {
    execSync(`fuser -k ${port}/tcp`,
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
      });
    throw 'exit'
  }
})

//  some error prevention
try {
  if (existsSync('./action.wav')) {
    //file exists
    unlinkSync('./action.wav')
  }
} catch (err) {
  console.error(err)
}

function main() {
  // start websocet server
  StartWebSocketServer(port, argv)
  // start STT engine with cli args if any
  if (argv.stt != 'OFF') StartTranscription(port, argv)

}
main()







