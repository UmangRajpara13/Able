import { execSync } from 'child_process'

export function WindowManager() {
  // Get an array of window IDs in hex
  const windowIds = execSync('wmctrl -l | awk \'{ print $1 }\'').toString().trim().split('\n');
  const monitors = execSync('xrandr | grep \' connected\' | awk \'{ print $1 }\'').toString().trim().split('\n');
  if (windowIds.length > 1 && monitors.length > 1 && !(windowIds.length>monitors.length)) {
    // console.log(windowIds.length, monitors.length)

    // Loop through the window IDs and get the upper-left coordinates
    const windowCoordinates = [];

    windowIds.forEach((windowId) => {
      try {
      const output = execSync(`xwininfo -id ${windowId} | grep -E 'Absolute upper-left X:|Absolute upper-left Y:|Width:|Height:'`).toString().trim().split('\n');
      const posX = parseInt(output[0].split(':')[1].trim());
      const posY = parseInt(output[1].split(':')[1].trim());
      const width = parseInt(output[2].split(':')[1].trim());
      const height = parseInt(output[3].split(':')[1].trim());
      windowCoordinates.push({ windowId, posX, posY, width, height });
      } catch (error) {
        console.error(error)
      }
    })

    // Get an array of monitors and their upper-left coordinates
    const monitorCoordinates = [];
    for (const monitor of monitors) {
      var output = execSync(`xrandr | grep -w ${monitor} | awk '{ print $3 }'`).toString().trim().split('+');
      if (output == 'primary') {
        output = execSync(`xrandr | grep -w ${monitor} | awk '{ print $4 }'`).toString().trim().split('+');
      }
      const pixelX = parseInt(output[0].split('x')[0]);
      const pixelY = parseInt(output[0].split('x')[1]);
      const posX = parseInt(output[1]);
      const posY = parseInt(output[2]);
      monitorCoordinates.push({ monitor, pixelX, pixelY, posX, posY });
    }
    // Loop through the window coordinates and check which monitor they belong to
    const monitorInUse = [];
    const windowsToMove = [];
    for (const window of windowCoordinates) {
      var monitorIndex = -1
      for (const monitor of monitorCoordinates) {
        if (window.posX >= monitor.posX && window.posY >= monitor.posY) {
          monitorIndex += 1
        } else break;
      }
      if (!monitorInUse.includes(monitorCoordinates[monitorIndex])) {
        monitorInUse.push(monitorCoordinates[monitorIndex])
        // console.log(monitorInUse)
      } else {
        windowsToMove.push(window)
        // console.log(windowsToMove)
      }
    }

    if (windowIds.length > monitorInUse.length) {
      let availableMonitors = monitorCoordinates.filter(obj1 => !monitorInUse.some(obj2 => obj1.monitor === obj2.monitor));
      // console.log(windowsToMove, availableMonitors)
      const newPosX = availableMonitors[0]?.posX
      const newPosY = availableMonitors[0]?.posY
      // console.log('move to', windowsToMove[0]?.windowId, newPosX, newPosY)

      execSync(`xdotool windowmove ${windowsToMove[0]?.windowId} ${newPosX} ${newPosY}`)
      // if (availableMonitors.length > 1) {
      //   // we have to make a choice
      // }
      // else {
      //   // move straight away
      // }
    } else {
      // console.log('dont')
    }

  }
  setTimeout(() => {
    WindowManager()
  }, 1000)
}
