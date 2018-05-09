'use strict';

const getProductDataForPdId = require('../assembler/productAssembler');


function productDetailHandler(req, res) {
    let apiVersion = req.params['apiVersion'];
    let productDescId = req.params['productDescId'];
    let masterRi = req.params['masterRi'];
    let cityId = req.params['cityId'];
    let visitorId = req.params['visitorId'];
    let memberId = req.query['member_id'];

    getProductDataForPdId(productDescId, masterRi, cityId, memberId, visitorId)
        .then((result) => {
            res.status(200).json({
                "status": 0, "message": "success",
                "response": result
            });
        }).catch((err) => {
        logger.exception(err);
        res.status(err.status || 500).json({
            "status": -1, "message": err.message,
            // "stack":err.stack
        });
    });
}

function health(req, res) {
    // this will check aerospike and mysql connection and node process running

    if (Object.keys(process.dbModels).length > 0) {
        res.status(200).json({
            "status": 0, "message": "success"
        });
    } else {
        res.status(500).json({
            "status": -1, "message": 'Health check failed'
        });
    }
}

module.exports = {
    productDetailHandler,
    health
};