
import { WebSocketServer } from 'ws';
import { execSync, exec, spawn } from 'child_process'
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import open from 'open';


var wss, sttpid, wsMap = new Map()


process.on('SIGINT', function () {
    console.log(`SIGINT: kill transcription with PID:${sttpid}`);
    execSync(`kill -9 ${sttpid}`)
});

var interrogativeWords = ['what', 'which', 'when', 'where', 'how', 'do', 'can', 'may',
    'whom', 'who', 'are', 'aren\'t', 'is', 'isn\'t', 'does', 'doesn\'t',
    'weather', 'why', 'whose', 'google']

var actionWords = ['refresh', 'clean']

function SetupWebSocketListener(port) {
    wss.on('connection', async (ws, req) => {

        console.log(`Connection Established! -> (PORT=${port})`)
        ws = ws

        ws.on('close', () => {
            console.log('Connection Closed')
        });

        ws.on('error', (error) => {
            console.log(`!!! Connection Failed ${error}`)
        });

        var actionScript, query, raw

        ws.on('message', async (recievedData) => {


            actionScript = '', raw = ''

            switch (`${recievedData}`.split(':')[0]) {
                case `id`:
                    console.log(chalk.magenta(`\n${recievedData}\n`));

                    wsMap.set(`${recievedData}`.split(':')[1], ws)
                    // console.log(`Services Connected : ${wsMap.keys}`)
                    break
                case `stt`:
                    console.log(chalk.blue(`\n${recievedData}\n`));

                    query = `${recievedData}`.split(':')[1].trim().toLowerCase()

                    if (interrogativeWords.some(startString => query.startsWith(startString))) {
                        if (query.startsWith('google')) query = query.replace('google', '')
                        open(`https://www.google.com/search?q=${query}`)
                    } else {

                        raw = query.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ")
                        process.stdout.write(chalk.yellow(`(raw) ${raw} `));

                        for (const word of raw.split(' ')) {
                            if (actionWords.includes(word)) {
                                actionScript = word
                                process.stdout.write(chalk.green(`(run) ${actionScript} `));

                                var activeApp = `${execSync('./activeApp.sh')}`
                                console.log(activeApp)
                                activeApp = activeApp.split('=')[1].split(',')[1].replaceAll('"', '').trim()
                                const execute = spawn(`./${actionScript}.sh`, [`ActiveApp=${activeApp}`], {
                                    cwd: join(homedir(), 'able_scripts'),
                                    // stdio: 'inherit'
                                })

                                execute.stdout.on('data', (data) => {
                                    process.stdout.write(`<< ${data} `.replace('\n', ''));
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
                                        process.stdout.write(chalk.green(`| Exit Code ${code}`)) :
                                        process.stdout.write(chalk.bgRed(`| Exit Code ${code}`));
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
}

export function StartWebSocketServer(port) {
    try {
        wss = new WebSocketServer({ port: port });
        SetupWebSocketListener(port)
    } catch (error) {
        console.log(`error caught`, error)
    }
}


