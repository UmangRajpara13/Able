// handle errors if any, apply trouble shoot and then run again

process.on("uncaughtException", (error) => {
    console.log("Error on Gen 3 \n", error);

});

import { CommandProcessor, CrawlWeb } from "./commandProcessor.js";
import { cwd } from "process";
import chalk from "chalk";
import { execSync, spawn } from "child_process";
import { watch } from "chokidar";
import { readJson } from "fs-extra/esm";
import { join } from "path";
import { outputFile } from "fs-extra";

var awareness = {}
var sttRecipient = null

var nativeActions = ['open-your-source-code']
var query, raw, action, focusRequired;
// var allActions = {}

var interrogativeWords = [
    "what",
    "which",
    "when",
    "where",
    "how",
    "whom",
    "who",
    "weather",
    "why",
    "whose",
];

var globalActions, globalActionsKeys, actionsOnActiveWindow = {}, actionsOnActiveWindowKeys = []

const filePaths = {
    ableStore: join(process.cwd(), 'able_store/Gen3'),
    activeApp: "./src/Gens/Gen3/helper-scripts/activeApp.sh",
    awareness: join(process.cwd(), 'memory')
}
// read actions 
const watchCommandConfig = watch(filePaths.ableStore)

watchCommandConfig.on('all', (event, path) => {
    // console.log(path) 
    // if (path != 'global/global.json') return
    try {
        if (path.endsWith('.json')) {
            readJson(path, (err, file) => {
                // console.log(file, Object.keys(file))
                if (err) return

                globalActions = Object.assign({}, globalActions, file?.global)
                globalActionsKeys = Object.keys(globalActions); // its an array

                actionsOnActiveWindow = Object.assign({}, actionsOnActiveWindow, file?.onActiveWindow)
                actionsOnActiveWindowKeys = Object.keys(actionsOnActiveWindow); // its an array

            });
        }
        // console.log(`added Actions`, globalActionsKeys, actionsOnActiveWindowKeys)

    } catch (error) { }
})

// read actions 
const memoryConfig = watch(filePaths.awareness)

memoryConfig.on('all', (event, path) => {
    console.log(path)
    // if (path != 'global/global.json') return
    try {
        if (path.endsWith('.json')) {
            readJson(path, (err, file) => {
                // console.log(file?.global, Object.keys(file))
                if (err) return

                globalActions = Object.assign({}, globalActions, file?.global)
                globalActionsKeys = Object.keys(globalActions); // its an array

                actionsOnActiveWindow = Object.assign({}, actionsOnActiveWindow, file?.onActiveWindow)
                actionsOnActiveWindowKeys = Object.keys(actionsOnActiveWindow); // its an array

            });

        }

    } catch (error) { }
})

