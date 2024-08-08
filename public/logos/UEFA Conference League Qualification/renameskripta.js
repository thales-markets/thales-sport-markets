const { readdirSync, rename } = require('fs');
const { resolve } = require('path');

// Get path to image directory
const imageDirPath = resolve(__dirname, './');

// Get an array of the files inside the folder
const files = readdirSync(imageDirPath);

// Loop through each file that was retrieved
files.forEach(file => {
    const newFileName = file.toLowerCase().split(' ').join('-');
    rename(
        imageDirPath + `/${file}`,
        imageDirPath + `/${newFileName}`,
        err => console.log(err)
    )
});