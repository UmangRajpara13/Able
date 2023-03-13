import {exec, execSync, spawn } from 'child_process'
import { join } from 'path';
import { homedir } from 'os';
import chalk from "chalk";


export var scheduledTask = []

const filePaths = {
    getWindowIDs: "./src/Gens/Gen3/helper-scripts/getWindowIDs.sh",
    windowMove: "./src/Gens/Gen3/helper-scripts/windowMove.sh"
}


export function CrawlWeb(query) {
    const browse = spawn(`bash`, ["browse.sh", `Search=${query}`], {
        cwd: join(homedir(), "able_store/scripts"),
        detached: true,
        stdio: "ignore",
    });
    browse.unref();
}

export function CommandProcessor(commandObj, activeApp = undefined, focusRequired,
    wsMap = undefined) {


    console.log('\n\nrun', commandObj)

    if (commandObj?.isScheduledTask) {
        scheduledTask.pop()
        // console.log(scheduledTask.length)
    }

    if (commandObj?.window) {
        if (commandObj?.window?.title) {
            const windowIds = `${execSync(`bash ${filePaths.getWindowIDs} "${commandObj?.window?.title}"`)}`
                .trim().split("\n");

            console.log(`Window IDs:`, windowIds, windowIds.length);
            if (windowIds.length == 1 && windowIds[0].length == 0) {
                // launch
                exec(`${commandObj.window?.executable} &`)
                scheduledTask.push(commandObj);
                console.log(scheduledTask)
                return;
            } else if (windowIds.length == 1 && windowIds[0].length > 0) {
                execSync(`wmctrl -a "${commandObj.window.title}"`)
                const tmp = `${execSync(`bash ${filePaths.windowMove} "${windowIds[0]}"`)}`
                // console.log(tmp)
                // do not return here
            }
        }
    }

    if (commandObj?.action?.cli) {
        //   if(commandObj)
        const execute = spawn(
            commandObj.action.cli,
            // [`${raw}.sh`, `ActiveApp=${activeApp}`],
            commandObj.action?.args,
            {
                ...(!commandObj.action?.debug && {
                    detached: true,
                    stdio: "ignore"
                }),
                ...(commandObj.action?.location && {
                    cwd: commandObj.action?.location
                })
            }
        );
        if (commandObj.action?.debug) {
            execute.stdout.on("data", (data) => {
                process.stdout.write(`<< ${data} `.replace("\n", ""));
            });

            execute.stderr.on("data", (data) => {
                console.error(`stderr: ${data}`);
            });

            execute.on("close", (code) => {
                code == 0
                    ? process.stdout.write(chalk.green(`Exit Code ${code}`))
                    : process.stdout.write(chalk.bgRed(`Exit Code ${code}`));
            });
        } else execute.unref();

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