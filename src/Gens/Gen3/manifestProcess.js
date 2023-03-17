import { spawn } from 'child_process'

import chalk from "chalk";


// export function activateWindow

export function windowMove(){

}



export function spawnProcess(processObject) {


    const execute = spawn(
        processObject.cli,
        // [`${raw}.sh`, `ActiveApp=${activeApp}`],
        processObject?.args,
        {
            ...(!processObject?.debug && {
                detached: true,
                stdio: "ignore"
            }),
            ...(processObject?.location && {
                cwd: processObject?.location
            })
        }
    );
    if (processObject?.debug) {
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
}