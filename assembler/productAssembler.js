'use strict';

const discountUtil = require('../service/discountUtil');
const imageUtil = require('../service/imageUtil');
const productController = require('../service/productService');
const striptags = require('striptags');
const CONSTANTS = require('./constants');
const path = require('path');

async function getProductDataForPdId(productDescId, masterRi) {
    try {
        let productPricingResultObject = await Promise.all([
            productController.getProduct(productDescId, masterRi),
            productController.getAllChildrenForPdId(productDescId, masterRi)
        ]);


        let productResult = productPricingResultObject[0];
        let childProducts = productPricingResultObject[1];

        if (!productResult || productResult.isEmpty()) {
            throw `Product not found for given pd id ${productDescId} and masterRi ${masterRi}`;
        }

        let childProductsResponse = [];
        if (childProducts) {

            childProducts.forEach((productResult) => {
                if (!productResult || productResult.isEmpty()) {
                    return true; // same as continue in foreach loop
                }
                let result = generateProductDetailResponse(productResult.Product,
                    productResult.ProductDescriptionAttr,
                    productResult.ParentCategory,
                    productResult.ManualTagValues, productResult.AutoTagValues);
                childProductsResponse.push(result);
            });
        }
        let parentProductResponse = generateProductDetailResponse(productResult.Product,
            productResult.ProductDescriptionAttr,
            productResult.ParentCategory,
            productResult.ManualTagValues, productResult.AutoTagValues);

        return Object.assign(parentProductResponse, {children: childProductsResponse,
            'base_img_url': process.env.BASEIMAGEURL || CONSTANTS.BASE_IMAGE_URL});
    } catch (err) {
        throw {status:500, message:err};
    }

}


function generateProductDetailResponse(Product, ProductDescriptionAttr, ParentCategory,
                                             ManualTagValues, AutoTagValues) {
    //get data from service and assemble
    let responseGetters = [getProductData(Product),
                                            getProductImages(Product, ProductDescriptionAttr),
                                            getBrandData(Product),
                                            getCategoryData(Product),
                                            getDiscount(Product),
                                            getProductAdditionalAttr(Product),
                                            getVariableWeightMsgAndLink(Product.ProductDescription,
                                                ParentCategory, Product.City), //todo this city might be request city i think
                                            getProductTags(ManualTagValues, AutoTagValues)
                                            ];
    let response = {};
    responseGetters.forEach((fn)=>{
        Object.assign(response, fn);
    });
    return response;
}


function getProductTags(ManualTagValues, AutoTagValues) {
    let tagList = [];
    if (!ManualTagValues || !ManualTagValues.isEmpty()) {
        Object.entries(ManualTagValues).forEach(([key, values]) => {
            console.log(key, values);
            tagList.push({
                header: key.toUpperCase(),
                values: values.map((value) => {
                    return {
                        [value['tagValue']]: {
                            dest_type: CONSTANTS.PRODUCT_LIST,
                            dest_slug: `type=${CONSTANTS.TAG_SEARCH}&slug=${value.slug}`,
                            url: value.url
                        }
                    }

                })
            })
        });
    }
    if (!AutoTagValues || !AutoTagValues.isEmpty()) {
        Object.entries(AutoTagValues).forEach(([key, values]) => {
            console.log(key, values);
            tagList.push({
                header: 'More Info',
                values: values.map((value) => {
                    return {
                        [value['tagValue']]: {
                            dest_type: CONSTANTS.PRODUCT_LIST,
                            dest_slug: `type=${CONSTANTS.TAG_SEARCH}&slug=${value.slug}`,
                            url: value.url
                        }
                    }

                })
            })
        });
    }
    return {tags:tagList}
}

function getProductImages(Product, ProductDescriptionAttr) {
    let primaryImageObj = imageUtil.getProductPrimaryImage(Product);
    console.log(primaryImageObj);
    if(!primaryImageObj) return {images:[]};

    let noWatermark = false;
    let ignoreShade = true;
    let secondaryImages = [];
    if(ProductDescriptionAttr && !ProductDescriptionAttr.isEmpty()) {
        secondaryImages = imageUtil.getProductSecondaryImages(Product.ProductDescription,
            noWatermark, ignoreShade,
            ProductDescriptionAttr.strValue);
    }
    console.log(secondaryImages);

    let images = [generateMultipleImageUrls(primaryImageObj.subUrl, primaryImageObj.imageName)];
    let secondaryImagePath = secondaryImages.map((secondaryImageName) => {
            return generateMultipleImageUrls(secondaryImageName.subUrl, secondaryImageName.imageName)
        });
    images = images.concat(secondaryImagePath);

    return {images:images}
}

