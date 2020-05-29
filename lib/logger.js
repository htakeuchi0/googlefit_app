const Log4js = require('log4js');
const config = require('../log.config.json');
Log4js.configure(config);

const logger = Log4js.getLogger();

module.exports = logger;
