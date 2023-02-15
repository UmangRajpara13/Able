import {spawn, spawnSync} from 'child_process'
import { join } from 'path'

console.log(join(process.cwd(),'./able_scripts'))

const execute = spawn(`bash`, ['browse.sh',`Search=world new cars`], {
    cwd: join(process.cwd(),'./able_scripts'),
    detached: true,
    stdio: 'ignore',
})

execute.unref();