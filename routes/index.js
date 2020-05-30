var express = require('express');
var router = express.Router();
const logger = require('../lib/logger');

/* GET home page. */
router.get('/', function(req, res, next) {
  logger.info('The index page is accessed.');
  res.render('index', { title: 'mochimochi' });
});

module.exports = router;
