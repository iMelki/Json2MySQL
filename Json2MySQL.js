
// Require modules:
var fs = require( "fs" );
var JSONStream = require( "JSONStream" );
var es = require('event-stream');
var debug = require('debug')('Main');
var events = require('events');

// Create Events:
var eventEmitter = new events.EventEmitter();

// Require DB Connection:
var db = require('./DBConnect');

var jsonPath = process.argv[2];
var dbName = 'accountsDB';
var tblName = 'accounts';
var first = true;
var showConsoleComments = (process.argv[3]=='true' ? true : false);
var istableReady = false;


// create a stream to read & pass JS objs from the JSON file:
var getStream = function () {
    var stream = fs.createReadStream(jsonPath, {encoding: 'utf8'}),
        //transformStream 1 - Parser:
        parser = JSONStream.parse('*');
        return stream.pipe(parser);
};

//start Streaming and deal with each JSO seperately 
var getTableFromFirstObject = function(){
    debug('Streaming the first JSO from the input file to build a table..');
    getStream()
        .pipe(es.mapSync(function (obj) {
            if (first){
                first = false;
                db.buildTable(obj);
            }
        }));   
}

//start Streaming and deal with each JSO seperately 
var startStreaming = function(){
    debug('Streaming all JSOs from the input file..');
    getStream()
        .pipe(es.mapSync(function (obj) {
            db.insertToDB(obj);
        }));   
}

eventEmitter.on('Database_created!', getTableFromFirstObject);

eventEmitter.on('Table_created!', startStreaming);


// Main function:
async function startScript(){
    await db.init('localhost', 'root', 'root', dbName, tblName, eventEmitter, showConsoleComments);
    await db.runDatabase();
}

startScript();





