'use strict';

const discountUtil = require('../service/discountUtil');
const imageUtil = require('../service/imageUtil');
const contextualChildrenfilterUtil = require('../service/contextualChildrenFilter');
const productController = require('../service/productService');
const striptags = require('striptags');
const CONSTANTS = require('./constants');
const util = require('../utils/util');
const path = require('path');

async function getProductDataForPdId(productDescId, masterRi, cityId, memberId, visitorId) {
    try {
        let productPricingResultObject = await Promise.all([
            productController.getProduct(productDescId, masterRi),
            productController.getAllChildrenForPdId(productDescId, masterRi),
            productController.getAllComboProductsForProductId(productDescId, masterRi),
            productController.getAllRelatedComboProductsForProductId(productDescId),
            productController.getPromoData(productDescId, masterRi, cityId, memberId, visitorId),
            productController.getAllAvailabilityInfo(productDescId, masterRi, visitorId, memberId),
        ]);
        let productResult = productPricingResultObject[0];
        let childProducts = productPricingResultObject[1];
        let comboResult = productPricingResultObject[2];
        let additionDestination = productPricingResultObject[3];
        let promoSaleResult = productPricingResultObject[4];
        
        let contextualChildren = productPricingResultObject[5]['contextual_children'];
        let availabilityInfo = productPricingResultObject[5]['availability_details'];
        
        if (!productResult || productResult.isEmpty()) {
            throw `Product not found for given pd id ${productDescId} and masterRi ${masterRi}`;
        }
        childProducts = contextualChildrenfilterUtil.filterChildren(childProducts, 
            contextualChildren, productResult.Product);
        
        productResult.CosmeticDescription['childProducts'] = childProducts;
        productResult.CosmeticDescription['parent_product_desc'] = productDescId;

        let childProductsResponse = [];
        if (childProducts) {
            childProducts.forEach((childResult) => {
                if (!childResult || childResult.isEmpty()) {
                    return true; // same as continue in foreach loop
                }
                childResult.CosmeticDescription['childProducts'] = childProducts;
                childResult.CosmeticDescription['parent_product_desc'] = productDescId;
                let result = generateProductDetailResponse(childResult.Product,
                    childResult.ProductDescriptionAttr,
                    childResult.ParentCategory,
                    childResult.ManualTagValues, childResult.AutoTagValues,
                    promoSaleResult[childResult.Product.id],
                    childResult.CosmeticDescription, 
                    availabilityInfo[childResult.Product.id]);
                childProductsResponse.push(result);
            });
        }
        let parentProductResponse = generateProductDetailResponse(productResult.Product,
            productResult.ProductDescriptionAttr,
            productResult.ParentCategory,
            productResult.ManualTagValues, productResult.AutoTagValues,
            promoSaleResult[productResult.Product.id],
            productResult.CosmeticDescription, 
            availabilityInfo[productResult.Product.id],
            comboResult, additionDestination);

        return Object.assign(parentProductResponse, {children: childProductsResponse,
            'base_img_url': process.env.BASEIMAGEURL || CONSTANTS.BASE_IMAGE_URL});
    } catch (err) {
        throw {status:500, message:err.message, stack: err.stack};
    }

}


function generateProductDetailResponse(Product, ProductDescriptionAttr, ParentCategory,
                                    ManualTagValues, AutoTagValues, 
                                    promoSaleData, cosmeticDescription,
                                    availabilityInfo,
                                    comboResult = {},
                                    additionDestination = {}) {
    // promo and sale data from python layer
    let promoData = {};
    let saleInfo = {};
    let product_attr = {};
    let discount_price = null;
    if(promoSaleData && !promoSaleData.isEmpty()){
        promoData = promoSaleData['promo_data'];
        saleInfo = promoSaleData['sale_info'];
        product_attr = promoSaleData['product_attrs'];
        discount_price = promoSaleData['discounted_prices'];
    }
    
    let cosmeticFunctionDetails = [getCosmeticResult, [cosmeticDescription]]
    
    //get data from service and assemble
    let responseGetters = [getProductData(Product, product_attr),
                                            getProductImages(Product, ProductDescriptionAttr),
                                            getBrandData(Product),
                                            getCategoryData(Product),
                                            getDiscount(Product, product_attr),
                                            getProductAdditionalAttr(Product),
                                            getVariableWeightMsgAndLink(Product.ProductDescription,
                                                ParentCategory, Product.City), //todo this city might be request city i think
                                            getProductTags(ManualTagValues, AutoTagValues),
                                            generateAdditionalAttr(cosmeticFunctionDetails),
                                            getAllAvailabilityInfo(availabilityInfo),
                                            getComboResult(comboResult),
                                            getAdditionDestination(additionDestination)
                                            ];
    let response = {};
    responseGetters.forEach((fn) => {
        Object.assign(response, fn);
    });
    if (promoData && !promoData.isEmpty()) {
        Object.assign(response, {promo: promoData});
    }
    if (saleInfo && !saleInfo.isEmpty()) {
        Object.assign(response, {sale: saleInfo});

    }
    if (discount_price) {
        Object.assign(response, {discounted_price: discount_price});
    }

    return response;
}

