'use strict';

const updateCacheUtil = require('../utils/updateCacheUtil');

module.exports = function(req, res){

    let productId = req.params['productDescId'];
    let masterRi = req.params['masterRi'];
    console.log(`Inside updateCacheHandler function. 
            Args pdId= ${productId} ri= ${masterRi}`);
    updateCacheUtil.emitUpdateCache( productId, masterRi);
    res.status(200).json({
        "status": 0, 
        "message": "success",
        "response": {}
    });
};