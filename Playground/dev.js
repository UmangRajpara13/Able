import { watch } from "chokidar";

watch(['/dev'],{ignored:['/dev/fd']}).on('all', (event, path) => {
    console.log(event, path);
  });