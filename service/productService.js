'use strict';
const database = require('../datalayer/database');
const tagUtil = require('./tagUtil');
const imageUtil = require('./imageUtil');
const desktopUrlUtil = require('./desktopUrlUtil');
const util = require('../utils/util');
const CONSTANTS = require('../assembler/constants');
const assert = require('assert');
const apiCall = require('./apiCall');
const { newRelicSegment} = require("../utils/newRelic");
const aerospikeStorage = process.aerospikeInstance;


/*
This is responsible to call data-layer and get json object from there
 */

async function getProduct(productDescriptionId, masterRi, updateCacheMode=false) {
    return await newRelicSegment("service_getProduct", async function(){
        const key = `${productDescriptionId}.${masterRi}`;
        
        let data;
        if(!updateCacheMode){
            data = await aerospikeStorage.getData(key)
        }
        if(data && !data.isEmpty() && !updateCacheMode){
            return data;
        }
        let productAndPricing = await Promise.all([database.getProductFromDB(productDescriptionId, masterRi)]);
        let Product = productAndPricing[0];
        if(!Product || Product.isEmpty()){
            return null;
        }
        // let ProductDescriptionAttr = null;
        // let ParentCategory = null;
        // let ManualTagValues = null;
        // let AutoTagValues = null;
        // let Supplier = null;
        // let CosmeticDescription = null;
        //
        let resultBundlePackPDMetaParentCategory = await getProductRelatedDataAsync(Product);
        if (resultBundlePackPDMetaParentCategory.ProductBundlePack &&
            resultBundlePackPDMetaParentCategory.ProductBundlePack.status === CONSTANTS.BUNDLE_PACK_CONST.ACTIVE) {
            Product['ProductBundlePack'] = resultBundlePackPDMetaParentCategory.ProductBundlePack
        } else {
            Product['ProductBundlePack'] = null;
        }
        let ProductDescriptionAttr = resultBundlePackPDMetaParentCategory.ProductDescriptionAttr;
        let ParentCategory = resultBundlePackPDMetaParentCategory.ParentCategory;
        let ManualTagValues  = tagUtil.createTagObject(resultBundlePackPDMetaParentCategory.ManualTagValues);
        let AutoTagValues = tagUtil.createTagObject(resultBundlePackPDMetaParentCategory.AutoTagValues);
        let Supplier = await database.getSupplier(Product.supplier_id);
        let CosmeticDescription = await cosmeticProductDetails(ManualTagValues, Product,
            resultBundlePackPDMetaParentCategory.ProductDescriptionAttr);
    
        let value = {Product, ProductDescriptionAttr, ParentCategory, ManualTagValues, AutoTagValues,
            Supplier, CosmeticDescription};

        aerospikeStorage.setData(key, value).catch(function(err){
            logger.exception(err);
        });

        return {Product, ProductDescriptionAttr, ParentCategory, ManualTagValues, AutoTagValues,
            Supplier, CosmeticDescription}
    });
}


async function getProductRelatedDataAsync(Product) {
    let result = await Promise.all([database.getProductBundlePack(Product.id),
                database.getProductDescMetaData(Product.ProductDescription.id),
                database.getCategoryFromId(Product.ProductDescription.Category.parent_id),
                database.getManualTagAndTagGroup(Product.ProductDescription.id),
                database.getAutoTagAndTagGroup(Product.ProductDescription.id)]);


    return {
        ProductBundlePack: result[0],
        ProductDescriptionAttr: result[1],
        ParentCategory: result[2],
        ManualTagValues: result[3],
        AutoTagValues: result[4],
    }
}

async function getAllChildrenForPdId(productDescriptionId, masterRi) {
    return await newRelicSegment("service_getAllChildrenForPdId", async function(){
        let childIds = await database.getAllParentChildProductForProductId(productDescriptionId);

        // fire len(child) queries async
        let asyncTasks = [];
        childIds.forEach((childId) => {
            asyncTasks.push(getProduct(childId, masterRi));
        });
        return await Promise.all(asyncTasks);
    });
}

