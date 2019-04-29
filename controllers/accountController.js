
const debug = require('debug')('AccountController');

// Require App Logic:
const jsonToMySQL = require('../jsonToMySQL');

//const jsonToDB = () => {
async function jsonToDB(){
    jsonToMySQL
        .startScript(
            process.env.MYSQL_DATABASE,
            process.env.MYSQL_USER,
            process.env.MYSQL_PASSWORD,
            process.env.MYSQL_ROOT_PASSWORD
        )
        .then(() => {
            console.log('finished insertion script.');
        })
        .catch(err => {
            console.error(err.message);
        });
}

async function getDataFromDB(){
    jsonToMySQL
        .getAllAccounts()
        .then(data=>{return data;})
        .catch(err => console.error(err));
}

exports.index = async function(req, res, next) {
    //res.send("Account Controller with logic");
    //res.send("YO ! "+process.env.MYSQL_PASSWORD.toString());
    let status = await jsonToDB();
    debug(status);

    let data = getDataFromDB();
    //return data;
    res.send(data);
    //res.render('index', { title: 'Express' });
};



/*

      MYSQL_DATABASE: 'db'
      MYSQL_USER: 'user'
      MYSQL_PASSWORD: 'password'
      MYSQL_ROOT_PASSWORD: 'password'
 */
