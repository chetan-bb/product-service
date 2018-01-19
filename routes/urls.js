'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlerware/authmiddleware');
const productController = require('../controller/productController');

// general middleware
router.use(authMiddleware());

//url specific middleware

// urls
//router.get("api/v:api_version/products/", productController);
router.get("/", productController);

module.exports = router;