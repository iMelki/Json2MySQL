const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));
const db = require("../dbManipulator.js");
const debug = require("debug")('test');

var config;
var inputArray;
var hasTestDatabase = Boolean(process.env.MYSQL_TEST_USER && process.env.MYSQL_TEST_PASSWORD);

async function initConfig(){
  config.jsonPath = "../inputs/test.json";
  config.host = process.env.MYSQL_TEST_HOST || "localhost";
  config.user = process.env.MYSQL_TEST_USER;
  config.password = process.env.MYSQL_TEST_PASSWORD;
  config.dbName = process.env.MYSQL_TEST_DATABASE || "accountsDB";
  config.tblName = process.env.MYSQL_TEST_TABLE || "accountsTest";
}

// HOOKS :

before(async function() {
  if (!hasTestDatabase) {
    return;
  }
  // runs before all tests in this block
  // Require Configuration settings:
  config = require('../config.js');
  await initConfig();
  inputArray = require(config.jsonPath);
  await db.init(config.host, config.user, config.password, config.dbName, config.tblName);
  await db.runDatabase();
  await db.dropTable(config.dbName+"."+config.tblName);
});



(hasTestDatabase ? describe : describe.skip)("dbManipulator", function()  {
  describe("buildTable", function() {
    it("should build a table", async function() {
      var tblBuilt = await db.buildTable(inputArray[0]);
      return expect(tblBuilt).to.equal(true);
    });
  });
  describe("fillTable", function() {
    it("should add the input objects to the table", async function() {
      inputArray.forEach(async element => {
        await db.insertToDB(element);
      });
      var res = await db.execQry("SELECT COUNT(*) as count FROM "+config.dbName+"."+config.tblName);
      return expect(res[0].count).to.equal(3);
    });
  });
});
