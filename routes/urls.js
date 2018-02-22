'use strict';

const express = require('express');
const router = express.Router();
const productDetailHandler = require('../handler/productHandler');

// urls
router.get("/product/v:apiVersion/detail/:productDescId/:masterRi", productDetailHandler);

module.exports = router;