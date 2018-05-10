'use strict';
const util = require('../utils/util');
const assert = require('assert');
const protoOverrideProductDescription = require('../models/proto_override/override').ProductDescription;


function getProductPrimaryImage(Product, noWatermark = false) {
    assert(Product, 'Product not defined');

    let imageSubPathImageName = {};
    let citySlug = Product.City.slug;
    if (Product.ProductBundlePack) {
        imageSubPathImageName = getProductImageName(Product.ProductDescription, Product.ProductBundlePack.imageVersion,
            noWatermark);
        imageSubPathImageName['subUrl'] = `/bpi/${citySlug}`;
    } else {
        imageSubPathImageName = getProductImageName(Product.ProductDescription, Product.ProductDescription.version,
            noWatermark);
    }
    return imageSubPathImageName;
}

function getProductImageName(ProductDescription, version, noWaterMark) {
    assert(ProductDescription, 'ProductDescription not defined');
    // assuming that images will always come from s3

    let imageName = {};
    if (version !== 0) {
        if (!noWaterMark) {
            return {
                subUrl: '/p/',
                imageName: `${ProductDescription.id}_${version}-${ProductDescription.ProductBrand.slug.toLowerCase()}-${ProductDescription.slug.toLowerCase()}.jpg`
            };
        } else {
            return {subUrl: '/pnw/', imageName: `${generateRawImageFileName(ProductDescription.id)}_${version}.jpg`};
        }
    }
    return imageName;
}


function getProductSecondaryImages(ProductDescription, noWaterMark, ignoreShade, pdMeta) {
    assert(ProductDescription, 'ProductDescription not defined');
    let imageList = [];
    let pdImageMetaData = [];
    if(pdMeta){
        pdImageMetaData = JSON.parse(pdMeta.toString());
    }
    let brandSlug = protoOverrideProductDescription.brandSlug(ProductDescription);

    Object.entries(pdImageMetaData).forEach(([num, imageData]) => {
        let version = imageData.version;
        let imageType = imageData.type;
        if(imageType === 's' && ignoreShade){
            return true;
        }
        let imagePath = `${ProductDescription.id}-${num}`;

        let pdSlug = ProductDescription.slug.toLowerCase();
        if(imageType.length > 0){
            imagePath = `${imagePath}-${imageType}`;
        }
        if(version !== 0){
            let imagePathAndName = {};
            if(noWaterMark){
                imagePathAndName = {subUrl: '/pnw/', imageName:`${generateRawImageFileName(imagePath)}_${version}-${brandSlug}-${pdSlug}.jpg`};
            }else {
                imagePathAndName = {subUrl: '/p/', imageName:`${imagePath}_${version}-${brandSlug}-${pdSlug}.jpg`};
            }
            imageList.push(imagePathAndName);
        } // no product image handled by client
    });

    return imageList;
}

function getShadeImage(ProductDescription, pdMeta) {
    assert(ProductDescription, 'ProductDescription not defined');
    let imageList = [];
    let pdImageMetaData = [];
    if(pdMeta){
        pdImageMetaData = JSON.parse(JSON.parse(JSON.stringify(pdMeta)).strValue);
    }
    let brandSlug = protoOverrideProductDescription.brandSlug(ProductDescription);
    let imagePathAndName = {};
    for(let metaData in pdImageMetaData){
        if (pdImageMetaData.hasOwnProperty(metaData)) {  
            let version = pdImageMetaData[metaData].version;
            let imageType = pdImageMetaData[metaData].type;
            if(imageType === 's'){
                let imagePath = `${ProductDescription.id}-${metaData}`;
                let pdSlug = ProductDescription.slug.toLowerCase();
                if(imageType.length > 0){
                    imagePath = `${imagePath}-${imageType}`;
                }
                if(version !== 0){
                    imagePathAndName = {subUrl: '/p/', imageName:`${imagePath}_${version}.jpg`};               
                }
                return imagePathAndName;
            }
        }
    }   

    return imagePathAndName;
}



function generateRawImageFileName(baseFile) {
    baseFile = baseFile.toString();
    let splitBaseFile = baseFile.split('-');
    let productId = splitBaseFile[0];
    if (splitBaseFile.length === 1) {
        return util.encodeBase64(productId).replace(/=/g, "")
    } else if (splitBaseFile.length === 2) {
        let ext = splitBaseFile[1];
        // console.log(productId, ext);
        return util.encodeBase64(productId).replace(/=/g, "") + '-' + ext;
    } else if (splitBaseFile.length === 3) {
        let ext = splitBaseFile[1] + '-' + splitBaseFile[2];
        return util.encodeBase64(productId).replace(/=/g, "") + '-' + ext;
    }
}

module.exports = {
    getProductPrimaryImage,
    getProductSecondaryImages,
    getShadeImage
};