export function sentenceProcessor(message, wsMap) {
    (raw = "");

    query = message.trim();

    // if sttRecipient return
    if (sttRecipient) {
        console.log(chalk.yellowBright(`redirecting -> ${message}\n`));

        wsMap?.get(sttRecipient)?.forEach((client) => {
            // console.log(client)
            const dataPacket = {
                api: "stt-redirect",
                payload: {
                    text: query
                }
            }
            client.send(JSON.stringify(dataPacket));
        })

        return
    }
    query = message.trim().toLowerCase();

    raw = query
        .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ");

    if (raw.length == 0) return;

    process.stdout.write(chalk.yellow(`( raw ) ${raw} `));

    action = raw.replaceAll(" ", "-");

    var commandObj

    // check if its a Question
    if (interrogativeWords.some((startString) => query.startsWith(startString)) |
        query.endsWith("?") |
        query.startsWith("google")
    ) {
        // if query ends with ? and its a command.
        if (query.endsWith('?') &&
            (globalActionsKeys.includes(action) || actionsOnActiveWindowKeys.includes(action))) {
            commandObj = globalActions[action] || allActions[action]
            CommandProcessor(commandObj)
            return
        }

        if (query.startsWith("google"))
            query = query.replace("google", "").trim();

        // open(`https://www.google.com/search?q=${query}`)
        CrawlWeb(query)


    } else {
        // Native, Global, API, CLI
        try {
            var activeApp = `${execSync(filePaths.activeApp)}`
                .split("=")[1]
                .replace(", ", ".")
                .replaceAll('"', "")
                .trim();

            console.log(activeApp)
        } catch (error) {
            console.error(error)
        }

        process.stdout.write(chalk.grey(`${action} `));

        // check if its native action
        if (nativeActions.includes(action)) {
            process.stdout.write(chalk.green(`( Native ) ${action} `));

            switch (action) {
                case "open-your-source-code":
                    spawn('code', ['-r', '.'], { cwd: cwd(), detached: true, stdio: 'ignore' })
                    break;
                default:
                    break;
            }
            return
        }
        // console.log(globalActionsKeys.includes(action))
        // check if its global action
        if (globalActionsKeys.includes(action)) {
            process.stdout.write(chalk.green(`( Global )`));


            //   var allWindow = await wm.getWindows();
            //   allWindow = allWindow.map((winObj) => winObj.className);
            //   var allWindowIDs = allWindow.map((winObj) => winObj.id);
            //   var activeApp = `${execSync("./activeApp.sh")}`;

            //   activeApp = activeApp
            //     .split("=")[1]
            //     .split(",")[1]
            //     .replaceAll('"', "")
            //     .trim();

            commandObj = globalActions[action]
            CommandProcessor(commandObj, activeApp = commandObj.client, focusRequired = false,
                wsMap)

            return
        } else if (actionsOnActiveWindow[action]) {

            commandObj = actionsOnActiveWindow[action]

            var activeApp = `${execSync(filePaths.activeApp)}`
                .split("=")[1]
                .replace(", ", ".")
                .replaceAll('"', "")
                .trim();

            if (commandObj.client !== activeApp) return


            process.stdout.write(chalk.green(`( onActiveWindow )`));
            console.log(commandObj)


            CommandProcessor(commandObj, activeApp, focusRequired = true,
                wsMap)

            // for (const word of raw.split(' ')) {
            //     if (actionWords.includes(word)) {
            //         actionScript = word
            //         process.stdout.write(chalk.green(`(run) ${actionScript} `));

            //         var activeApp = `${execSync('./activeApp.sh')}`
            //         console.log(activeApp)
            //         activeApp = activeApp.split('=')[1].split(',')[1].replaceAll('"', '').trim()
            //         const execute = spawn(`./${actionScript}.sh`, [`ActiveApp=${activeApp}`], {
            //             cwd: join(process.cwd(), './able_scripts'),
            //         })

            //         execute.stdout.on('data', (data) => {
            //             process.stdout.write(`<< ${data} `.replace('\n', ''));
            //             var appName = `${data}`.split(':')[0]
            //             var api = `${data}`.split(':')[1]
            //             wsMap.get(appName) ? wsMap.get(appName).send(`${api}`) :
            //                 process.stdout.write(chalk.red('NO WebSocket Connection Available!'))

            //         });

            //         execute.stderr.on('data', (data) => {
            //             console.error(`stderr: ${data}`);
            //         });

            //         execute.on('close', (code) => {
            //             code == 0 ?
            //                 process.stdout.write(chalk.green(`| Exit Code ${code}`)) :
            //                 process.stdout.write(chalk.bgRed(`| Exit Code ${code}`));
            //         });

            //         break
            //     }
            // }
        }
    }
}


export function awarenessProcessor(dataPacket) {
    if (dataPacket.type == 'inform') {

        const updatedInfo = Object.assign({}, awareness[dataPacket.id], dataPacket["payload"])
        // console.log(updatedInfo)
        awareness = {
            ...awareness,
            [dataPacket.id]: Object.assign({}, awareness[dataPacket.id], updatedInfo)
        }
        // console.log(awareness[dataPacket.id])

    }
    if (dataPacket.type == 'actions') {

        if (dataPacket["scope"] === 'global') {
            globalActions = Object.assign({}, globalActions, dataPacket["payload"])
            globalActionsKeys = Object.keys(globalActions)
        }
        if (dataPacket["scope"] === 'onActiveWindow') {
            actionsOnActiveWindow = Object.assign({}, actionsOnActiveWindow, dataPacket["payload"])
            actionsOnActiveWindowKeys = Object.keys(actionsOnActiveWindow)
        }
        if (dataPacket["persist"]) {
            outputFile(`./memory/awareness.json`, JSON.stringify({ [dataPacket["scope"]]: dataPacket["payload"] }))
        }
        // console.log(globalActionsKeys)
    }

}

export function RedirectSTT(dataPacket) {
    sttRecipient = dataPacket
}