async function getAnnotationMsg(productDescriptionId, childIds, childProductsDict, isSingleSkuCombo){
    let annotationmsg = undefined;
    
    if(isSingleSkuCombo === false){
        annotationmsg = CONSTANTS.ANNOTATION_TYPES[CONSTANTS.WILL_GO_TOGETHER];
        return Promise.resolve(annotationmsg);
    }
    let fiTypeList = [];
    let childIdsSet = childIds.filter(function(elem, pos) {
        return childIds.indexOf(elem) == pos;
    });
    for (let childid of childIdsSet){
        let supplier = childProductsDict[childid[0]]["supplier"];
        fiTypeList.push(supplier.FulfillmentInfo.fulfillment_type)
    }
    let fiTypeSet = fiTypeList.filter(function(elem, pos) {
        return fiTypeList.indexOf(elem) == pos;
    });
    if(fiTypeSet.length === 1){
        annotationmsg = CONSTANTS.ANNOTATION_TYPES[CONSTANTS.WILL_GO_TOGETHER];
        return Promise.resolve(annotationmsg);
    }
    if(fiTypeSet.length === childIdsSet.length && childIdsSet.length>0){
        if(fiTypeSet.find(CONSTANTS.FI_TYPE[CONSTANTS.FI_TYPE_NORMAL]) 
            || fiTypeSet.find(CONSTANTS.FI_TYPE[CONSTANTS.FI_TYPE_EXPRESS])){
            annotationmsg = CONSTANTS.ANNOTATION_TYPES[CONSTANTS.MAY_GO_SEPARATELY];     
            return Promise.resolve(annotationmsg);       
        }
        else{
            annotationmsg = CONSTANTS.ANNOTATION_TYPES[CONSTANTS.WILL_GO_SEPARATELY]; 
            return Promise.resolve(annotationmsg);  
        }
    }
    else{
        annotationmsg = CONSTANTS.ANNOTATION_TYPES[CONSTANTS.MAY_GO_SEPARATELY];
        return Promise.resolve(annotationmsg);   
    }
}

function buildChildProductDict(childProductsDict, childProduct, quantity){
    childProductsDict[childProduct.Product.ProductDescription.id] = {
        "mrp"           : Number(childProduct.Product.mrp),
        "salePrice"    : (childProduct.Product.salePrice) ? Number(childProduct.Product.salePrice):0,
        "quantity"      : quantity,
        "supplier"      : childProduct.Supplier
    }
};

function buildChildImageUrlDict(childProductsImageDict, product, productDescriptionAttr){
    childProductsImageDict[product.ProductDescription.id] = {
        "image": imageUtil.getProductPrimaryImage(product, productDescriptionAttr),
        "link": desktopUrlUtil.getProductPageUrl(product.ProductDescription)            
    }
}

async function getComboChildProductsDict(childIds, masterRi){
    let childProductsDict = {};
    let childProductsImageDict = {};    
    let childProductsIdsList = [];
    for(let childId of childIds){
        let childProduct = await getProduct(childId[0], masterRi);
        if(childProduct.Product) {
            buildChildProductDict(childProductsDict, childProduct, childId[1])
            buildChildImageUrlDict(childProductsImageDict, childProduct.Product, childProduct.ProductDescriptionAttr)
            childProductsIdsList.push(childProduct.Product.id);
        }
    };
    return await Promise.resolve([childProductsDict, childProductsIdsList, childProductsImageDict]);
}

async function getComboDiscountBreakupDict(comboDiscountBreakupList){
    let comboDiscountBreakupDict = {};
    for(let cdbd of comboDiscountBreakupList){
        comboDiscountBreakupDict[cdbd.CurrentDiscount.ChildProduct.product_description_id] = {
            "discountType"         : cdbd.CurrentDiscount.discountType,
            "totalDiscountValue"  : Number(cdbd.CurrentDiscount.totalDiscountValue),
        };
    };
    return await Promise.resolve(comboDiscountBreakupDict);
}

