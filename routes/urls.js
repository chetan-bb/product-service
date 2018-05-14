'use strict';

const express = require('express');
const router = express.Router();

const handler = require('../handler/productHandler');


// urls
router.get("/product/v:apiVersion/detail/:productDescId/", handler.productDetailHandler);

module.exports = router;