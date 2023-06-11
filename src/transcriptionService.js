import { execSync, exec, spawn } from 'child_process'

var stt

// process.on('SIGINT', () => {
//     console.log(`SIGINT: kill STT Child Process `);
//     stt?.stdin?.pause();
//     stt?.kill('SIGKILL');   
// });
 
   
export function StartTranscription(port, argv) { 
    console.log('start stt service')
    // if (argv.stt != 'OFF')
 

    stt = spawn(`./microphone/venv/bin/python3`,
        [`./microphone/main.py`, `${port}`],
        {
            detached: true,   
            stdio: ['ignore', 'ignore', 'ignore'] 
        }); 
  
    stt.unref();
   
    // stt.stdout.on('data', (data) => {
    //     console.log(`STT stdout: ${data}`); 
    // });

    // stt.stderr.on('data', (data) => {
    //     console.error(`STT stderr: ${data}`);
    // });

    // stt.on('close', (code) => {
    //     console.log(`stt process exited with code ${code}`);
    // });
}

