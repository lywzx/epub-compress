const StreamZip = require('node-stream-zip');
const fs        = require('fs');
const archiver  = require('archiver');


/**
 * compress file or extract file
 */
class Zip {

    /**
     *
     * @param from
     * @param to
     * @returns {Promise<any>}
     */
    static unZip(from, to) {
        const zip = new StreamZip({
            file: from,
            storeEntries: true
        });


        return new Promise((resolve, reject) => {
            zip.on('error', reject);
            zip.on('ready', () => {
                zip.extract( null, to, (err, count) => {
                    zip.close();
                    if (err) {
                        reject(`Extract error`);
                    } else {
                        resolve(count);
                    }
                });
            });
        });
    }

    /**
     *
     * @param directory
     * @param file
     * @constructor
     */
    static zip(directory, file) {
        let output = fs.createWriteStream(file);
        let archive = archiver('zip', {
            zlib: {
                level: 9
            }
        });
        archive.pipe(output);
        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
        });

        // This event is fired when the data source is drained no matter what was the data source.
        // It is not part of this library but rather from the NodeJS Stream API.
        // @see: https://nodejs.org/api/stream.html#stream_event_end
        output.on('end', function() {
            console.log('Data has been drained');
        });

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });

        // good practice to catch this error explicitly
        archive.on('error', function(err) {
            throw err;
        });


        archive.directory(directory, false);

        // finalize the archive (ie we are done appending files but streams have to finish yet)
        // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
        archive.finalize();
    }
}

module.exports = Zip;