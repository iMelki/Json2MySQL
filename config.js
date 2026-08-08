var debug = require('debug')('config');
var fs = require('fs');
var path = require('path');
var configData = require('./config.json');

var localConfigPath = path.resolve(__dirname, 'config.local.json');
if (fs.existsSync(localConfigPath)) {
    var localConfigData = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
    configData = Object.assign({}, configData, localConfigData);
}

debug('imported');

var jsonPath;
var host;
var user;
var password;
var dbName;
var tblName;

function getSetting(envName, configName){
    if (Object.prototype.hasOwnProperty.call(process.env, envName)) {
        return process.env[envName];
    }
    return configData[configName];
}

function initConfig(){
    var configuredJsonPath = getSetting('JSON2MYSQL_INPUT_PATH', 'jsonPath');
    jsonPath = configuredJsonPath ? path.resolve(__dirname, configuredJsonPath) : '';
    host = getSetting('MYSQL_HOST', 'host');
    user = getSetting('MYSQL_USER', 'user');
    password = getSetting('MYSQL_PASSWORD', 'password');
    dbName = getSetting('MYSQL_DATABASE', 'dbName');
    tblName = getSetting('MYSQL_TABLE', 'tblName');
}

initConfig();

module.exports = {
    host, user, password, jsonPath, dbName, tblName
}
