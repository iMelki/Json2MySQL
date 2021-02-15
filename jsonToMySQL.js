
// Require modules:
const fs = require( "fs" );
const JSONStream = require( "JSONStream" );
const es = require('event-stream');
const debug = require('debug')('Main');
const path = require('path');


// Require Configuration settings:
const config = require('./config.js');
// Require DB Connection:
const db = require('./dbManipulator');

let first = true;
let i;

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
    let i=2;
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
    try{
        var stream = fs.createReadStream(config.jsonPath, {encoding: 'utf8'});
        var parser = JSONStream.parse('*');
        return stream.pipe(parser);
    }catch(err){
        throw new Error('JSON file corrupted or is not found!');
    }
};

//start Streaming to get the first JSO and build the DB Table from its image
async function getTableFromFirstObject(){
    return new Promise(function(res, rej){
        debug('Streaming the first JSO from the input file to build a table..');
        var j=0;
        var firstStream = getStream();
        firstStream.on('close', async () => { debug('bye First!');})
        firstStream.pipe(es.mapSync(async function(obj) {
                if (first){
                    //close. distroy, end
                    debug('ending firstStream..');
                    firstStream.end();
                    first = false;
                    debug('firstStream ended.');
                    var tableCreated = await db.buildTable(obj);
                    if (tableCreated) res();
                    else rej('Error creating table');
                }else{
                    debug((j++)+' : how did you get through the first object?!');
                }
            }));
    });
}

//start Streaming and deal with each JSO separately
async function startStreaming(){
    return new Promise(function(res, rej){
        debug('Streaming all JSOs from the input file..');
        var secondStream = getStream();
        secondStream.on('close', async () => {await finishApp(); })
        secondStream.pipe(es.mapSync(async function (obj) {
            try{
                await db.insertToDB(obj);
            }catch(err){
                console.error(err.message);
            }
        }));
    });
}

async function finishApp(){
    debug('finished streaming. queing JSOs to be added to the DB..')
    await db.endConnection();
    console.log('\nThe job is done. all Documents have been moved to the new location, found at: \n');
    console.log(config.host+', under database named "'+config.dbName+'", inside table named "'+config.tblName+'".\n');
    debug('Good bye! :)');
}


// Main function:
exports.startScript = async function(dbName, mySqlUser, mySqlPass, rootPass){
    try{
        config.initDbParams(dbName, mySqlUser, mySqlPass, rootPass);
        console.log('JSON2MySQL started. \nworking..');
        //await validateInput();
        //await db.init(config.host, config.user, config.password, config.dbName, config.tblName);
        await db.init(config.host, config.user, config.password, config.dbName, config.tblName);
        await db.runDatabase();
        // dlt next row when app's rdy:
        await db.dropTable(config.tblName);
        ////////
        await getTableFromFirstObject();
        await startStreaming();
    }catch(err){
        console.error(err.message);
        await db.endConnection();
    }
}

exports.getAllAccounts = async function() {
    try{
        return await db.getAllRecords();
    }catch(err){
        console.error(err);
    }
}