async function getComboSku(comboDiscountBreakupDict, childProductsDict){
    let comboSku = {};
    for(let cdbd in comboDiscountBreakupDict){
        if (comboDiscountBreakupDict.hasOwnProperty(cdbd)) {           
            let cdbdKey = cdbd;
            let cdbdValue = comboDiscountBreakupDict[cdbd];
            let sku = cdbdKey;
            let discountType = cdbdValue.discountType;
            let discountValue = cdbdValue.totalDiscountValue;
            let mrp = childProductsDict[cdbdKey].mrp;
            let sp = childProductsDict[cdbdKey].salePrice;
            let quantity = childProductsDict[cdbdKey].quantity;
            if(discountType === 1){
                let tempSp = sp*discountValue/100;
                sp -= tempSp;
            }
            else if(discountType === 2){
                sp -= discountValue;
            }
            else if(discountType === 3){
                sp = discountValue;
            }
            comboSku[cdbdKey] = {
                "sp"    :sp,
                "qn"    :quantity,
                "mrp"   :mrp
            }
        }
    };
    return await Promise.resolve(comboSku);
}

async function getAllComboProductsForProductId(productDescriptionId, masterRi) {
    return await newRelicSegment("service_getAllComboProductsForProductId", async function(){       
        
        let childIds = await database.getAllComboProductsForProductId(productDescriptionId);
        if (childIds.length === 0){
            return await Promise.resolve({});
        }
        let parentProduct = await getProduct(productDescriptionId, masterRi);
        let childProductResult = await getComboChildProductsDict(childIds, masterRi);
        let childProductsDict = childProductResult[0];
        let childProductsIdsList = childProductResult[1];
        let childProductsImageDict = childProductResult[2];

        let comboDiscountBreakupList = await database.getComboPcForParentCombo(parentProduct.Product.id, childProductsIdsList);
        let comboDiscountBreakupDict = await getComboDiscountBreakupDict(comboDiscountBreakupList);
        let comboSku = await getComboSku(comboDiscountBreakupDict, childProductsDict);
        
        
        let total_saving = 0;
        let child_product_savings = 0;
        let is_combo_dicount = false;
        let annotation_msg = '';
        let is_combo_product = await database.isComboProduct(productDescriptionId);
         ;
        let is_single_sku_combo = await database.isSingleSkuComboProduct(productDescriptionId);
        if(is_combo_product){
            annotation_msg = await getAnnotationMsg(productDescriptionId, childIds, childProductsDict, is_single_sku_combo);    
        }
        let parentDict = {
            "total_mrp"     : util.amountDisplay(parentProduct.Product.mrp),
            "total_sp"      : util.amountDisplay(parentProduct.Product.salePrice)
        }
        if(parentProduct.Product.mrp && parentProduct.Product.salePrice){
            total_saving = Number(parentProduct.Product.mrp) - Number(parentProduct.Product.salePrice)
        }
        if(total_saving > 0 ){
            parentDict.total_saving_msg = total_saving;
        }
        let comboProducts = [];
        for(let childId of childIds) {
            let pd_id = childId[0]
            if(!comboSku[pd_id]){
                continue;
            }
            
            let comboProductDict = {};
            comboProductDict = {
                "sku_id"    : pd_id,
                "qty"       : childId[1],
                "wgt"       : childId[2].weight,
                "p_desc"    : childId[2].description,
                "brand"     : childId[2].ProductBrand.dataValues.name,
            }
            let mrp = comboSku[pd_id].mrp * comboSku[pd_id].qn;
            let sp = comboSku[pd_id].sp * comboSku[pd_id].qn;
            comboProductDict.mrp = String(mrp);
            comboProductDict.sp = String(sp); 
            let quantity_in_combo = comboSku[pd_id].qn;
            let product_saving = quantity_in_combo * (Number(childProductsDict[pd_id].mrp) - Number(childProductsDict[pd_id].salePrice))
            let savings_oncombo = quantity_in_combo * (Number(childProductsDict[pd_id].mrp) - Number(comboSku[pd_id].sp))
            let saving_msg;
            if (savings_oncombo > 0 && (savings_oncombo > product_saving)){
                let savings_combo_str = String(savings_oncombo);
                savings_oncombo = savings_combo_str;
                saving_msg = 'SAVE Rs '+ util.amountDisplay(savings_oncombo) +' With Combo';
                is_combo_dicount = true;
            } else if (product_saving > 0){
                child_product_savings = child_product_savings + product_saving;
                product_saving = String(product_saving);
                saving_msg = 'SAVE Rs '+ util.amountDisplay(product_saving)
            }
            if (saving_msg){
                comboProductDict['saving_msg'] = saving_msg
            }
            comboProductDict["img_url"] = childProductsImageDict[pd_id]["image"];
            comboProductDict["link"] = childProductsImageDict[pd_id]["link"];
            comboProducts.push(comboProductDict);
        };
        parentDict["items"] = comboProducts;
        if (total_saving > 0 && is_combo_dicount){
            parentDict['total_saving_msg'] = 'SAVE Rs '+ util.amountDisplay(parentDict['total_saving_msg']) + ' with Combo' ;
        }
        else if (child_product_savings > 0){
            parentDict['total_saving_msg'] = 'SAVE Rs '+ util.amountDisplay(child_product_savings) ;
        }
        if(annotation_msg){
            parentDict['annotation_msg'] = annotation_msg;
        }
        return await Promise.resolve(parentDict);
    });
};

