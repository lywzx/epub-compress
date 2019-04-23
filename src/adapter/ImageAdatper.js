const tinypng = require('tinypng-fs');
const mapLimit = require('async.maplimit');
const Util     = require('../Util');

function ImageAdapter(images, success) {
    // 图片批量处理
    return new Promise((resolve, reject) => {
        let resolved = [];
        let rejected  = [];
        mapLimit(images, 4, (it, callback) => {
            console.log(`开始处理：${it[0]}`);
            tinypng.minifiyFile(it[0], it[1]).then((result)=>{
                if (Util.isFunction(success)) {
                    success(it[0]);
                }
                resolved.push(it[0]);
                callback(null, it[0]);
                console.log(`${it[0]}：处理成功`);
            }).catch(function(err) {
                callback(null);
                rejected.push(it);
                console.log(`${it[0]}：处理失败`);
            });
        }, function(err, result) {
            if (rejected && rejected.length) {
                reject(rejected);
            } else {
                resolve(resolved);
            }
        });
    });
}

module.exports = ImageAdapter;