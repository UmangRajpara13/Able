// handle errors if any, apply trouble shoot and then run again



import { CommandProcessor, CrawlWeb } from "./commandProcessor.js";
import { cwd } from "process";
import chalk from "chalk";
import { execSync, spawn } from "child_process";
import { watch } from "chokidar";
import { readJson } from "fs-extra/esm";
import { join } from "path";

var awareness = {}
var sttRecipient = null

var nativeActions = ['open-your-source-code']
var query, raw, action;
var allActions = {}

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

var globalActions, globalActionsKeys, allActions = {}, allActionsKeys = []

const filePaths = {
    ableStore: join(process.cwd(), 'able_store/Gen2'),
    activeApp: "./src/Gens/Gen2/helper-scripts/activeApp.sh"
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
                // allActions = { ...allActions, {appKey:appObject}        }; // Objects

                var appKey = Object.keys(file)[0]
                var appObject = file[`${appKey}`]
                allActions[appKey] = appObject
                allActionsKeys = allActionsKeys.concat(Object.keys(appObject))

                if (path == join(process.cwd(), 'able_store/Gen2/all/global.json')) {
                    globalActions = file.global; // Objects
                    globalActionsKeys = Object.keys(globalActions); // its an array
                    // console.log('added Global Actions')
                }
            });
        }
        // console.log(`added Actions for app, ${Object.keys(allActions)}`)

    } catch (error) { }
})



export function sentenceProcessor(message, wsMap) {
    (raw = "");

    query = message.split(":")[1].trim();

    // if sttRecipient return
    if (sttRecipient) {
        console.log(chalk.yellowBright(`redirecting \n${message}\n`));

        wsMap?.get(sttRecipient)?.forEach((client) => {
            // console.log(client)
            client.send(`sttRedirect,${query}`);
        })
        return
    }
    query = message.split(":")[1].trim().toLowerCase();


    raw = query
        .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ");

    if (raw.length == 0) return;

    process.stdout.write(chalk.yellow(`(raw) ${raw} `));

    action = raw.replaceAll(" ", "-");
    var commandObj

    // check if its a Question
    if (interrogativeWords.some((startString) => query.startsWith(startString)) |
        query.endsWith("?") |
        query.startsWith("google")
    ) {
        // if query ends with ? and its a command.
        if (query.endsWith('?') &&
            (globalActionsKeys.includes(action) || allActionsKeys.includes(action))) {
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
 
        // check if its native action
        if (nativeActions.includes(action)) {
            process.stdout.write(chalk.green(`(Native) ${action} `));

            switch (action) {
                case "open-your-source-code":
                    spawn('code', ['-r', '.'], { cwd: cwd(), detached: true, stdio: 'ignore' })
                    break;
                default:
                    break;
            }
            return
        }
        // check if its global action
        if (globalActionsKeys.includes(action)) {
            process.stdout.write(chalk.green(`(Global) ${action} `));


            //   var allWindow = await wm.getWindows();
            //   allWindow = allWindow.map((winObj) => winObj.className);
            //   var allWindowIDs = allWindow.map((winObj) => winObj.id);

            commandObj = globalActions[action]
            CommandProcessor(commandObj, activeApp = undefined,
                wsMap)

            return
        } else {

            // var command = raw.replaceAll(" ", "-");
            var activeApp = `${execSync(filePaths.activeApp)}`
                .split("=")[1]
                .replace(", ", ".")
                .replaceAll('"', "")
                .trim();

            console.log(activeApp)

            if (!allActions[activeApp]) return
            if (!allActions[activeApp][action]) return

            process.stdout.write(chalk.grey(`(App) ${activeApp} (action) ${action}`));

            commandObj = allActions[activeApp][action]

            console.log(commandObj)

            CommandProcessor(commandObj, activeApp,
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
        console.log(awareness[dataPacket.id])

    }
    if (dataPacket.type == 'actions') {
        const actions = Object.assign({}, allActions[dataPacket.scope], dataPacket["payload"])
        // console.log(actions)
        allActions = { ...allActions, [dataPacket.scope]: actions }
        // console.log(allActions)  
    }
    globalActions = allActions["global"]
    globalActionsKeys = Object.keys(allActions["global"])
    // console.log(globalActions,globalActionsKeys)
}

export function RedirectSTT(dataPacket) {
    sttRecipient = dataPacket
}