async function getAllRelatedComboProductsForProductId(productDescriptionId) {
    return await newRelicSegment("service_getAllRelatedComboProductsForProductId", async function(){   
        let childIds = await database.getAllRelatedComboProductsForProductId(productDescriptionId);

        let asyncTasks = [];
        let response = {};
        if(childIds.length>0){
            response = {
                "dest_type"     : "combo_list",
                "display_name"  : "+" + childIds.length + " More Combo",
                "dest_slug"     : "prod_id="+ productDescriptionId,
            };
        }

        return await Promise.resolve(response);  
    });
}

async function getPromoData(productDescriptionId, masterRi, cityId, memberId, visitorId) {
    return await newRelicSegment("service_getPromoData", async function(){        
        assert(productDescriptionId, 'productDescriptionId not passed');
        assert(util.isNumber(visitorId), 'visitor id must be a number');
        try{
                return await(apiCall.downloadPromoData(productDescriptionId, masterRi, cityId, memberId, visitorId));
            }catch(err){
                logger.debug(err);
                return {};
            }
    });
}


async function getAllAvailabilityInfo(productDescriptionId, masterRi, visitorId, memberId) {
    return await newRelicSegment("service_getAllAvailabilityInfo", async function(){        
        assert(productDescriptionId, 'productDescriptionId not passed');
        assert(util.isNumber(visitorId), 'visitor id must be a number');
        try{
            return await(apiCall.downloadAllAvailabilityInfo(productDescriptionId, 
                masterRi, visitorId, memberId ));
        }catch(err){
            return {
                'contextual_children':[],
                'availability_details':{}
            };
        }
    });
}

async function cosmeticProductDetails(manualTags, product, productAttr){
    return await newRelicSegment("service_cosmeticProductDetails", async function(){
        let retDict = {
            isCosmetic :false
        };
        // TODO: This structure changes slightly for listing call and detail call
        // Need to take details or not param and change few things later
        // Need to get childskus here for best performance
        if (manualTags.hasOwnProperty(CONSTANTS.COSMETIC_STORE_TAG_GROUP)){
            let tagValue = manualTags[CONSTANTS.COSMETIC_STORE_TAG_GROUP][0]
            if(tagValue.tagValue === CONSTANTS.COSMETIC_STORE_TAG_VALUE){
                retDict = {
                    isCosmetic      : true,
                    type            : CONSTANTS.COSMETIC_STORE_TAG_GROUP,
                    sub_type        : CONSTANTS.COSMETIC_STORE_TAG_VALUE,
                    shadeImageUrl   : imageUtil.getShadeImage(product.ProductDescription,
                        productAttr)
                }
            }
        }
        return await Promise.resolve(retDict);
    });
}

module.exports = {getProduct : getProduct,
    getAllChildrenForPdId : getAllChildrenForPdId,
    getAllComboProductsForProductId : getAllComboProductsForProductId,
    getAllRelatedComboProductsForProductId: getAllRelatedComboProductsForProductId,
    getPromoData:getPromoData,
    getAnnotationMsg:getAnnotationMsg,
    getComboSku:getComboSku,
    getComboChildProductsDict:getComboChildProductsDict,
    getAllAvailabilityInfo:getAllAvailabilityInfo
    };
