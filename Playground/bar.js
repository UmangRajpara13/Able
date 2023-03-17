function drawProcessingBar() {
    const processingBar = ["|", "/", "-", "\\"];
    let i = 0;
    return setInterval(() => {
      console.clear(); // Clear console before drawing new processing bar
      console.log(`Processing ${processingBar[i++]}`);
      i %= processingBar.length;
    }, 100);
  }
  // Example usage:
const processingInterval = drawProcessingBar();
// Perform some task here...
setTimeout(()=>{
    clearInterval(processingInterval); // Stop the processing bar when the task is complete
},10000)
