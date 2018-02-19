'use strict';

const express = require('express');
const router = express.Router();
const productDetailHandler = require('../assembler/productAssembler');

// urls
router.get("/product/v:apiVersion/detail/:productDescId/:masterRi", productDetailHandler);
//router.get("/", productDetailHandler);

module.exports = router;