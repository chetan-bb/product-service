const util = require('../utils/util');

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



module.exports = {amountDisplay};