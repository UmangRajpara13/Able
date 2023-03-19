

import fs from 'fs';
import path from 'path';


var sentences = [], labels = []

function readDirectory(dir) {
    const files = fs.readdirSync(dir);

    const jsonFiles = files.filter((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        return stat.isFile() && path.extname(filePath) === '.json';
    });

    const directories = files.filter((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        return stat.isDirectory();
    });

    const sentences = [];

    jsonFiles.forEach((file) => {
        const filePath = path.join(dir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const obj = JSON.parse(fileContent);
        console.log(obj)

        if (obj.global) {
            const commandObjects = Object.keys(obj.global)

            commandObjects.forEach((command) => {
                // console.log(obj.global[`${command}`]["paraphrases"])
                obj.global[`${command}`]["paraphrases"].forEach(paraphrase => {
                    sentences.push(paraphrase)
                    labels.push(command)
                })
            });
        }
        if (obj.onActiveWindow) {
            const commandObjects = Object.keys(obj.onActiveWindow)

            commandObjects.forEach((command) => {
                //   console.log(obj.global[`${command}`]["paraphrases"])
                obj.onActiveWindow[`${command}`]["paraphrases"].forEach(paraphrase => {
                    sentences.push(paraphrase)
                    labels.push(command)
                })
            });
        }
    });

    directories.forEach((directory) => {
        const subDir = path.join(dir, directory);
        readDirectory(subDir)
    });
    //   return sentences;
}

// Usage:
const directory = './able_store/Gen3';
readDirectory(directory);
console.log(sentences, labels);


