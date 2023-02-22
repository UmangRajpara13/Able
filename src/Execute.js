

import { spawn } from 'child_process'
import chalk from "chalk";



export function Execute(commandObj) {
    console.log('run', commandObj)

    if (commandObj?.cli) {
        //   if(commandObj)
        const execute = spawn(
            commandObj.cli,
            // [`${raw}.sh`, `ActiveApp=${activeApp}`],
            commandObj.args,
            {
                ...(!commandObj.debug && {
                    detached: true,
                    stdio: "ignore"
                }),
                ...(commandObj.location && {
                    cwd: commandObj.location
                })
            }
        );
        if (commandObj.debug) {
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
}