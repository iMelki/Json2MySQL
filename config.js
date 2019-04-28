var debug = require('debug')('config');
var path = require('path');
var configData = require('./config.json');
//var configData = JSON.parse(configStr);

debug('imported');

let jsonPath;
let host;
let user;
let password;
let rootPassword;
let dbName;
let tblName;

function initConfig(){
    jsonPath = path.resolve(__dirname,  configData.jsonPath);
    host = configData.host;
    user = configData.user;
    password = configData.password;
    dbName = configData.dbName;
    tblName = configData.tblName;
}

initConfig();

module.exports = {
    host, user, password, jsonPath, dbName, tblName
}

exports.initDbParams = function(dbNameStr, username, pass, rootPass){
    user = username;
    password = pass;
    rootPassword = rootPass;
    dbName = dbNameStr;
}
