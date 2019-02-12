// FOR DEBUGING USES ONLY:
var recordLimit = 1;
///////////////////////////


//var JSONStream = require( "JSONStream" );

const StreamArray = require('stream-json/streamers/StreamArray');
//const StreamArray = require('stream-json/streamers/StreamValues');
const {Writable} = require('stream');
//const path = require('path');
const fs = require('fs');

jsonPath = process.argv[2];  
/*jsonPath = path.join(__dirname, '/inputs/accounts.json');
jsonPath = 'D:/Milky/Drive/Work/Programing/Learning/Gendler Tasks/Codefresh Assignment/Json2MySQL/inputs/accounts.json';
*/
const fileStream = fs.createReadStream(jsonPath);
const jsonStream = StreamArray.withParser();

const processingStream = new Writable({
    write({key, value}, encoding, callback) {
        //Save to mongo or do any other async actions
        console.log(key);
        console.log(value);
        setTimeout(() => {
            console.log(value);
            //Next record will be read only current one is fully processed
            callback();
        }, 1000);
    },
    //Don't skip this, as we need to operate with objects, not buffers
    objectMode: true
});

//Pipe the streams as follows
fileStream.pipe(jsonStream.input);
jsonStream.pipe(processingStream);

//So we're waiting for the 'finish' event when everything is done.
processingStream.on('finish', () => console.log('All done'));

