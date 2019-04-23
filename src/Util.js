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
                                if (isArray(current)) {
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

function moveFile(src, dest, callback) {
    let stat = fs.statSync(src);
    if (!stat.isFile()) {
        debugger
    }
    fs.rename(src, dest, function(err) {
        console.log(src, dest, err);
        if (err) {
            if (err.code === 'EXDEV') {
                copyFile(src, dest, function(err, result) {
                    if (err) {
                        callback(err);
                        return ;
                    }
                    fs.unlink(src, function(err) {
                        if (err) {
                            callback(err);
                            return ;
                        }
                        callback(null, dest);
                    })
                })
            } else {
                callback(err);
            }
            return ;
        }
        callback(null, dest);
    })
}

function copyFile(src, dest, callback) {
    let readStream = fs.createReadStream(src);
    readStream.once('error', (err) => {
        isFunction(callback) && callback(err, null);
    });
    readStream.once('end', ()=>{
        isFunction(callback) && callback(null, dest);
    });
    readStream.pipe(fs.createWriteStream(dest));
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

function is(type) {
    let toString = Object.prototype.toString;
    return function(arg) {
        return toString.call(arg) === type;
    }
}
const isArray = is('[object Array]');
const isString = is('[object String]');
const isFunction = is('[object Function]');
const isRegExp = is('[object RegExp]');
const isObject = is('[object Object]');

exports.mkdirs = mkdirs;
exports.getFiles = getFiles;
exports.arrayDiff = arrayDiff;
exports.moveFile  = moveFile;
exports.copyFile  = copyFile;
exports.isArray   = isArray;
exports.isString  = isString;
exports.isFunction = isFunction;
exports.isRegExp  = isRegExp;
exports.isObject = isObject;
