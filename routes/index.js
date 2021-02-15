const express = require('express');
const router = express.Router();
const debug = require('debug')('CatalogRouter');


// Require controller modules:
const account_controller = require('../controllers/accountController');

/// ACCOUNT ROUTES ///

// GET home page
router.get('/', account_controller.index);


/*// GET home page.
router.get('/', function(req, res) {
    res.redirect('/catalog');
});*/

module.exports = router;
