
import chalk from "chalk";
import { appendFile } from "fs";
import {
    awarenessProcessor, RedirectSTT,
    sentenceProcessor
} from "./sentenceProcessor.js";
import { spawn } from "child_process";


var sttpid
var dataPacket

process.on("uncaughtException", (error) => {
    console.log("Error on Gen 3 \n", error);
});

process.on("SIGINT", () => {
    const killPort = spawn(`bash`, ['killPort.sh'], {
        cwd: './src/Generations/helper-scripts',
        detached: true,
        stdio: 'ignore',
    })
    killPort.unref();
    const restart = spawn(`arrow`, ['/home/user/Desktop/My Projects/able/engine.sh'], {
        detached: true,
        stdio: 'ignore',
    })
    restart.unref();
});

export function MessageHandlerGen3(message, wsMap,focusedIdentifier,focusedConnectionId) {

    message = message
    wsMap = wsMap

    switch (Object.keys(message)[0]) {
        case `transcription`:
            console.log(chalk.blue('\n\n( Gen 3 )', `${message["transcription"]}\n`));
            appendFile(
                "record.txt",
                `${message["transcription"].trim()}\n`,
                (err) => {
                    if (err) throw err;
                }
            );
            sentenceProcessor(message["transcription"], wsMap,focusedIdentifier,focusedConnectionId)
            break;
        case `sttpid`:
            sttpid = message["sttpid"];
            console.log(`sttPID`,sttpid)
            break;
        case `awareness`:
            dataPacket = message["awareness"]
            // awarenessProcessor(dataPacket)
            break;
        // case `requestSTT`:
        //     dataPacket = message["requestSTT"]["id"]
        //     console.log('requestSTT', dataPacket)
        //     RedirectSTT(dataPacket)
        //     break;
        // case `surrenderSTT`:
            // console.log('surrenderSTT', message["surrenderSTT"]["id"])
            // RedirectSTT(null)
            // break;
        default:
            console.log(`Unhandled -> ${Object.keys(message)[0]}`,message);
            break;
    }
}