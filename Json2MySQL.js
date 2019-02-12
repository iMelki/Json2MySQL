// FOR DEBUGING USES ONLY:
var recordLimit = 1;
///////////////////////////


// Require modules:
var fs = require( "fs" );
var JSONStream = require( "JSONStream" );
var es = require('event-stream');
var mysql = require('mysql');
var async = require("async");

var jsonPath = process.argv[2]; //'inputs/data.json'; //
var db;
var dbName = 'accountsDB';
var tblName = 'accounts';

//init:
var init = function(cb){
    console.log('init:');
    // Create connection
    db = crtConnection();
    cb();
}

// Create DB Connection
var crtConnection = function(){
    return mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root'
    });
}

// Connect to DB
var connectToDB = function(cb){
    console.log('trying to connect..');
    db.connect((err) => {
        if(err){
            console.log('ERROR connecting!');
            throw err;
        }
        connectionSucceeded(cb);
    });
}

// Connection Succeeded
var connectionSucceeded = function(cb){
    console.log('MySql Connected.');
    cb();
}

// Create DB
var createDB = function(cb){
    console.log('creating DB..');
    var sqlQry = 'CREATE DATABASE IF NOT EXISTS '+dbName;
    db.query(sqlQry, function (err, result) {
        if(err) throw err;
        console.log('Database created!');
        cb();
    });
}

// create MySQL Table to hold the JSON data
var buildSchema = function(cb){
    console.log('build Schema:');
    //getFirstObj();

    var sqlQry = 'CREATE TABLE ' + dbName + '.accounts ( '
        +"_id VARCHAR(128) PRIMARY KEY, "
        +"name VARCHAR(128), "
        +"provider VARCHAR(128), "
        +"privateAccountOwner VARCHAR(128), "
        +"canUsePrivateRepos VARCHAR(128), "
        +"limits VARCHAR(128), "
        +"build VARCHAR(128), "
        +"admins VARCHAR(128), "
        +"__v VARCHAR(128)"
    +")";
    //console.log(sqlQry);
    
    db.query(sqlQry, (err, result) => {
        if(err) throw err;
        console.log('Schema created!');
        cb();

    });
    
}

var getFirstObj = function(){
    console.log('get First Obj:');
}

var appFinished = function(cb){
    setTimeout(
        () => {
            console.log('app finished.');
            dropDB(cb);
        },
        1000
    );
    //cb();
}

// Drop DB
var dropDB = function(cb){
    console.log('droping DB..');
    var sqlQry = 'DROP DATABASE IF EXISTS '+dbName;
    db.query(sqlQry, (err, result) => {
        if(err) throw err;
        console.log('Database dropped!');
        cb();
    });
}
     
// create a stream to read & pass JS objs from the JSON file:
var getStream = function () {
    var stream = fs.createReadStream(jsonPath, {encoding: 'utf8'}),
        //transformStream 1 - Parser:
        parser = JSONStream.parse('*');
        return stream.pipe(parser);
};

//start Streaming and deal with each JSO seperately 
var startStreaming = function (cb) {
    console.log('Start Streaming:');
    getStream()
        .pipe(es.mapSync(function (obj) {
            insertToDB(dbName+"."+tblName, obj, cb);
        }));   
}

//a function to calculate an object's size
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * JSOToStr gets a JSO & type of data to extract
 * and extracts its indices OR values to MySQL query
 * @param {String} type - the type to insert ('index' OR 'value')
 * @param {Object} jso
 * @param {String} mainIndex - the index of the JSO itself 
 * to add to the indices' column names in the MySQL query
 */
var JSOToStr = function(type, jso, mainIndex){
    var qry = "";
    var i = 0;
    var indexQry;
    var valueQry;
    for (var index in jso) {
        indexQry = mainIndex+":"+index;
        valueQry = typeof(jso[index]) == 'string' ? '"' + jso[index].replace(/"/g, '\\"') + '"' : jso[index];
        qry += ( type == 'index' ? indexQry : valueQry);
        qry += ( i+1 == Object.size(jso) ? '' : ', ');
        i++;
    }
    return qry;
}

/**
 * insertToDB gets a JSO
 * build & exec an insert MySQL query
 * @param {String} tableName - the table to insert to 
 * @param {Object} jsonData - the JSO 
 * @param {Function} callback
 */
var insertToDB = function (tableName, jsonData, callback) {
    console.log("insert Qry:");
    if (tableName && jsonData) {
        if (Object.size(jsonData) > 0) {
            var mysqlQuery = 'INSERT INTO ' + tableName + ' (';
            var i = 0;
            for (var index in jsonData) {
                if(typeof(jsonData[index]) == 'object' && !(jsonData[index] instanceof Array)){
                    mysqlQuery += JSOToStr('index',jsonData[index], index);
                }else{
                    mysqlQuery += index;
                }
                mysqlQuery += (i + 1 == Object.size(jsonData) ? ') ' : ', ');
                i++;
            }
            i = 0;
            mysqlQuery += 'VALUES (';
            for (index in jsonData) {
                if(typeof(jsonData[index]) == 'object'){
                    if (jsonData[index] instanceof Array){
                        var valStr = "";
                        for(val in jsonData[index]){
                            valStr += jsonData[index][val]+",";
                        }
                        mysqlQuery += '"'+valStr.substring(0, valStr.length-1)+'"';
                    }else{
                        //console.log(JSON.stringify(jsonData[index]));
                        mysqlQuery += JSOToStr('value',jsonData[index], index);
                    }
                }else{
                    mysqlQuery += typeof(jsonData[index]) == 'string' ? '"' + jsonData[index].replace(/"/g, '\\"') + '"' : jsonData[index];
                }
                mysqlQuery += (i + 1 == Object.size(jsonData) ? ') ' : ', ');
                i++;
            }
            // db.query(mysqlQuery, callback);
            console.log(mysqlQuery);
        }
        else {
            callback(new Error('mysql-json [insert]: data has to contain at least one field'), null);
        }
    }
    else {
        callback(new Error('mysql-json [insert]: Require at least a tableName and a data'), null);
    }
};

// Start all functions sequentially 
async.series([init, connectToDB, dropDB, createDB, 
            buildSchema/*, startStreaming, appFinished*/],
         function (err, results) {
            // results is an array of the value returned from each function
            if (err)    {
                console.log(err);
                appFinished();
            }
            startStreaming();
});

//appFinished();