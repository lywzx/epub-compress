const Util = require('./Util');
const fs   = require('fs');
const path = require('path');
const Zip  = require('./Zip');
const mime = require('mime-types');
const ImageAdapter = require('./adapter/ImageAdatper');
const CopyFileAdapter = require('./adapter/CopyFileAdapter');

class EpubCompress {

    /**
     *
     * @param file
     * @param tempDir
     */
    constructor(file, to,  tempDir = './temp') {
        let fileParse = path.parse(file);
        this.to = tempDir;
        this.file = file;
        this.tempDir = path.join(tempDir, fileParse.name);
        this.sync_info    = {};
        this.tempToDir = path.join(tempDir, fileParse.name + '_to');
        this.config_path = path.join(this.tempToDir, '_config.json');
    }

    _initTempDir() {
        return Promise.all([new Promise((resolve, reject) => {
            Util.mkdirs(this.tempDir, resolve);
        }, new Promise((resolve, reject) => {
            Util.mkdirs(this.tempToDir, resolve);
        }))]);
    }

    _initSyncLastExtractInfo() {
        return new Promise((resolve, reject) => {
            fs.stat(this.config_path, (err, stat) => {
                if (stat && stat.isFile()) {
                    fs.readFile(this.config_path, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            let result = data.toString();
                            this.sync_info = JSON.parse(result);
                            resolve(result);
                        }
                    });
                } else {
                    return resolve(this.saveProgress({}));
                }
            })
        });
    }

    _cleanToFile() {
        return new Promise(function(resolve, reject) {
            fs.stat(this.to, function() {
                fs.remove()
            })
        })
    }

    init() {
        return this._initTempDir().then(() => this._initSyncLastExtractInfo());
    }

    clean() {

    }

    compress() {
        let sync_info = this.sync_info;
        let pro = null;
        if (!(sync_info.file_list || sync_info.resolve_list)) {
            pro = Zip.unZip(this.file, this.tempDir).then(()=>{
                return Util.getFiles(this.tempDir);
            }).then((files)=>{
                console.log(files);
                return this.saveProgress({
                    file_list: files,
                    resolve_list: []
                });
            });
        } else {
            pro = Promise.resolve();
        }
        return pro.then(()=>{
            let { file_list, resolve_list } = this.sync_info;
            let todoList = Util.arrayDiff(file_list, resolve_list);

            let adapters = EpubCompress.adapter.list;
            let adpRun = {};
            for (let i = 0, j = todoList.length; i < j; i++ ) {
                let from = todoList[i];
                let to = from.replace(this.tempDir, this.tempToDir);
                let mimeType = mime.lookup(from);

                let toString = Object.prototype.toString;
                let notAdapter = true;
                for (let k = 0, l = adapters.length; k < l; k++) {
                    let current = adapters[k];
                    if (toString.call(current.rule) === '[object RegExp]' && current.rule.test(mimeType)) {
                        if (!adpRun[k]) {
                            adpRun[k] = [];
                        }
                        adpRun[k].push([from, to]);
                        notAdapter = false;
                        break;
                    } else if (toString.call(current.rule) === '[object String]' && current.rule.toLowerCase() === mimeType.toLowerCase()) {
                        if (!adpRun[k]) {
                            adpRun[k] = [];
                        }
                        adpRun[k].push([from, to]);
                        notAdapter = false;
                        break;
                    }
                }
                if (notAdapter) {
                    if (!adpRun['default']) {
                        adpRun['default'] = [];
                    }
                    adpRun['default'].push([from, to]);
                }

            }

            let promise = [];
            for (let i in adpRun) {
                let current = adpRun[i];
                let adapter = adapters[i] || EpubCompress.adapter[i];
                if ( !('single' in adapter) || adapter.single === true ) {
                    promise.push.call(promise, current.map(function(it) {
                        return Promise.resolve(adapter.adapter(it[0], it[1]));
                    }));
                } else {
                    promise.push(Promise.resolve(adapter.adapter(adpRun[i])))
                }
            }


            return Promise.all(promise);
        }).then((result)=> {
            let resolved = [];

            for (let i = 0, j = result.length; i < j; i++) {
                let current = result[i];
                if (typeof current === 'string') {
                    resolved.push(current);
                } else if (current && current.resolve_list) {
                    resolved.push.apply(current.resolve_list);
                }
            }
            return this.saveProgress({
                resolve_list: resolved
            });
        });
    }

    saveProgress(progress) {
        this.sync_info = Object.assign({}, this.sync_info, progress);
        return new Promise((resolve, reject)=>{
            fs.writeFile(this.config_path, JSON.stringify(this.sync_info), 'utf8', (err) => {
                if (err) {
                    return reject(err);
                }
                // create a empty file
                resolve(this.sync_info);
            });
        });
    }
}

EpubCompress.adapter = {
    list: [{
        // 注册为批量处理
        rule: /^image\/[a-z]+$/,
        adapter: ImageAdapter,
        single: false
    }],
    default: {
        adapter: CopyFileAdapter
    }
};


module.exports = EpubCompress;