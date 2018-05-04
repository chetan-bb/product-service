

const express = require('express');
const router = express.Router();
const productCacheHandler = require('../handler/productCacheHandler');

const handler = require('../handler/productHandler');

// urls
router.get("/product/v:apiVersion/detail/:productDescId/:visitorId/:masterRi/:cityId", handler.productDetailHandler);
router.get("product/v:apiVersion/health", handler.health);
router.get("/product/v:apiVersion/cache/:productDescId/:masterRi/", productCacheHandler);

module.exports = router;