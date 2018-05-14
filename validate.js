//This module is used to validate the conf file
//This module also sets the Global config variable
//It has to be included in every test case file separately if it uses config

const path = require('path');

let missingKeys = [];

function checkForKeys(object1, object2, tag) {
    for (let prop in object1) {
        if (object1.hasOwnProperty(prop)) {
            if (object2.hasOwnProperty(prop)) {
                if (typeof object2[prop] === "object") {
                    checkForKeys(object1[prop], object2[prop], tag + " -> " + prop);
                }
            } else {
                missingKeys.push(tag + "-> " + prop)
            }
        }
    }
}

const config = process.env.LOCAL_CONFIG_PATH || require(path.join(__dirname, ".", "conf", "conf.json"));

const configSchema = {
    "DEBUG": "",
    "AEROSPIKE": {
        "TYPE": {
            "CACHE": "",
            "PERSISTENT": ""
        },
        "NAMESPACE": "",
        "SET": "",
        "PRODUCTSERVICE_PREFIX_KEY": "",
        "PRODUCTSERVICE_VERSION": "",
        "TTL": ""

    },
    "AEROSPIKE_CLIENT": [
        {
            "ADDR": "0.0.0.0",
            "PORT": ""
        }
    ],
    "API_DOMAIN_NAME": "",
    "DOMAIN_NAME": "",
    "CAP_VARIABLE_WEIGHT": "",
    "BASE_IMAGE_URL": "",
    "LOG": {
        "LOGGING": {
            "DIR": "",
            "NAME": ""
        },
        "REQ_LOGGING": {
            "DIR": "",
            "NAME": ""
        },
        "QUEUE_LOGGING": {
            "DIR": "",
            "NAME": ""
        }
    }

};

try {
    checkForKeys(configSchema, config, "Conf");
    if (missingKeys.length >= 1) {
        throw new Error(missingKeys);
    }

} catch (e) {
    throw e;
}

const kafkaConfigSchema = {
    memberOptions: {
        "kafkaHost": "",
        groupId:""
    },
    "queueNameSpace": "",
    "topics": []
};
const kafkaConfig = process.env.QUEUE_CONFIG_PATH || require(path.join(__dirname, ".", "conf", "queueConf.json"));

try {
    checkForKeys(kafkaConfigSchema, kafkaConfig, "Conf");
    if (missingKeys.length >= 1) {
        throw new Error(missingKeys);
    }
} catch (e) {
    throw e;
}

const secretConfigSchema = {
    "DATABASE": "",
    "USERNAME": "",
    "PASSWORD": "",
    "HOST": "",
    "DIALECT": "",
    "DBPORT": ""
};
const secretConfig = process.env.SECRET_CONFIG_PATH  || require(path.join(__dirname, '.', "conf", "secrets.json"));

try {
    checkForKeys(secretConfigSchema, secretConfig, "Conf");
    if (missingKeys.length >= 1) {
        throw new Error(missingKeys);
    }
} catch (e) {
    throw e;
}

module.exports = {
    config,
    kafkaConfig,
    secretConfig,
};