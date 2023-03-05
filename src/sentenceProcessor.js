import { execSync, spawn } from 'child_process'
import { join } from 'path';
import { homedir } from 'os';
import chalk from "chalk";
import { cwd } from 'process';

export function CrawlWeb(query) {
    const browse = spawn(`bash`, ["browse.sh", `Search=${query}`], {
        cwd: join(homedir(), "able_store/scripts"),
        detached: true,
        stdio: "ignore",
    });
    browse.unref();
}

export function ActionProcessor(commandObj, isDev = false, activeApp = undefined,
    wsMap = undefined, wsMapDev = undefined) {


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
        return
    }

    if (commandObj?.api && !commandObj?.url) {
        isDev ? wsMapDev.get(activeApp)?.forEach((client) => {
            // console.log(client)
            client.send(commandObj.api);
        }) : wsMap.get(activeApp)?.forEach((client) => {
            // console.log(client)
            client.send(commandObj.api);
        })
        return
    }

    // TODO: this should automatically users default browser and use that WM_CLASS
    if (commandObj?.url && commandObj?.api) {
        execSync('bash ./src/helper-scripts/william.sh')   
        isDev ? wsMapDev?.get('Navigator.firefox-aurora')?.forEach((client) => {
            // console.log(client)
            client.send(`${commandObj.api},${commandObj.url}`);
        }) : wsMap?.get('Navigator.firefox-aurora')?.forEach((client) => {
            // console.log(client)
            client.send(`${commandObj.api},${commandObj.url}`);
        })
    }
}