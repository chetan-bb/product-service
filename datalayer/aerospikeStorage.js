const aerospike = require("aerospike");

class AerospikeConfig {
    constructor() {
        this.namespaces = config['AEROSPIKE']['NAMESPACE'] || 'qas6_bbcache';
        this.sets = config['AEROSPIKE']['SET'] || 'test_products';
        this.version = config['AEROSPIKE']['PRODUCTSERVICE_VERSION']  || "v1";
        this.prefix = config['AEROSPIKE']['PRODUCTSERVICE_PREFIX_KEY']  || "pms";
        this.ttl =  parseInt(['AEROSPIKE']['TTL'])  || 60;
    }
}
const aerospikeConf = new AerospikeConfig();

class AerospikeStorage{
    
    constructor(namespace, setName, version) {
        this.namespace =  aerospikeConf.namespaces;
        this.setName = aerospikeConf.sets;
        this.version = aerospikeConf.version || "v1";
        this.prefix = aerospikeConf.prefix || "pms";
        this.ttl = aerospikeConf.ttl || 60;
        this.initializeClient(this);
    };

    initializeClient (self){
        aerospike
            .connect({
                hosts: config["AEROSPIKE_CLIENT"][0]["ADDR"] ,
                log: {
                    level: aerospike.log.INFO
                },
                meta:{
                    ttl: self.ttl
                },
                timeout:1000
            })
            .then(function(client){
                self.aerospikeClient = client;
            }).catch(function(err){
                self.aerospikeClient = null;
            })
        }
    

    getData(key) {
        let self = this;
        key = `${this.prefix}.${this.version}.${key}`;
        return new Promise(function (resolve, reject) {
            if (!self.aerospikeClient) {
                resolve(false)
            }
            self.aerospikeClient.get( new aerospike.Key(self.namespace, self.setName, key), function (error, record) {
                let isError = error && error.code !== aerospike.status.AEROSPIKE_OK;
                if (isError) {
                   logger.debug("Aerospike cache miss for Key:" + key, error)
                }
                if (record && record.bins){
                    record = record.bins;
                }
                if (record && (record._value || record.value)) { // Backwards compatibity for .value
                    record = record._value ? record._value : record.value;  // Backwards compatibity for .value
                }
                return isError ? (resolve(false) ) : resolve(JSON.parse(record));
            })
        });
    }



    setData(key, value, metadata=null) {
        let self = this;
        key = `${this.prefix}.${this.version}.${key}`;
        if(!metadata){
            metadata={"ttl":this.ttl}
        }
        let rc = {};
        if (value && value.constructor === Object) {

            rc = {"key": key, "_value": JSON.stringify(value)};
        } else {
            rc = {"key": key, "_value": JSON.stringify(value)};
        }
        return new Promise(function (resolve, reject) {
            if (!self.aerospikeClient) {
                reject(new Error("No Aerospike connnection found"))
            }
            self.aerospikeClient.put(new aerospike.Key(self.namespace, self.setName, key), rc, metadata,
                function (error, record) {
                    let success = true;
                    if (error) {
                        logger.debug('AEROSPIKE PUT ERROR: '+ error.message);
                        success = false;
                    }
                    else{
                        logger.debug("AEROSPIKE PUT SUCCESS");
                    }
                    return resolve(success);
            })
        });
    }
}

module.exports = {AerospikeStorage};