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
import { join } from "path";
import { outputFile } from "fs-extra";
import { homedir } from "os";

var awareness = {}
var myProjects = {}

var universalCommands, universalCommandsList = []

const filePaths = {
    universalCommands: join(process.cwd(), 'universal-commands'),
    activeApp: "./src/Generations/helper-scripts/activeApp.sh",
    awareness: join(process.cwd(), 'memory'),
    myProjects: join(homedir(), "Desktop/My Projects/"),
    nativeCommands: join(process.cwd(), 'native-commands.json')
}

// read actions 
const watchUniversalCommands = watch(filePaths.universalCommands)

watchUniversalCommands.on('all', (event, path) => {
    // console.log(path) 
    // if (path != 'universal-commands/universal-commands.json') return
    try {
        if (path.endsWith('.json')) {
            readJson(path, (err, file) => {
                // console.log(file, Object.keys(file))
                if (err) return
                if (file?.['universal-commands']) {
                    Object.keys(file?.['universal-commands']).forEach(key => {
                        // console.log(file?.['universal-commands'][key])
                        universalCommands = {
                            ...universalCommands, [key]: {
                                ...file?.['universal-commands'][key],
                            }
                        }
                    });
                    universalCommandsList = universalCommandsList.concat(Object.keys(file?.['universal-commands']))
                }
            });
        }
        // console.log(`added Actions`, universalCommandsList, actionsOnActiveWindowKeys)
        // console.log(`added Actions`, Object.keys(universalCommands))
    } catch (error) { }
})

// read actions 

// const watchMemoryConfig = watch(filePaths.awareness)
// watchMemoryConfig.on('all', (event, path) => {
//     // console.log(path)
//     // if (path != 'global/global.json') return
//     try {
//         if (path.endsWith('.json')) {
//             readJson(path, (err, file) => {
//                 // console.log(file?.global, Object.keys(file))
//                 if (err) return
//                 universalCommands = Object.assign({}, universalCommands, file?.global)
//                 universalCommandsList = Object.keys(universalCommands); // its an array
//             });
//         }
//     } catch (error) { }
// })

// const watchMyProjects = watch(filePaths.myProjects, { depth: 0 })
// watchMyProjects.on('all', (event, directoryPath) => {
//     // console.log(directoryPath)
//     myProjects["global"] = {}
//     try {
//         const stats = statSync(directoryPath);
//         if (stats.isDirectory()) readdir(directoryPath, (err, files) => {
//             if (err) {
//                 console.log('Error reading directory:', err);
//                 return;
//             }
//             // check if there are any programming files available
//             const programmingFiles = files.filter((file) =>
//                 ['.js', '.ts', '.py', '.java', '.json', '.ipynb', '.c', '.cpp', '.git'].includes(extname(file))
//             );

//             // open the directory in the appropriate application
//             if (programmingFiles.length > 0) {
//                 // console.log(directoryPath, '-----vscode',)
//                 const tmpObj = {
//                     [`open-${directoryPath.substring(directoryPath.lastIndexOf(sep) + 1).replaceAll(' ', '-')}`]: {
//                         action: {
//                             cli: "code",
//                             args: [
//                                 "--new-window",
//                                 "."
//                             ],
//                             options: {
//                                 cwd: directoryPath
//                             }

//                         }
//                     }
//                 }
//                 universalCommands = Object.assign({}, universalCommands, tmpObj)
//                 universalCommandsList = Object.keys(universalCommands)
//                 // console.log(universalCommandsList)
//             } else {
//                 const tmpObj = {
//                     [`open-${directoryPath.substring(directoryPath.lastIndexOf(sep) + 1).replaceAll(' ', '-')}`]: {
//                         client: "org.gnome.Nautilus.Org.gnome.Nautilus",
//                         action: {
//                             cli: "nautilus",
//                             args: [directoryPath],
//                             location: directoryPath,
//                             debug: false
//                         }
//                     }
//                 }
//                 universalCommands = Object.assign({}, universalCommands, tmpObj)
//                 universalCommandsList = Object.keys(universalCommands)
//                 //   // open directory in file manager
//                 //   switch (process.platform) {
//                 //     case 'darwin':
//                 //       exec(`open "${directoryPath}"`);
//                 //       break;
//                 //     case 'win32':
//                 //       exec(`explorer "${directoryPath}"`);
//                 //       break;
//                 //     case 'linux':
//                 //       exec(`xdg-open "${directoryPath}"`);
//                 //       break;
//                 //     default:
//                 //       console.log(`Unsupported platform: ${process.platform}`);
//                 //   }
//             }
//         });

//     } catch (error) { }
// })

var nativeActions, nativeActionsKeys = ['open-your-source-code']

const watchNativeCommands = watch(filePaths.nativeCommands, { depth: 0 })
watchNativeCommands.on('all', (event, nativeCommandsPath) => {
    console.log(nativeCommandsPath)
    try {
        if (nativeCommandsPath.endsWith('.json')) {
            readJson(nativeCommandsPath, (error, file) => {
                // console.log(file?.['native-commands'], Object.keys(file))
                if (error) { console.log(`${error}`); return }

                nativeActions = file?.['native-commands']
                nativeActionsKeys = nativeActionsKeys.concat(Object.keys(nativeActions)); // its an array
                // console.log(nativeActions,nativeActionsKeys)
            });
        }

    } catch (error) { }
})

export function sentenceProcessor(message, wsMap, focusedIdentifier, focusedConnectionId) {

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

    if (spokenSentenceLc.startsWith("google")
    ) {
        CrawlWeb(spokenSentenceLc.replace("google", "").trim())

    }
    // check for Native / Universal(CLI) actions
    if (universalCommandsList.includes(intent) || nativeActionsKeys.includes(intent)) {

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
        // check if its Universal action
        if (universalCommandsList.includes(intent)) {
            process.stdout.write(chalk.green(`\n ( Universal )`));

            commandObj = universalCommands[intent]
            CommandProcessor(commandObj)

            return
        }
    }

    else {
        //  we dispatch the spoken sentence (spokenSentence) to App/Extension/Plugin/Add-on
        console.log('dispatching to',focusedIdentifier,focusedConnectionId)
        const dataPacket = {
            transcription: {
                spokenSentence: spokenSentence
            }
        }

        focusedIdentifier && wsMap.get(focusedIdentifier).forEach((client, timeStamp) => {
            if (focusedConnectionId === timeStamp) {
                client.send(JSON.stringify(dataPacket));
                return;
            }
        })
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
            universalCommands = Object.assign({}, universalCommands, dataPacket["payload"])
            universalCommandsList = Object.keys(universalCommands)
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