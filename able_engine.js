import { execSync, exec, spawn } from 'child_process'
import open from 'open';

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
var wss

var interrogativeWords = ['what', 'which', 'when', 'where','how',
  'whom', 'who', 'are', 'aren\'t', 'is', 'isn\'t', 'does', 'doesn\'t',
  'weather','why','whose','google']

var stt = spawn(`./whisper-mint/venv/bin/python3`, [`./whisper-mint/listen.py`]);

stt.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

stt.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

stt.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

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

  ws.on('message', async (recievedData) => {
    console.log(`${recievedData}`)
    var query = `${recievedData}`.split('|')[1].trim().toLowerCase()
    
    switch (`${recievedData}`.split('|')[0]) {
      // case `addto_query_appdata_index`:
      //   query_appdata_index.push(`${recievedData}`.split('<|>')[1])
      //   console.log(`query_appdata_index`, query_appdata_index)
      //   break;
      case `stt`:
        if (interrogativeWords.some(startString => query.startsWith(startString))) {
          await open(`https://www.google.com/search?q=${query}`, { app: { name: 'firefox' } });
        } else {
          // console.log(query)
        }

        break;
      default:
        console.log(`Unhandled -> ${recievedData}`)
        break;
    }
  });
})



// activeApp = `${execSync('./activeApp.sh')}`.split('=')[1].split(',')[0]


