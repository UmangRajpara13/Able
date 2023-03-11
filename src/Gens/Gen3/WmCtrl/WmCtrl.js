import { spawn, execSync } from "child_process"
import { access, constants } from "fs"

export class WMCtrl {
  constructor(){
	   access('/usr/bin/wmctrl',constants.R_OK,(err)=>{
      if(err) throw new Error('wmctrl not found, please install wmctrl before using this package. (sudo apt install wmctrl)')
     })
  }
  getWindows(){
    return this.run('-l','-x', '-p', '-G')
      .then(ret=>ret.split('\n').filter(l=>l).map(line=>{
        // 0x02aabec2  0 3244   1604 37   1436 861  sublime_text.Sublime_text  IMS-ADAM ~/projects/node/node-wmctrl/index.js (node-wmctrl) - Sublime Text (UNREGISTERED)
        let regex = /0x([\da-f]+) +(\d+) +(\d+) +(-?\d+) +(\d+) +(\d+) +(\d+) +([a-z0-9._-]+) +([a-z0-9_-]+) +(.+)$/i
        let [,id,desktop,pid,x,y,width,height,className,hostname,name] = line.match(regex) || []
        id = parseInt(id,16)
        return { line, id, desktop, pid, x, y, width, height, className, hostname, name }
      }))
  }
  activate(win){
    let id = win.id || win
    return this.run('-i','-a',id)
  }
  close(win){
    let id = win.id || win
    return this.run('-i','-c',id)
  }
  setLongName(win,name){
    let id = win.id || win
    return this.run('-i','-r',id,'-N',name)
  }
  setIconName(win,name){
    let id = win.id || win
    return this.run('-i','-r',id,'-I',name)
  }
  setName(win,name){
    let id = win.id || win
    return this.run('-i','-r',id,'-T',name)
  }
  run(...args){
    return new Promise((resolve,reject)=>{
      let child = spawn('wmctrl',args)
      let stdout = ''
      let stderr = ''
      child.stdout.on('data',d=>stdout+=d.toString())
      child.stderr.on('data',d=>stderr+=d.toString())
      child.on('close',()=>stderr?reject(stderr):resolve(stdout))
    })
  }
}
