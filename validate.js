const path = require('path');

let missingKeys = [];

function checkForKeys(object1,object2,tag){
    for (var prop in object1){
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
    throw "Conf file not found";
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
        "PRODUCTSERVICE_VERSION":""

    },
    "AEROSPIKE_CLIENT": [
        {
            "ADDR": "0.0.0.0",
            "PORT": ""
        }
    ],
    "API_DOMAIN": ""

};

try {
    checkForKeys(configSchema, config,"Conf");
    if(missingKeys.length>=1){
        throw (missingKeys);
    }
    global.config = config;

} catch(e){
    console.log(e);
    throw e;
}