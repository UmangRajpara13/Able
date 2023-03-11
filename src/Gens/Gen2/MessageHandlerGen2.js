
import chalk from "chalk";
import { appendFile } from "fs";
import {
    awarenessProcessor, RedirectSTT,
    sentenceProcessor
} from "./sentenceProcessor.js";

var sttpid
var dataPacket
var message, wsMap = new Map()

export function MessageHandlerGen2(message, wsMap) {

    console.log(chalk.blue('[Gen 2]',message));
    message = message
    wsMap = wsMap

    switch (message.split(":")[0]) {
        case `stt`:

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
            // console.log(dataPacket)
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
            console.log(`Unhandled -> ${recievedData}`);
            break;
    }
}