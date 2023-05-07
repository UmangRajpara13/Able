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
import { extname, join, sep } from "path";
import { outputFile } from "fs-extra";
import { homedir } from "os";
import { readdir, readdirSync, statSync } from "fs";

var awareness = {}
var sttRecipient = null

var query, raw, action, focusRequired;
var myProjects = {}

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
    activeApp: "./src/Generations/Gen3/helper-scripts/activeApp.sh",
    awareness: join(process.cwd(), 'memory'),
    myProjects: join(homedir(), "Desktop/My Projects/"),
    nativeCommands: join(process.cwd(), 'nativeCommands.json')
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



                if (file?.global) {
                    Object.keys(file?.global).forEach(key => {
                        // console.log(file?.global[key], file?.global[key]["client"] ? file?.global[key]["client"] : file["WM_CLASS"])

                        globalActions = {
                            ...globalActions, [key]: {
                                ...file?.global[key],
                                client: file?.global[key]["client"] ? file?.global[key]["client"] : file["WM_CLASS"],
                                window: file?.global[key]["window"] ? file?.global[key]["window"] : file["window"]
                            }
                        }
                    });

                    globalActionsKeys = globalActionsKeys.concat(Object.keys(file?.global))
                }

                if (file?.onActiveWindow) {
                    Object.keys(file?.onActiveWindow).forEach(key => {
                        // console.log(key)
                        actionsOnActiveWindow = {
                            ...actionsOnActiveWindow, [key]: {
                                ...file?.onActiveWindow[key],
                                client: file?.onActiveWindow[key]["client"] ? file?.onActiveWindow[key]["client"] : file["WM_CLASS"],
                                window: file?.onActiveWindow[key]["window"] ? file?.onActiveWindow[key]["window"] : file["window"]
                            }
                        }
                    })
                    actionsOnActiveWindowKeys = actionsOnActiveWindowKeys.concat(Object.keys(file?.onActiveWindow))
                }
            });
        }
        // console.log(`added Actions`, globalActionsKeys, actionsOnActiveWindowKeys)
        // console.log(`added Actions`, Object.keys(globalActions))
        // console.log(`added Actions`, globalActions)
        // console.log(`added Actions`, Object.keys(actionsOnActiveWindowKeys))

    } catch (error) { }
})

// read actions 
const watchMemoryConfig = watch(filePaths.awareness)

watchMemoryConfig.on('all', (event, path) => {
    // console.log(path)
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

const watchMyProjects = watch(filePaths.myProjects, { depth: 0 })

watchMyProjects.on('all', (event, directoryPath) => {
    // console.log(directoryPath)
    myProjects["global"] = {}
    try {
        const stats = statSync(directoryPath);
        if (stats.isDirectory()) readdir(directoryPath, (err, files) => {
            if (err) {
                console.log('Error reading directory:', err);
                return;
            }
            // check if there are any programming files available
            const programmingFiles = files.filter((file) =>
                ['.js', '.ts', '.py', '.java', '.json', '.ipynb', '.c', '.cpp', '.git'].includes(extname(file))
            );

            // open the directory in the appropriate application
            if (programmingFiles.length > 0) {
                // console.log(directoryPath, '-----vscode',)
                const tmpObj = {
                    [`open-${directoryPath.substring(directoryPath.lastIndexOf(sep) + 1).replaceAll(' ', '-')}`]: {
                        client: "code.Code",
                        action: {
                            cli: "code",
                            args: [
                                "--new-window",
                                "."
                            ],
                            location: directoryPath,
                            debug: false
                        }
                    }
                }
                globalActions = Object.assign({}, globalActions, tmpObj)
                globalActionsKeys = Object.keys(globalActions)
                // console.log(globalActionsKeys)
                //   // open directory in VS Code
                //   exec(`code "${directoryPath}"`);
            } else {
                // console.log(directoryPath, '-----FM',)
                const tmpObj = {
                    [`open-${directoryPath.substring(directoryPath.lastIndexOf(sep) + 1).replaceAll(' ', '-')}`]: {
                        client: "org.gnome.Nautilus.Org.gnome.Nautilus",
                        action: {
                            cli: "nautilus",
                            args: [directoryPath],
                            location: directoryPath,
                            debug: false
                        }
                    }
                }
                globalActions = Object.assign({}, globalActions, tmpObj)
                globalActionsKeys = Object.keys(globalActions)
                //   // open directory in file manager
                //   switch (process.platform) {
                //     case 'darwin':
                //       exec(`open "${directoryPath}"`);
                //       break;
                //     case 'win32':
                //       exec(`explorer "${directoryPath}"`);
                //       break;
                //     case 'linux':
                //       exec(`xdg-open "${directoryPath}"`);
                //       break;
                //     default:
                //       console.log(`Unsupported platform: ${process.platform}`);
                //   }
            }
        });

    } catch (error) { }
})

var nativeActions, nativeActionsKeys = ['open-your-source-code']

const watchNativeCommands = watch(filePaths.nativeCommands, { depth: 0 })

watchNativeCommands.on('all', (event, nativeCommandsPath) => {
    console.log(nativeCommandsPath)
    try {
        if (nativeCommandsPath.endsWith('.json')) {
            readJson(nativeCommandsPath, (error, file) => {
                // console.log(file?.global, Object.keys(file))
                if (error) { console.log(`${error}`); return }

                nativeActions = file?.global
                nativeActionsKeys = nativeActionsKeys.concat(Object.keys(nativeActions)); // its an array
                // console.log(nativeActions,nativeActionsKeys)

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

        if (query.startsWith("google")) {
            query = query.replace("google", "").trim();
            CrawlWeb(query)
        }
    } else {
        // Native, Global, API, CLI

        process.stdout.write(chalk.grey(`${action} `));

        // check if its native action
        if (nativeActionsKeys.includes(action)) {
            process.stdout.write(chalk.green(`( Native ) ${action} `));

            switch (action) {
                case "open-your-source-code":
                    spawn('code', ['--new-window', '.'], { cwd: cwd(), detached: true, stdio: 'ignore' })
                    break;
                default:
                    CommandProcessor(nativeActions[action])
                    break;
            }
            return
        }
        // check if its global action
        if (globalActionsKeys.includes(action)) {
            process.stdout.write(chalk.green(`( Global )`));

            commandObj = globalActions[action]
            CommandProcessor(commandObj, activeApp = commandObj.client, focusRequired = false,
                wsMap)

            return
        } else if (actionsOnActiveWindow[action]) {

            commandObj = actionsOnActiveWindow[action]

            process.stdout.write(chalk.green(`( onActiveWindow )`));
            console.log(commandObj)

            CommandProcessor(commandObj,  activeApp = commandObj.client, focusRequired = true,
                wsMap)

        }
    }
}


export function awarenessProcessor(dataPacket) {
    if (dataPacket.type == 'inform') {

        const updatedInfo = Object.assign({}, awareness[dataPacket.id], dataPacket["payload"])
        awareness = {
            ...awareness,
            [dataPacket.id]: Object.assign({}, awareness[dataPacket.id], updatedInfo)
        }
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
    }

}

export function RedirectSTT(dataPacket) {
    sttRecipient = dataPacket
}