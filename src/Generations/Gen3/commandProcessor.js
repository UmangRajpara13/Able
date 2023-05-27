import { exec, execSync, spawn } from 'child_process'
import { join } from 'path';
import { spawnProcess } from './manifestProcess.js'
import { cwd } from 'process';

const filePaths = {
    ableStore: join(cwd(), 'able_store/Gen3'),
    getWindowIDs: "./src/Generations/Gen3/helper-scripts/getWindowIDs.sh",
    helperScripts: "./src/Generations/Gen3/helper-scripts",
    windowMove: "./src/Generations/Gen3/helper-scripts/windowMove.sh"
}

export function CrawlWeb(query) {
    const browse = spawn(`bash`, ["browse.sh", `Search=${query}`], {
        cwd: join(cwd(), filePaths.helperScripts),
        detached: true,
        stdio: "ignore",
    });
    browse.unref();
}

export async function CommandProcessor(commandObj) {
    console.log(`\n`, commandObj)


    if (commandObj?.action?.cli) {

        spawnProcess(commandObj.action)

        return
    }
}