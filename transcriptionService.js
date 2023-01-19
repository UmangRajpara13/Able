import { execSync, exec, spawn } from 'child_process'

var stt

process.on('SIGINT', function () {
    console.log(`SIGINT: kill STT Child Process `);
    stt.stdin.pause();
    stt.kill();
    process.abort()
});


export function StartTranscription() {
    stt = spawn(`./whisper-mint/STT/bin/python3`, [`./whisper-mint/listen.py`]);

    stt.stdout.on('data', (data) => {
        console.log(`STT stdout: ${data}`);
    });

    stt.stderr.on('data', (data) => {
        console.error(`STT stderr: ${data}`);
    });

    stt.on('close', (code) => {
        console.log(`stt process exited with code ${code}`);
    });
}