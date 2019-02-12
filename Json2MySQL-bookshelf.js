// FOR DEBUGING USES ONLY:
var recordLimit = 1;
///////////////////////////


// Require modules:
//var chalk = require( "chalk" );
var fs = require( "fs" );
var JSONStream = require( "JSONStream" );
var es = require('event-stream');
//var mysql = require('mysql');
// Create Connection:
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        database : 'accountsDB',
        charset  : 'utf8'
    }
});
var bookshelf = require('bookshelf')(knex);


var jsonPath = process.argv[2]; //'inputs/data.json'; //
var db;
var dbName = 'accountsDB';
var Account;

/*
var init = function(){
    console.log('init:');
    // Create connection
    db = crtConnection();
    
    console.log('trying to connect..');
    // Connect
    db.connect((err) => {
        if(err){
            console.log('ERROR connecting!');
            throw err;
        }
        connectionSucceeded(db, dbName);
    });
    
}
*/

var init = function(){
    console.log('new init:');
    //createDB(knex, dbName);
    buildSchema();
}

var buildSchema = function(){
    console.log('build Schema:');
    //getFirstObj();

    knex.schema.createTable('accounts', function(table) {  
        table.string('_id');
        table.string('name');
        table.string('provider');
        table.string('privateAccountOwner');
        table.string('canUsePrivateRepos');
        table.string('limits');
        table.string('build');
        table.string('admins');
        table.string('__v');
    });

    Account = bookshelf.Model.extend({
        tableName: 'accounts',
        /*posts: function() {
          return this.hasMany(Posts);
        }*/
      });
}

var getFirstObj = function(){
    console.log('get First Obj:');
}

var appFinished = function(){
    setTimeout(
        () => {
            console.log('appFinished:');
            //dropDB(knex, dbName);
        },
        1000
    );
}
/*
// Create Connection
var crtConnection = function(){
    return mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root'
    });
}
*/
// Connection Succeeded
var connectionSucceeded = function(db, dbName){
    console.log('MySql Connected.');
    createDB(db, dbName);
}

// Create DB
var createDB = function(db, dbName){
    console.log('creating DB..');
    var sqlQry = 'CREATE DATABASE '+dbName;
    db.query(sqlQry, (err, result) => {
        if(err) throw err;
        console.log(result);
        console.log('Database created!');
    });
}

// Drop DB
var dropDB = function(db, dbName){
    console.log('droping DB..');
    var sqlQry = 'DROP DATABASE '+dbName;
    db.query(sqlQry, (err, result) => {
        if(err) throw err;
        console.log(result);
        console.log('Database dropped!');
    });
}
         
var getStream = function () {
    var stream = fs.createReadStream(jsonPath, {encoding: 'utf8'}),
        //transformStream 1 - Parser:
        parser = JSONStream.parse('*');
        return stream.pipe(parser);
};

var startStreaming = function () {
    setTimeout(
        () => {
            console.log('Start Streaming:');
            getStream()
                .pipe(es.mapSync(function (obj) {
                    console.log('received name:', obj.name);
                    Account.forge(obj).save().then(function(acc) {  
                        console.log('trying to add account')
                        console.log('Account saved:', acc.get('name'));
                    });
                }));
        },
        1000
    );    
}

init();
startStreaming();
//appFinished();