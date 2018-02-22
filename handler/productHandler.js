const getProductDataForPdId = require('../assembler/productAssembler');


module.exports = function productDetailHandler(req, res) {
    let apiVersion = req.params['apiVersion'];
    let productDescId = req.params['productDescId'];
    let masterRi = req.params['masterRi'];

    getProductDataForPdId(productDescId, masterRi)
        .then((result) => {
            res.status(200).json({
                "status": 0, "message": "success",
                "response": result
            });
        }).catch((err) => {
        res.status(err.status || 500).json({
            "status": -1, "message": err.message
        });
    });
};