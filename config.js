var debug = require('debug')('config');
var path = require('path');
var configData = require('./config.json');
//var configData = JSON.parse(configStr);

debug('imported');

var jsonPath;
var host;
var user;
var password;
var dbName;
var tblName;

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