const fs = require('fs');
const path = require('path');


function mkdirs(dirname, callback) {
    fs.exists(dirname, function(exists) {
        if (exists) {
            callback();
        } else {
            mkdirs(path.dirname(dirname), function() {
                fs.mkdir(dirname, callback);
            })
        }
    })
}

function getFiles(dirname) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirname, function(err, files) {
            if (!err) {
                let promises = [];
                for (let i = 0, j = files.length; i <j; i++) {
                    let current = path.join(dirname, files[i]);
                    promises.push(new Promise((resolve, reject) => {
                        fs.stat(current, function(err, stat){
                            if (stat.isFile()) {
                                resolve([current]);
                            } else if(stat.isDirectory()) {
                                resolve(getFiles(current));
                            } else {
                                resolve(null);
                            }
                        });
                    }));
                }
                return Promise.all(promises).then((result)=>{
                    function flatten(result) {
                        let ret = [];
                        for (let i = 0, j = result.length; i < j; i++) {
                            let current = result[i];
                            if (current) {
                                if (Object.prototype.toString.call(current) === '[object Array]') {
                                    ret = ret.concat(flatten(current));
                                } else {
                                    ret.push(current);
                                }
                            }
                        }
                        return ret;
                    }

                    return resolve(flatten(result));
                });
            }
        });
    })
}


function arrayDiff(base, ...arg) {
    let ret = [];
    for (let i = 0, j = base.length; i < j; i++) {
        let isIn = false;
        for (let k = 0, l = arg.length; k < l; k++) {
            if (arg[k].indexOf(base[i]) !== -1) {
                isIn = true;
                break;
            }
        }
        if (!isIn) {
            ret.push(base[i]);
        }
    }
    return ret;
}

exports.mkdirs = mkdirs;
exports.getFiles = getFiles;
exports.arrayDiff = arrayDiff;