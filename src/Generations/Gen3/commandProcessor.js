import { exec, execSync, spawn } from 'child_process'
import { join } from 'path';
import { spawnProcess } from './manifestProcess.js'

export var scheduledTask = []

const filePaths = {
    ableStore: join(process.cwd(), 'able_store/Gen3'),
    getWindowIDs: "./src/Generations/Gen3/helper-scripts/getWindowIDs.sh",
    windowMove: "./src/Generations/Gen3/helper-scripts/windowMove.sh"
}

export function CrawlWeb(query) {
    const browse = spawn(`bash`, ["browse.sh", `Search=${query}`], {
        cwd: join(filePaths.ableStore, "scripts"),
        detached: true,
        stdio: "ignore",
    });
    browse.unref();
}

export async function CommandProcessor(commandObj, activeApp = undefined, focusRequired,
    wsMap = undefined) {

    if (commandObj?.isScheduledTask) {
        scheduledTask.pop() 
    }

    if (commandObj?.window) {
        if (commandObj?.client) {
            const windowIds = `${execSync(`bash ${filePaths.getWindowIDs} "${commandObj?.client}"`)}`
                .trim().split("\n");

            console.log(`Window IDs:`, windowIds, windowIds.length);
            if (windowIds.length == 1 && windowIds[0].length == 0) {
                console.log('// launch required')

                spawnProcess(commandObj?.window?.launch)

                // if API, then add to scheduled Task!
                if (commandObj?.action?.api) {
                    // exec(`${commandObj.window?.executable} &`)

                    scheduledTask.push(commandObj); return;
                } 
                else {
                    // Temporary Workaround by using timer
                    setTimeout(async () => {
                        const windowIds = `${execSync(`bash ${filePaths.getWindowIDs} "${commandObj?.client}"`)}`
                            .trim().split("\n");
                        if (windowIds.length == 1 && windowIds[0].length == 0) {
                            exec(`xdotool windowactivate "${windowIds[0]}"`)

                            // if (commandObj?.window?.launch?.focus) await wm.activate(windowIds[0])
                            // if (commandObj?.window?.launch?.move)
                            exec(`bash ${filePaths.windowMove} "${windowIds[0]}"`)
                        }
                    }, 500)  

                }
            } else if (windowIds.length == 1 && windowIds[0].length > 0) {
                // already launched
                exec(`xdotool windowactivate "${windowIds[0]}"`)
                // if (commandObj?.window?.launch?.focus) await wm.activate(windowIds[0])
                // if (commandObj?.window?.launch?.move) 
                exec(`bash ${filePaths.windowMove} "${windowIds[0]}"`)
                // do not return here
            } else if (windowIds.length > 1) {
                console.log('TODO : multipe windows detected! ')
            }
        }
    }

    if (commandObj?.action?.cli) {

        spawnProcess(commandObj.action)

        return
    }

    if (commandObj?.action?.api) {

        wsMap.get(activeApp)?.forEach((client) => {
            // console.log(client)
            const dataPacket = {
                api: commandObj.action.api,
                focusRequired: wsMap.get(activeApp).length > 1 ? true : focusRequired,
                payload: commandObj.action?.payload
            }
            client.send(JSON.stringify(dataPacket));
        })

        return
    }
}