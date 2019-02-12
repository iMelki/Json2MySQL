// FOR DEBUGING USES ONLY:
var recordLimit = 1;
///////////////////////////
/*
var arr = [];
for (var id in json) {
    if (recordLimit == 0) break;
    recordLimit--;
    console.log(json[id]);
}*/


const {chain}  = require('stream-chain');
 
const {parser} = require('stream-json');
const {pick}   = require('stream-json/filters/Pick');
//const {ignore} = require('stream-json/filters/Ignore');
const {streamValues} = require('stream-json/streamers/StreamValues');
 
const fs   = require('fs');
//const zlib = require('zlib');
 


jsonPath = process.argv[2];  
jsonPath = 'D:/Milky/Drive/Work/Programing/Learning/Gendler Tasks/Codefresh Assignment/Json2MySQL/inputs/accounts.json';



const pipeline = chain([
  fs.createReadStream(jsonPath),
  //zlib.createGunzip(),
  parser(),
  //pick({filter: 'data'}),
  //ignore({filter: /\b_meta\b/i}),
  streamValues(),
  data => {
    /*const id = data._id;
    console.log(id);*/
    //return value && value.department === 'accounting' ? data : null;
    const name = data.name;
    console.log(name);
  }
]);
 
let counter = 0;
pipeline.on('data', () => ++counter);
pipeline.on('end', () =>
  console.log(`The accounting department has ${counter} employees.`));