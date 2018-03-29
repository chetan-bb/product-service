'use strict';
const util = require('../utils/util');
const DISCOUNT_TYPE_PERCENTAGE = 'Percentage';
const DISCOUNT_LABEL_PERCENTAGE_TAKES_PRIORITY_AFTER = 10;


function getDiscountValueType(Product) {
    let dis_per = 0;
    let dis_val = 0;
    let dt = null;
    let dv = null;

    if(Product.discountType === DISCOUNT_TYPE_PERCENTAGE){
        dt = 'P';
        if(Product.discountPercentage && Product.discountPercentage> 0){
            dis_per = Product.discountPercentage;
            if(Product.mrp){
                dis_val = (parseFloat(Product.mrp) * Product.discountPercentage)/100;
            }
        }
    }else {
        dt = 'A';
        if(Product.discountAmount && Product.discountAmount > 0){
            dis_val = Product.discountAmount;
            if(Product.mrp){
                dis_per = (Product.discountAmount / Product.mrp) * 100;
            }
        }
    }

    // select based on weather percentage disc or amount disc will look catchy
    if(!dis_val && !dis_per){
        //when dis_val and dis_per both are 0
        return {}
    }else if(dis_per > dis_val || dis_per > DISCOUNT_LABEL_PERCENTAGE_TAKES_PRIORITY_AFTER){
        dt = 'P';
        dv = util.precisionRound(dis_per, 2).toString();
    }else {
        dt = 'A';
        dv = util.precisionRound(dis_val, 2).toString();
    }

    return {"discount": {"type": dt, "value": dv}}
}

module.exports = {getDiscountValueType};