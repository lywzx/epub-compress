const fs = require('fs');
const path = require('path');
const Util = require('../Util');

function copyFile(src, dest) {
    return new Promise(function(resolve, reject){
        Util.copyFile(src, dest, function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(src);
            }
        });
    })
}

function CopyFileAdapter(file) {
    let [from, to] = file;
    return new Promise((resolve, reject) => {
        console.log(`开始复制文件：${from}`);
        Util.mkdirs(path.parse(to).dir, () => {
            return resolve(copyFile(from, to).then((it)=>{
                console.log(`${from}：文件复制成功`);
                return file;
            }).catch(() => {
                consoe.log(`${from}: 处理复制失败`);
                return Promise.reject(file);
            }));
        })
    });
}

module.exports = CopyFileAdapter;