
// Require modules:
var fs = require( "fs" );
var JSONStream = require( "JSONStream" );
var es = require('event-stream');
var mysql = require('mysql');
var async = require("async");

var jsonPath = process.argv[2];
var db;
var dbName = 'accountsDB';
var tblName = 'accounts';
var first = true;
var showConsoleComments = (process.argv[3]=='true' ? true : false);

//init:
var init = function(cb){
    if(showConsoleComments) console.log('init:');
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
    if(showConsoleComments) console.log('trying to connect..');
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
    if(showConsoleComments) console.log('MySql Connected.');
    cb();
}

// Create DB
var createDB = function(cb){
    if(showConsoleComments) console.log('creating DB..');
    var sqlQry = 'CREATE DATABASE IF NOT EXISTS '+dbName;
    db.query(sqlQry, function (err, result) {
        if(err) throw err;
        if(showConsoleComments) console.log('Database created!');
        cb();
    });
}

/**
 * buildTable gets a JSO
 * and creates a MySQL Table accordingly to its indices
 * @param {Object} obj - the JSO 
 */
var buildTable = function(obj){
    if(showConsoleComments) console.log('build Table:');
    first = false;
    //getFirstObj();
   
    var sqlQry = 'CREATE TABLE ' + dbName + '.accounts ( ';
    var i = 0;
    for (var index in obj) {
        if(typeof(obj[index]) == 'object' && !(obj[index] instanceof Array)){
            sqlQry += JSOToStr('createTable',obj[index], index);
        }else{
            sqlQry += index + typeOfValue(obj[index]);
        }
        sqlQry += (i + 1 == Object.size(obj) ? '); ' : ', ');
        i++;
    }
    
    db.query(sqlQry, (err, result) => {
        if(err) throw err;
        if(showConsoleComments) console.log('Table created!');
        //cb();
    });
}

/**
 * typeOfValue gets a JSO value
 * and returns its appropriate type in MySQL syntax
 * @param {Object} value - the JSO value
 */
var typeOfValue = function(value){
    if(typeof(value) == 'string') return " VARCHAR(255)";
    if(typeof(value) == 'number') return " INT";
    if(typeof(value) == 'boolean') return " BOOLEAN";
    if(typeof(value) == 'object'){
        if(value instanceof Array) return " VARCHAR(255)";
    }
}

var appFinished = function(cb){
    setTimeout(
        () => {
            if(showConsoleComments) console.log('app finished.');
            dropDB(cb);
        },
        1000
    );
    //cb();
}

// Drop DB
var dropDB = function(cb){
    if(showConsoleComments) console.log('droping DB..');
    var sqlQry = 'DROP DATABASE IF EXISTS '+dbName;
    db.query(sqlQry, (err, result) => {
        if(err) throw err;
        if(showConsoleComments) console.log('Database dropped!');
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
var startStreaming = function () {
    if(showConsoleComments) console.log('Start Streaming:');
    getStream()
        .pipe(es.mapSync(function (obj) {
            //function with flag so she execute only once that get the first obj and get the fie
            if (first) buildTable(obj);
            insertToDB(dbName+"."+tblName, obj);
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
 * @param {String} type - the type to insert ('index', 'value' OR 'createTable')
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
        indexQry = mainIndex+"_"+index;
        valueQry = typeof(jso[index]) == 'string' ? '"' + jso[index].replace(/"/g, '\\"') + '"' : jso[index];
        qry += ( type == 'value' ? valueQry : indexQry);
        if (type == 'createTable') qry += typeOfValue(jso[index]);
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
 */
var insertToDB = function (tableName, jsonData, callback) {
    if(showConsoleComments) console.log("insert Qry:");
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
                        //if(showConsoleComments) console.log(JSON.stringify(jsonData[index]));
                        mysqlQuery += JSOToStr('value',jsonData[index], index);
                    }
                }else{
                    mysqlQuery += typeof(jsonData[index]) == 'string' ? '"' + jsonData[index].replace(/"/g, '\\"') + '"' : jsonData[index];
                }
                mysqlQuery += (i + 1 == Object.size(jsonData) ? ') ' : ', ');
                i++;
            }
            db.query(mysqlQuery);
            //if(showConsoleComments) console.log(mysqlQuery);
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
async.series([init, connectToDB, createDB],
         function (err, results) {
            // results is an array of the value returned from each function
            if (err)    {
                console.log(err);
                appFinished();
            }
            startStreaming();
            console.log("Done.");
});
 
