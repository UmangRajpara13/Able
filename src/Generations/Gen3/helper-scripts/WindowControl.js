import { WMCtrl } from "../WmCtrl/WmCtrl.js";
import { spawn, execSync } from "child_process"
import { join } from "path";

const wm = new WMCtrl()
var WindowClassNames = '', WindowIDs = ''

async function RunSystemCommand() {
    
    var allWindows = await wm.getWindows()
    var allWindowClassName = allWindows.map(winObj => winObj.className)
    var allWindowIDs = allWindows.map(winObj => winObj.id)

    console.log(allWindows)

    WindowClassNames = allWindowClassName.join(" ")
    WindowIDs = allWindowIDs.join(" ")

    // console.log(WindowClassNames, WindowIDs)
    var activeApp = `${execSync('./activeApp.sh')}`

    console.log(activeApp)

    activeApp = "org.gnome.Nautilus.Org.gnome.Nautilus"

    const execute = spawn(`bash`, [`jenny.sh`, `ActiveApp=${activeApp}`, `WindowClassNames= ${WindowClassNames}`,
        `WindowIDs=${WindowIDs}`], {
        cwd: join(process.cwd(), './able_store/system'),
        // detached: process.NODE_ENV == 'development' ? false : true,
        // stdio: process.NODE_ENV == 'development' ? 'pipe' : 'ignore',
    })

    // if (process.NODE_ENV == 'production') {
    //     execute.unref(); return
    // }

    execute.stdout.on('data', (data) => {
        console.log(`${data}`);

        `${data}`.split('\n').forEach(msg => {
            if (msg.startsWith('run')) {
                console.log(`>>${msg}`)
                var run = spawn(`${`${msg}`.split(':')[1]}`, [], {
                    detached: true,
                    stdio: 'ignore',
                })
                run.unref();
            }
        })
    });

    execute.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    execute.on('close', (code) => {
        code == 0 ?
            process.stdout.write((`| Exit Code ${code}`)) :
            process.stdout.write((`| Exit Code ${code}`));
    });
}

RunSystemCommand()