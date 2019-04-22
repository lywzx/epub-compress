const fs = require('fs');
const path = require('path');
const Util = require('../Util')

function copyFile(src, dest) {
    return new Promise(function(resolve, reject){
        let readStream = fs.createReadStream(src);
        readStream.once('error', reject);
        readStream.once('end', ()=>{
            resolve(src);
        });
        readStream.pipe(fs.createWriteStream(dest));
    })
}

function CopyFileAdapter(from, to) {
    return new Promise((resolve) => {
        Util.mkdirs(path.parse(to).dir, () => {
            return resolve(copyFile(from, to));
        });
    });
}

module.exports = CopyFileAdapter;