function buildTagReponseItem(key, values){
    return {
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
    }
}

function getProductTags(ManualTagValues, AutoTagValues) {
    let manualTagList = [];
    let autoTagList = [];
    const AUTO_TAG_HEADER = "More Info"
    if (!ManualTagValues || !ManualTagValues.isEmpty()) {
        manualTagList = Object.entries(ManualTagValues).filter(([key, values]) => {
            if (key !== CONSTANTS.COSMETIC_STORE_TAG_GROUP){
                return buildTagReponseItem(key, values);
            }                        
        });
    }
    if (!AutoTagValues || !AutoTagValues.isEmpty()) {
        autoTagList = Object.entries(AutoTagValues).filter(([key, values]) => {
            return buildTagReponseItem(AUTO_TAG_HEADER, values);
        });        
    }
    return {tags:manualTagList.concat(autoTagList)}
}

function getProductImages(Product, ProductDescriptionAttr) {
    let primaryImageObj = imageUtil.getProductPrimaryImage(Product);
    console.log(primaryImageObj);
    if(!primaryImageObj || primaryImageObj.isEmpty()){
        return {
            images:[]
        };
    } 

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

function getDiscount(Product, product_attr = {}) {
    if (!product_attr.isEmpty()) {
        return {"discount": {"type": product_attr['dis_t'], "value": product_attr['dis_val']}}
    }
    return discountUtil.getDiscountValueType(Product);

}


function getProductData(Product, product_attr={}) {//todo check Product.mrp must be equal to product_attr.mrp
    return {
        "id": Product.ProductDescription.id,
        "desc": Product.description.call(Product),
        "pack_desc": Product.multipackDescription.call(Product) || Product.PackType.call(Product),
        "w": Product.weight.call(Product),
        "mrp": Product.mrp,
        "sp": product_attr['sp'] ? product_attr['sp']: Product.salePrice
    };
}

function getPricingData(Price) {
    return {
        "mrp": util.amountDisplay(Price.mrp),
        "sp": util.amountDisplay(Price.salePrice)
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

function getCosmeticResult(cosmeticDescription){
    if(cosmeticDescription.isCosmetic === false ||
        cosmeticDescription.childProducts.length < 1){
        return {}
    }
    else {
        delete cosmeticDescription.isCosmetic;
        let dict = cosmeticDescription;
        let shadeImageUrl = generateMultipleImageUrls(cosmeticDescription.shadeImageUrl.subUrl,
            cosmeticDescription.shadeImageUrl.imageName,["s"]);
        cosmeticDescription["shade_img_url"] = shadeImageUrl["s"];            
        let children = cosmeticDescription.childProducts;
        delete cosmeticDescription.childProducts;

        if (children.length == 1){
            dict.label = children.length + " more shade";             
        }
        else{
            dict.label = children.length + " more shades";             
        }
        // Commenting skus keys used only for Product Listing pages 
        // dict.skus = Array.from(children.map((child)=> String(child.Product.ProductDescription.id)));
        // dict.skus.push(cosmeticDescription.parent_product_desc);
        return dict
    }
}

function generateAdditionalAttr(...functionInfo){
    /*
    This function takes any number of functions as arguments 
    Each argument should be a list of two items 
    1: The function
    2: Functions' arguments
    The result of each function is appended into "info" key inside "additional_attr"
    Example:
      "additional_attr":{
          "info":[
            {
                "type"                  :"parent_child_variant_type",
                "sub_type"              :"colour",
                "shade_img_url"         :"/p/s/274521-100-s_2.jpg",
                "parent_product_desc"   :"100394025",
                "label"                 :"1 more shade",
                "skus"                  :["274521","100394025"]
            },
            {
                "type"                  :"bby",
                "label"                 :"10 days ago" 
            }]
        }
    */
    let additional_attr = {
        info: []
    }
    functionInfo.map((func)=> {
        let res = func[0].apply(this,func[1]);
        if(!res.isEmpty()){
            additional_attr['info'].push(res);            
        }
    });
    if(additional_attr.info.length > 0){
        return {
            "additional_attr": additional_attr
        }
    }
    
}


function getAllAvailabilityInfo(storeAvailability){
    if(storeAvailability && !storeAvailability.isEmpty()){
        return {
            "store_availability":storeAvailability['store_availability']
        };
    }
    else{
        return {
            "store_availability":[]
        };
    }
}


function getComboResult(ComboResult){
    if(ComboResult && !ComboResult.isEmpty()){
        ComboResult.items.map((item)=>{
            let images = generateMultipleImageUrls(item.img_url.subUrl, 
                item.img_url.imageName, ['s']);
            delete item.img_url;
            if(!images.isEmpty()){
                images = images['s'];
            }
            else{
                images = "";
            }
            item.img_url = images;
        })

        return {
            "combo_dict":ComboResult
        };
    }
}

function getAdditionDestination(AdditionDestination){
    if(AdditionDestination && !AdditionDestination.isEmpty()){
        return {
            "addition_destination":AdditionDestination
        };
    }
}

module.exports = getProductDataForPdId;
