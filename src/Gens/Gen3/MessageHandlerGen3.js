
import chalk from "chalk";
import { appendFile } from "fs";
import { MessageHandlerGen2 } from "../Gen2/MessageHandlerGen2.js";
import {
    awarenessProcessor, RedirectSTT,
    sentenceProcessor
} from "./sentenceProcessor.js";
import { spawn } from "child_process";


var sttpid
var dataPacket
var message, wsMap = new Map()

process.on("uncaughtException", (error) => {
    console.log("Error on Gen 3 \n", error);
    // MessageHandlerGen2(message, wsMap)
});
process.on("SIGINT", () => {

    const killPort = spawn(`bash`, ['killPort.sh'], {
      cwd: './helper-scripts',
      detached: true,
      stdio: 'ignore',
    })
    killPort.unref();
  
    const restart = spawn(`schnell`, ['/home/user/Desktop/My Projects/able_dev/engine.sh'], {
      detached: true,
      stdio: 'ignore',
    })
    restart.unref();
  });

export function MessageHandlerGen3(message, wsMap) {

    message = message
    wsMap = wsMap

    switch (message.split(":")[0]) {
        case `stt`:
            console.log(chalk.blue('\n\n[Gen 3]',`${message}\n`));

            appendFile(
                "record.txt",
                `${message.split(":")[1].trim()}\n`,
                (err) => {
                    if (err) throw err;
                    // console.log('The "data to append" was appended to file!')
                }
            );

            sentenceProcessor(message, wsMap)
            break;
        case `sttpid`:
            sttpid = message.split(":")[1];
            console.log(sttpid)
            break;
        case `awareness`:
            dataPacket = JSON.parse(message.substring(message.indexOf(':') + 1))
            console.log(dataPacket)
            awarenessProcessor(dataPacket)
            break;
        case `requestSTT`:
            dataPacket = JSON.parse(message.substring(message.indexOf(':') + 1))["id"]
            // console.log('requestSTT', sttRecipient)
            RedirectSTT(dataPacket)
            break;
        case `surrenderSTT`:
            // console.log('surrenderSTT', JSON.parse(message.substring(message.indexOf(':') + 1))["id"])
            RedirectSTT(null)
            break;
        default:
            console.log(`Unhandled -> ${message}`);
            break;
    }
}