function generateMultipleImageUrls(subUrl, imageName, imageSize=['ml', 's', 'l']) {
    let images = {};
    for (let i = 0, len = imageSize.length; i < len; i++) {
        images[imageSize[i]] = path.join(subUrl, imageSize[i], imageName)
    }
    return images;
}

function getBrandData(Product) {
    return {
        "brand": {
            "name": Product.brandName.call(Product),
            "slug": Product.brandSlug.call(Product),
            "url": `/pb/${Product.brandSlug.call(Product)}`
        }
    }
}

function getCategoryData(Product) {
    return {
        "category": {
            "tlc_name": Product.topCategoryName.call(Product),
            "tlc_slug": Product.topCategorySlug.call(Product)
        }
    }
}

function getDiscount(Product) {
    return discountUtil.getDiscountValueType(Product)
}


function getProductData(Product) {
    return {
        "id": Product.ProductDescription.id,
         "desc": Product.description.call(Product),
        "pack_desc": Product.multipackDescription.call(Product) || Product.PackType.call(Product),
        "w": Product.weight.call(Product),
        "mrp": Product.mrp,
        "sp": Product.salePrice
    };
}

function getPricingData(Price) {
    return {
        "mrp": Price.mrp,
        "sp": Price.salePrice
    }
}

function getProductAdditionalAttr(Product) {

    let additionalInfoOne = Product.additionalInfoOne.call(Product);
    let additionalInfoTwo = Product.additionalInfoTwo.call(Product);
    let additionalInfoThree = Product.additionalInfoThree.call(Product);
    let tabContent = [];

    if(additionalInfoOne && !additionalInfoOne.isEmpty()){
        tabContent.push({
            title: 'About',
            content: additionalInfoOne
        })
    }
    
    if(additionalInfoTwo && !additionalInfoTwo.isEmpty()){
        let extractedString = extractTabTitleAndContent(additionalInfoTwo);
        tabContent.push({
            title: extractedString.title,
            content: extractedString.content
        })
    }

    if(additionalInfoThree && !additionalInfoThree.isEmpty()){
        let extractedString = extractTabTitleAndContent(additionalInfoThree);
        tabContent.push({
            title: extractedString.title,
            content: extractedString.content
        })
    }

    return {tabs: tabContent}
}

function extractTabTitleAndContent(extractingString) {
    let title = null;
    let content = null;
    let h3TagEndIndex = extractingString.indexOf('</h3>');
    let hasHtmlTag = h3TagEndIndex !== -1;
    if(hasHtmlTag){
        title = striptags(extractingString.substr(0, h3TagEndIndex)).trim();
        content = striptags(extractingString.substr(h3TagEndIndex, extractingString.length));
    }else {
        title = 'About';
        content = extractingString;
    }

    return {title: title, content: content}
}

function getVariableWeightMsgAndLink(ProductDescription, ParentCategory, City) {
    let storeVariableWeight = false; //todo fix me for speciality products
    let CAP_VARIABLE_WEIGHT = 5; //todo fix me for getting data from local settings
    if(ProductDescription.hasVariableWeight && City.warehouseFulfilment){
        return { variableWeight: {
                    msg: getVariableWeightMsg(ProductDescription, ParentCategory,
                        CAP_VARIABLE_WEIGHT, storeVariableWeight),
                    link: '/variableweight/?source=app'
            }
        }
    }
}

function getVariableWeightMsg(ProductDescription, ParentCategory, CAP_VARIABLE_WEIGHT, storeVariableWeight) {
    /*
    storeVariableWeight: for speciality products
     */
    if(storeVariableWeight){
        return `Please note that this item will be billed based on actual weight during order processing.`+
        `If the weight of this item delivered to you is more than ${storeVariableWeight}%, bigbasket will `+
        `charge you an increase of only ${storeVariableWeight}%`
    } else if(ParentCategory.slug === 'seafood'){
        return 'Please note that the weight is prior to cleaning and cutting. ' +
            'Product will be delivered after cleaning and cutting. ' +
            'There will be a weight loss of about 30-40% after cleaning and cutting. ' +
            'Cleaned with bones retained.'
    }else {
        let productType = ProductDescription.department === 'MEAT' ? 'meat' : 'fresh fruit and vegetables';
        return `Please note that ${productType} items will be billed based on exact weight during order `+
        `processing (in case the actual weight exceeds the requested weight by more than ${CAP_VARIABLE_WEIGHT}%, `+
        `you will be charged only for ${CAP_VARIABLE_WEIGHT}% excess weight).`
    }
}



module.exports = getProductDataForPdId;
