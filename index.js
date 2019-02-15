
// Require modules:
var fs = require( "fs" );
var JSONStream = require( "JSONStream" );
var es = require('event-stream');
var debug = require('debug')('Main');
var events = require('events');
var path = require('path');

// Create Events:
var eventEmitter = new events.EventEmitter();

// Require Configuration settings:
var config = require('./config.js');
// Require DB Connection:
var db = require('./dbManipulator');

var first = true;

/**
 *  a handler for inputing config arguments
 * @param argNum the index in the process.argv 
 * @param atrName the attribute name inside the config file
 * @returns true if got input. false, otherwise.
 */
async function getConfigAtribute(argNum, atrName){
    var ans = false;
    if(process.argv[argNum] && process.argv[argNum].length>0){
        config[atrName] = process.argv[argNum];
        ans =  true;
    }else if(config[atrName] && config[atrName].length>0){
        ans = true;
    }
    return ans;
}


// validate whether we got all the input needed to run the app
async function validateInput(){
    debug('validating input..');
    var i=2;
    const gotJSONPath = await getConfigAtribute(i++, 'jsonPath');
    if (gotJSONPath){
        const gotDBName = await getConfigAtribute(i++, 'dbName');
        if (gotDBName){
            const gotTblName = await getConfigAtribute(i++, 'tblName');
            if (gotTblName){
                debug('Got all config input needed.');
            }else{
                throw new Error('you need to specify a JSON file path in config.js{jsonPath} or using the command\n "node index.js %file_path%"');
            }
        }else{
            throw new Error('you need to specify a DB name in config.js{dbName} or using the command\n "node index.js %file_path% %DB_name%"');
        }
    }else{
        throw new Error('you need to specify a JSON file path in config.js{jsonPath} or using the command\n "node index.js %file_path%"');
    }
}


// create a stream to read & pass JS objs from the JSON file:
var getStream = function () {
    var stream = fs.createReadStream(config.jsonPath, {encoding: 'utf8'}),
        //transformStream 1 - Parser:
        parser = JSONStream.parse('*');
        return stream.pipe(parser);
};

//start Streaming to get the first JSO and build the DB Table from its image
async function getTableFromFirstObject(){
    return new Promise(function(res, rej){
        debug('Streaming the first JSO from the input file to build a table..');
        var firstStream = getStream();
        firstStream.pipe(es.mapSync(async function(obj) {
                if (first){
                    first = false;
                    var tableCreated = await db.buildTable(obj);
                    if (tableCreated) res();
                    else rej('Error creating table');
                    //firstStream.distroy();
                }
            })); 
    });
}

//start Streaming and deal with each JSO seperately 
async function startStreaming(){
    return new Promise(function(res, rej){
        debug('Streaming all JSOs from the input file..');
        getStream()
            .pipe(es.mapSync(async function (obj) {
                try{
                    await db.insertToDB(obj);
                }catch(err){
                    console.error(err.message);
                }
            }));   
    });
}

async function finishApp(){
    debug('finishApp:');
    Console.log('The job is done. all Documents have been moved to the new location, found at: \n');
    Console.log(config.host+', inside table named '+config.tblName+' under database named '+config.dbName+'.\n');
    await db.endConnection();
    debug('connection ended.');
}


// Main function:
async function startScript(){
    try{
        await validateInput();
        await db.init(config.host, config.user, config.password, config.dbName, config.tblName, eventEmitter);
        await db.runDatabase();
        await getTableFromFirstObject();
        await startStreaming();
        await finishApp();
    }catch(err){
        await db.endConnection();
        console.error(err.message);
    }
}

startScript();





