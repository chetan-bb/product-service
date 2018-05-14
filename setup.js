const {config, kafkaConfig, secretConfig } = require("./validate");
global.config = Object.assign(config, secretConfig);
global.kafkaConfig = kafkaConfig;

global.logger = new (require('bb-logger').BBLogger)(config.LOG.LOGGING.DIR,config.LOG.LOGGING.NAME);
global.qLogger = new (require('bb-logger').BBLogger)(config.LOG.QUEUE_LOGGING.DIR,config.LOG.QUEUE_LOGGING.NAME);
global.reqLogger = new (require('bb-logger').BBRequestLogMiddleware)(config.LOG.REQ_LOGGING.DIR,
    config.LOG.REQ_LOGGING.NAME);

let {AerospikeStorage} = require('./datalayer/aerospikeStorage');

const setCustomJsFunction = require('./utils/customJsUtil');
const initDB = require('./datalayer/initDBInstanceModels');
initDB.dbInstance.authenticate()
    .then(() => {
        console.log('Connect to the database!');
        setDBInstanceModels();
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });

function setDBInstanceModels() {
    process.dbInstance = initDB.dbInstance;
    process.dbModels = initDB.dbModels;
}

setAerospikeInstance();
function setAerospikeInstance() {
    process.aerospikeInstance = new AerospikeStorage();
}

setCustomJsFunction();

