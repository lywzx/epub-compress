const zip = require('../src/Zip');

// unzip file

/*
zip.unZip('./alice.epub', './b').then(function() {

    // zip file
    return zip.zip('./b', './alice1.epub');

}).catch((e)=>{
    debugger
});
*/

zip.zip('./b', './alice1.epub');