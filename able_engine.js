// const { exec } = require('child_process');

// var yourscript = exec('sh ~/able_scripts/test.sh',
//     (error, stdout, stderr) => {
//         console.log(stdout);
//         console.log(stderr);
//         if (error !== null) {
//             console.log(`exec error: ${error}`);
//         }
//     });

import { execSync } from 'child_process'

process.on('uncaughtException', (error) => {
  console.log('uncaught', error)
  if (error.code == 'EADDRINUSE') {
    execSync('fuser -k 1111/tcp',
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

import { WebSocketServer } from 'ws';

const port = 1111
var query_appdata_index = [], ws, wss

try {
  wss = new WebSocketServer({ port: port });
} catch (error) {
  console.log(`error caught`, error)
}
wss.getUniqueID = function () {
  function s4() {
    return `${parseInt(Math.floor((1 + Math.random()) * 0x10000), 16)}`.substring(1);
  }
  return s4() + s4() + '-' + s4();
};

wss.on('connection', async (ws, req) => {

  console.log(`Connection Established! --> ${req} on port ${port}`)
  ws = ws
  ws.id = wss.getUniqueID();

  ws.on('close', () => {
    console.log('Connection Closed')
  });

  ws.on('error', (error) => {
    console.log(`!!! Connection Failed ${error}`)
  });

  ws.on('message', async (recieveData) => {
    console.log(`Message Received ${recieveData}`, typeof recieveData)

    switch (`${recieveData}`.split('<|>')[0]) {
      case `addto_query_appdata_index`:
        query_appdata_index.push(`${recieveData}`.split('<|>')[1])
        console.log(`query_appdata_index`, query_appdata_index)
        break;
      default:
        break;
    }
  });
})


import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// var response
var user_actions = ['restart wifi', 'restart bluetooth', 'sync', 'merge']
var i = 0

async function Converse() {
  // rl.question("user(BOT) -> ", (data) => {
  //   console.log(data)

  //   Converse()
  // });
  // await rl.question("user(BOT) -> ")

  rl.write(`${user_actions[i]}\r`); i++
  i < user_actions.length ? Converse() : process.exit(0)

}
Converse()

