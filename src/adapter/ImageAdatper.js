const tinypng = require('tinypng-fs');
const mapLimit = require('async.maplimit');

function ImageAdapter(images) {
    // 图片批量处理
    return new Promise((resolve, reject) => {
        mapLimit(images, 1, (it, callback) => {
            tinypng.minifiyFile(it[0], it[1]).then((result)=>{
                callback(null, it[0]);
            }).catch(function(err) {
                callback(it[0]);
            });
        }, function(err, result) {
            resolve({
                resolve: result,
                reject: err
            });
        });
    });
}

module.exports = ImageAdapter;