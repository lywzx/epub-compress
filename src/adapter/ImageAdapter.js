const path = require('path');
const compress_images = require('compress-images');
const Util = require('../Util');


function ImageCompress(image) {
    let [from, to] = image;
    console.log(`${from}: 开始压缩`);

    return new Promise((resolve, reject) => {
        compress_images(from, from, {
                compress_force: false,
                statistic: true,
                autoupdate: true
            }, false,
            {jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
            {png: {engine: 'pngquant', command: ['--quality=20-50']}},
            {svg: {engine: 'svgo', command: '--multipass'}},
            {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(error, completed, statistic){
                if (error === null) {
                    let {
                        path_out_new
                    } = statistic;

                    Util.moveFile(path_out_new, to, function(err, result) {
                        if (!err) {
                            console.log(`${from}: 压缩成功`);
                            resolve(image);
                        } else {
                            console.log(`${from}: 压缩失败`);
                            reject(image);
                        }
                    });
                } else {
                    console.log(`${from}: 压缩失败`);
                    reject(image);
                }
            });
    });
}

module.exports = ImageCompress;