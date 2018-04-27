

const express = require('express');
const router = express.Router();
const productDetailHandler = require('../handler/productHandler');
const productCacheHandler = require('../handler/productCacheHandler');

router.get("/product/v:apiVersion/detail/:productDescId/:visitorId/:masterRi/:cityId", productDetailHandler);

router.get("/product/v:apiVersion/cache/:productDescId/:masterRi/", productCacheHandler);


module.exports = router;