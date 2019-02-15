
// Require modules:
var mysql = require('promise-mysql');
var debug = require('debug')('DB');

var _connection;
var _host = "";
var _user = "";
var _password = "";
var _dbName = "";
var _tblName = "";


// Public Functions:
///////////////////////

/**
 * initialize DB module with connection parameters
 * @param {string} hostStr DB host address
 * @param {*string} userStr DB username
 * @param {*string} pwStr DB password
 */
exports.init = async function(hostStr, userStr, pwStr, dbName, tblName){
    debug('initializing DB');
    [_host, _user, _password, _dbName, _tblName] = [hostStr, userStr, pwStr, dbName, tblName];
}

// Start all functions sequentially 
/**
 * 
 */
exports.runDatabase = async function(){
    _connection = await crtConnection();
    //await connectToDB();
    await createDB();
}
 
/**
 * buildTable gets a JSO
 * and creates a MySQL Table accordingly to its indices
 * @param {Object} obj - the JSO 
 */
exports.buildTable = async function(obj){
    debug('Building Table..');
    var sqlQry = 'CREATE TABLE IF NOT EXISTS ' + _dbName + '.'+_tblName+' ( ';
    var i = 0;
    for (var index in obj) {
        if(typeof(obj[index]) == 'object' && !(obj[index] instanceof Array)){
            sqlQry += await JSOToStr('createTable',obj[index], index);
        }else{
            sqlQry += index + typeOfValue(obj[index]);
        }
        sqlQry += (i + 1 == Object.size(obj) ? '); ' : ', ');
        i++;
    }
    try{    
        await _connection.query(sqlQry);
        debug('Table created!');
        return true;
    }catch(err){
        throw new Error('Error! Failed creating table "'+ _tblName+'" inside DB "'+_dbName+'".');
    }
        
}

/**
 * insertToDB gets a JSO
 * build & exec an insert MySQL query
 * @param {String} tableName - the table to insert to 
 * @param {Object} jsonData - the JSO 
 */
exports.insertToDB = async function (jsonData) {
    //if(showConsoleComments) console.log("insert Qry:");
    if (jsonData) {
        if (Object.size(jsonData) > 0) {
            var mysqlQuery = 'INSERT INTO ' + _dbName+"."+_tblName + ' (';
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
                        mysqlQuery += JSOToStr('value',jsonData[index], index);
                    }
                }else{
                    mysqlQuery += typeof(jsonData[index]) == 'string' ? '"' + jsonData[index].replace(/"/g, '\\"') + '"' : jsonData[index];
                }
                mysqlQuery += (i + 1 == Object.size(jsonData) ? ') ' : ', ');
                i++;
            }
            try{
                await _connection.query(mysqlQuery);
            }catch(err){
                throw new Error('Failed inserting '+jsonData.name+'. id: '+jsonData._id);
            }
        }
        else {
            throw new Error('mysql-json [insert]: data has to contain at least one field');
        }
    }
    else {
        throw new Error('mysql-json [insert]: Require JSON data');
    }
};
 
exports.endConnection = async function(){
    debug('end connection.');
    await _connection.end();
}

// Accessory Functions:
///////////////////////            

// Create DB Connection
async function crtConnection(){
    var connection;
    try{
        connection = mysql.createConnection({
            host     : _host,
            user     : _user,
            password : _password
        });
    }catch(err){
        throw new Error("Error creating DB connection");
    }
    return connection;
    
}

/*
// Connect to DB
async function connectToDB(){
    debug('trying to connect..');
    _connection.connect((err) => {
        if(err){
            throw new Error('Error connecting to database!\n', err);
        }
        debug('MySql Connected.');
        //eventEmitter.emit('MySql_Connected.');
    });
}
*/

// Create DB
async function createDB(){
    debug('creating DB..');
    var sqlQry = 'CREATE DATABASE IF NOT EXISTS '+_dbName;
    try{
        await _connection.query(sqlQry);
        debug('Database created!');
    }catch(err){
        throw new Error("Error creating DB");
    }
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

/*
// Drop DB
async function dropDB(){
    debug('droping DB..');
    var sqlQry = 'DROP DATABASE IF EXISTS '+_dbName;
    _connection.query(sqlQry, (err, result) => {
        if(err) throw err;
        debug('Database dropped!');
    });
}
*/

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
        if(typeof(jso[index]) == 'object' && !(jso[index] instanceof Array)){
            qry += JSOToStr(type,jso[index], mainIndex+"_"+index);
        }else{
            indexQry = mainIndex+"_"+index;
            valueQry = typeof(jso[index]) == 'string' ? '"' + jso[index].replace(/"/g, '\\"') + '"' : jso[index];
            qry += ( type == 'value' ? valueQry : indexQry);
            if (type == 'createTable') qry += typeOfValue(jso[index]);
        }
        qry += ( i+1 == Object.size(jso) ? '' : ', ');
        i++;
    }
    return qry;
}

