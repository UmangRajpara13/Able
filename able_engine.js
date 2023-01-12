import { execSync, exec, spawn } from 'child_process'
import open from 'open';
import { existsSync, unlink, unlinkSync } from 'fs';
import { WebSocketServer } from 'ws';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';

const port = 1111
var wss, stt, sttpid, wsMap = new Map()

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

process.on('SIGINT', function () {
  console.log('kill stt on sigint');
  execSync(`kill -9 ${sttpid}`)
  stt.stdin.pause();
  stt.kill();
  // process.exit()
  process.abort()
});




var interrogativeWords = ['what', 'which', 'when', 'where', 'how',
  'whom', 'who', 'are', 'aren\'t', 'is', 'isn\'t', 'does', 'doesn\'t',
  'weather', 'why', 'whose', 'google']

var actionWords = ['refresh', 'clean']

try {
  if (existsSync('./action.wav')) {
    //file exists
    unlinkSync('./action.wav')
  }
} catch (err) {
  console.error(err)
}


try {
  wss = new WebSocketServer({ port: port });
} catch (error) {
  console.log(`error caught`, error)
}

wss.on('connection', async (ws, req) => {

  console.log(`Connection Established! --> ${req} on port ${port}`)
  ws = ws

  ws.on('close', () => {
    console.log('Connection Closed')
  });

  ws.on('error', (error) => {
    console.log(`!!! Connection Failed ${error}`)
  });

  var actionScript, query, raw

  ws.on('message', async (recievedData) => {
    // console.log(`${recievedData}`.padStart(10))
    console.log(chalk.blue(`\n${recievedData}\n`));

    actionScript = '', raw = ''

    switch (`${recievedData}`.split(':')[0]) {
      case `id`:
        console.log(ws.id)
        wsMap.set(`${recievedData}`.split(':')[1], ws)
        console.log(wsMap.keys())
        break
      case `stt`:
        query = `${recievedData}`.split(':')[1].trim().toLowerCase()

        if (interrogativeWords.some(startString => query.startsWith(startString))) {
          if (query.startsWith('google')) query = query.replace('google', '')
          await open(`https://www.google.com/search?q=${query}`, { app: { name: open.apps.chrome } })
        } else {

          raw = query.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ")
          process.stdout.write(chalk.yellow(`(raw) ${raw} `));

          for (const word of raw.split(' ')) {
            if (actionWords.includes(word)) {
              actionScript = word
              process.stdout.write(chalk.green(`(run) ${actionScript} `));

              var activeApp = `${execSync('./activeApp.sh')}`
                .split('=')[1].split(',')[0].replaceAll('"', '').trim()
              const execute = spawn(`./${actionScript}.sh`, [`ActiveApp=${activeApp}`], {
                cwd: join(homedir(), 'able_scripts'),
                // stdio: 'inherit'
              })

              execute.stdout.on('data', (data) => {
                process.stdout.write(`<< ${data}`);
                var appName = `${data}`.split(':')[0]
                var api = `${data}`.split(':')[1]
                wsMap.get(appName) ? wsMap.get(appName).send(`${api}`) : 
                process.stdout.write(chalk.red('NO WebSocket Connection Available!'))
                
              });

              execute.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
              });

              execute.on('close', (code) => {
                code == 0 ?
                  process.stdout.write(chalk.bgGreen(`Exit Code ${code}`)) :
                  process.stdout.write(chalk.bgRed(`Exit Code ${code}`));
              });

              break
            }
          }
        }
        break;
      case `sttpid`:
        sttpid = `${recievedData}`.split(':')[1]
        break;
      default:
        console.log(`Unhandled -> ${recievedData}`)
        break;
    }
  });
})

stt = spawn(`./whisper-mint/venv/bin/python3`, [`./whisper-mint/listen.py`]);

stt.stdout.on('data', (data) => {
  console.log(`STT stdout: ${data}`);
});

stt.stderr.on('data', (data) => {
  console.error(`STT stderr: ${data}`);
});

stt.on('close', (code) => {
  console.log(`stt process exited with code ${code}`);
});


// activeApp = `${execSync('./activeApp.sh')}`.split('=')[1].split(',')[0]


