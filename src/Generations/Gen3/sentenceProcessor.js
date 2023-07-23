// handle errors if any, apply trouble shoot and then run again

process.on("uncaughtException", (error) => {
    console.log("Error on Gen 3 \n", error);

});

import { CommandProcessor, CrawlWeb } from "./commandProcessor.js";
import { cwd } from "process";
import chalk from "chalk";
import { spawn } from "child_process";
import { watch } from "chokidar";
import { readJson } from "fs-extra/esm";
import { extname, join, sep } from "path";
import { outputFile } from "fs-extra";
import { homedir } from "os";
import { readdir, statSync } from "fs";

var awareness = {}
var myProjects = {}

var globalActions, globalActionsKeys

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
                            }
                        }
                    });

                    globalActionsKeys = globalActionsKeys.concat(Object.keys(file?.global))
                }
            });
        }
        // console.log(`added Actions`, globalActionsKeys, actionsOnActiveWindowKeys)
        // console.log(`added Actions`, Object.keys(globalActions))

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
                        action: {
                            cli: "code",
                            args: [
                                "--new-window",
                                "."
                            ],
                            options: {
                                cwd: directoryPath
                            }

                        }
                    }
                }
                globalActions = Object.assign({}, globalActions, tmpObj)
                globalActionsKeys = Object.keys(globalActions)
                // console.log(globalActionsKeys)
            } else {
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

export function sentenceProcessor(message, wsMap, focusedClientId) {

    const spokenSentence = message.trim();
    const spokenSentenceLc = spokenSentence.toLowerCase();

    const spokenSentenceRaw = spokenSentenceLc
        .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ");

    if (spokenSentenceRaw.length == 0) return;

    process.stdout.write(chalk.yellow(`( Raw ) ${spokenSentenceRaw} `));

    const intent = spokenSentenceRaw.replaceAll(" ", "-");

    process.stdout.write(chalk.grey(`\n( intent )  ${intent} \n`));
    var commandObj

    // check if its a Question
    if (spokenSentence.endsWith("?") |
        spokenSentenceLc.startsWith("google")
    ) {
        // if spokenSentence ends with ? and its a command.
        if (spokenSentence.endsWith('?') && (globalActionsKeys.includes(intent))) {
            commandObj = globalActions[intent]
            CommandProcessor(commandObj)
            return
        }
        if (spokenSentenceLc.startsWith("google")) {
            CrawlWeb(spokenSentenceLc.replace("google", "").trim())
        }
    } else {
        // check for Native / Global / API / CLI actions

        if (nativeActionsKeys.includes(intent)) {
            process.stdout.write(chalk.green(`( Native ) ${intent} `));

            switch (intent) {
                case "open-your-source-code":
                    spawn('code', ['--new-window', '.'], { cwd: cwd(), detached: true, stdio: 'ignore' })
                    break;
                default:
                    CommandProcessor(nativeActions[intent])
                    break;
            }
            return
        }
        // check if its global action
        if (globalActionsKeys.includes(intent)) {
            process.stdout.write(chalk.green(`\n ( Global )`));

            commandObj = globalActions[intent]
            CommandProcessor(commandObj)

            return
        } else {
            //  we dispatch the spoken sentence (spokenSentence)
            //  to all windows of an app (focusedClientId), only the window with focus
            //  should process it! 

            // process.stdout.write(chalk.green(`( onActiveWindow )`));

            focusedClientId && wsMap.get(focusedClientId).forEach((client) => {
                const dataPacket = {
                    spokenSentence: spokenSentence
                }
                client.send(JSON.stringify(dataPacket));
            })
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