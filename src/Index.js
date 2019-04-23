const zip = require('./Zip');
const os  = require('os');
const fs  = require('fs');
const EpubCompress = require('./EpubCompress');
const argv  = require('yargs')
    .option('f', {
        alias: 'file',
        demand: true,
        describe: 'please assign the file path that you want compress',
        type: 'string'
    })
    .option('o', {
        alias: 'output',
        demand: false,
        describe: 'the file output name',
        default: './file.epub',
        type: 'string'
    })
    .argv;


const cpr = new EpubCompress(argv.f, argv.o);

cpr.init().then(()=>{
    return cpr.compress();
});
process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});



