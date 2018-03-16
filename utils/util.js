const bigInt = require("big-integer");


function precisionRound(number, precision) {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function encodeBase64(data) {
    try {
        let val = (bigInt(parseInt(data)).xor((parseInt('0xbbc00cee', 16))));
        return new Buffer(val.toString()).toString('base64');
    } catch (ex) {
        //logger.error(ex);
        return (false);
    }
}

function decodeBase64(data_param) {
    try {
        let data = new Buffer(data_param, 'base64').toString("utf-8");
        // return (parseInt(data) ^ parseInt('0xbbc00cee', 16));
        return bigInt(bigInt(parseInt(data)) ^ bigInt(bigInt(globals.settings.DECODE_BASE64_KEY, 16)));
    } catch (ex) {
        //logger.error(ex);
        return (false)
    }
}

function amountDisplay(amount){
    if(amount){
        if(isNaN(parseFloat(amount))){
            return amount;
        }
        amount = parseFloat(amount);        
        amount = amount.toFixed(amount % 1 === 0 ? 0 : 2);
        return "" + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "");
    }
    else{
        return ""
    }
};

module.exports = {
    precisionRound,
    encodeBase64,
    decodeBase64,
    amountDisplay
};

