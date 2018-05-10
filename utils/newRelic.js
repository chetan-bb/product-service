let newRelicEnabled;
let newRelic;
if (global.config["NEWRELIC_ENABLED"]) {
    newRelic = require("newrelic");
    newRelicEnabled = true;
}
process.newRelic = newRelic;

const nr = process.newRelic;
function newRelicTransaction(tag,cb){
    return new Promise(function(resolve,reject){
        try {
            if (newRelicEnabled) {
                resolve(nr.startBackgroundTransaction(tag, cb));
            }
            else {
                resolve(cb());
            }
        } catch(e){
            reject(e);
        }
    })
}
function newRelicSegment(segmentName,cb){
    return new Promise(function(resolve,reject){
        try {
            if (newRelicEnabled) {
                resolve(nr.startSegment(segmentName, true, cb));
            }
            else {
                resolve(cb());
            }
        }catch(e){
            reject(e);
        }
    })
}

module.exports = { newRelicSegment,newRelicTransaction};