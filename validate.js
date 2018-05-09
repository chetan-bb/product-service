//This module is used to validate the conf file
//This module also sets the Global config variable
//It has to be included in every test case file separately if it uses config

const path = require('path');

let missingKeys = [];

function checkForKeys(object1,object2,tag){
    for (let prop in object1){
        if(object1.hasOwnProperty(prop)){
            if(object2.hasOwnProperty(prop)){
                if(typeof object2[prop] === "object"){
                    checkForKeys(object1[prop],object2[prop],tag +" -> " + prop);
                }
            } else{
                missingKeys.push( tag + "-> " + prop)
            }
        }
    }
}
let config;
try{
    config = require(path.join(__dirname, ".", "conf", "conf.json"));
}catch(exc){
    throw new Error("Conf file not found");
}

const configSchema = {
    "NEWRELIC": {
        "ENABLED": "",
        "KEY": "",
        "NAME": ""
    },
    "AEROSPIKE":{
        "TYPE":{
            "CACHE" : "",
            "PERSISTENT": ""
        },
        "NAMESPACE":"",
        "SET": "",
        "PRODUCTSERVICE_PREFIX_KEY":"",
        "PRODUCTSERVICE_VERSION":"",
        "TTL":""

    },
    "AEROSPIKE_CLIENT": [
        {
            "ADDR": "0.0.0.0",
            "PORT": ""
        }
    ],
    "API_DOMAIN_NAME": "",
    "DOMAIN_NAME":  "",
    "CAP_VARIABLE_WEIGHT": "",
    "BASE_IMAGE_URL": ""


};

try {
    checkForKeys(configSchema, config,"Conf");
    if(missingKeys.length>=1){
        throw new Error(missingKeys);
    }
    global.config = config;

} catch(e){
    logger.exception(e);
    throw e;
}