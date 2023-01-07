import { execSync,exec } from 'child_process'

// var yourscript = exec('sh ~/able_scripts/test.sh',
//     (error, stdout, stderr) => {
//         console.log(stdout);
//         console.log(stderr);
//         if (error !== null) {
//             console.log(`exec error: ${error}`);
//         }
//     });

var yourscript = exec(`./activeApp.sh`,
    (error, stdout, stderr) => {
        console.log(stdout.split('=')[1].split(',')[0]);
        console.log(stderr);
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    });
