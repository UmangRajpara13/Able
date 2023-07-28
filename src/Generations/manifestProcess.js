import { spawn } from 'child_process'

import chalk from "chalk";

export function spawnProcess(processObject) {


    const execute = spawn(
        processObject.cli,
        processObject?.args,
        processObject?.options
    );
    if (!processObject?.options?.detached && processObject?.options?.stdio !== 'ignore') {
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