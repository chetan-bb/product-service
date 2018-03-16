const database = require('../datalayer/database');
const tagUtil = require('./tagUtil');
const util = require('../utils/util');
const CONSTANTS = require('../assembler/constants');

/*
This is responsible to call data-layer and get json object from there
 */

async function getProduct(productDescriptionId, masterRi) {
    let productAndPricing = await Promise.all([database.getProductFromDB(productDescriptionId, masterRi),
                                    database.getProductPricing(productDescriptionId, masterRi)]);

    let Product = productAndPricing[0];
    let Price = productAndPricing[1];
    if(!Product || !Price || Product.isEmpty() || Price.isEmpty()){
        return null;
    }
    let ProductDescriptionAttr = null;
    let ParentCategory = null;
    let ManualTagValues = null;
    let AutoTagValues = null;
    let Supplier = null;
    if (Product) {
        let resultBundlePackPDMetaParentCategory = await getProductRelatedDataAsync(Product);
        console.log(resultBundlePackPDMetaParentCategory);
        if (resultBundlePackPDMetaParentCategory.ProductBundlePack &&
            resultBundlePackPDMetaParentCategory.ProductBundlePack.status === ProductBundlePack.ACTIVE) {
            Product['ProductBundlePack'] = resultBundlePackPDMetaParentCategory.ProductBundlePack
        } else {
            Product['ProductBundlePack'] = null;
        }
        ProductDescriptionAttr = resultBundlePackPDMetaParentCategory.ProductDescriptionAttr;
        ParentCategory = resultBundlePackPDMetaParentCategory.ParentCategory;
        ManualTagValues  = tagUtil.createTagObject(resultBundlePackPDMetaParentCategory.ManualTagValues);
        AutoTagValues = tagUtil.createTagObject(resultBundlePackPDMetaParentCategory.AutoTagValues);
        Supplier = await database.getSupplier(Product.supplier_id);
    }
    return {Product, Price, ProductDescriptionAttr, ParentCategory, ManualTagValues, AutoTagValues, Supplier}
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
    let childIds = await database.getAllParentChildProductForProductId(productDescriptionId);

    // fire len(child) queries async
    let asyncTasks = [];
    childIds.forEach((childId) => {
        asyncTasks.push(getProduct(childId, masterRi));
    });
    return await Promise.all(asyncTasks);

}

async function getAnnotationMsg(productDescriptionId, childIds, childProductsDict){
    let is_combo_product = await database.isComboProduct(productDescriptionId) 
    let annotationmsg = undefined;
    if(is_combo_product === false){
        return Promise.resolve(annotationmsg);
    }
    let is_single_sku_combo = await database.isSingleSkuComboProduct(productDescriptionId)
    if(is_single_sku_combo === false){
        annotationmsg = CONSTANTS.ANNOTATION_TYPES[CONSTANTS.WILL_GO_TOGETHER];
        return Promise.resolve(annotationmsg);
    }
    let fi_type_list = []
    childIdsSet = childIds.filter(function(elem, pos) {
        return childIds.indexOf(elem) == pos;
    })
    for (let childid of childIdsSet){
        let supplier = childProductsDict[childid[0]]["supplier"];
        fi_type_list.push(supplier.FulfillmentInfo.fulfillment_type)
    }
    fi_type_set = fi_type_list.filter(function(elem, pos) {
        return fi_type_list.indexOf(elem) == pos;
    })
    if(fi_type_set.length == 1){
        annotationmsg = CONSTANTS.ANNOTATION_TYPES[CONSTANTS.WILL_GO_TOGETHER];
        return Promise.resolve(annotationmsg);
    }
    if(fi_type_set.length === childIdsSet.length && childIdsSet.length>0){
        if(fi_type_set.find(CONSTANTS.FI_TYPE_NORMAL) || fi_type_set.find(CONSTANTS.FI_TYPE_EXPRESS)){
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
    return await Promise.resolve(annotationmsg);
}

async function getComboChildProductsDict(childIds, masterRi){
    let childProductsDict = {};
    let childProductsIdsList = [];
    for(let childId of childIds){
        let childProduct = await getProduct(childId[0], masterRi);
        if(childProduct.Product) {
            childProductsDict[childProduct.Product.ProductDescription.id] = {
                "mrp"           : Number(childProduct.Product.mrp),
                "sale_price"    : (childProduct.Product.salePrice) ? Number(childProduct.Product.salePrice):0,
                "quantity"      : childId[1],
                "supplier"      : childProduct.Supplier
            }
            childProductsIdsList.push(childProduct.Product.id);
        }
    };
    return await Promise.resolve([childProductsDict, childProductsIdsList]);
}

async function getComboDiscountBreakupDict(parent_product_id, child_product_ids){
    let comboDiscountBreakupDict = {};
    let comboDiscountBreakupList = await database.getComboPcForParentCombo(parent_product_id, child_product_ids);
    for(let cdbd of comboDiscountBreakupList){
        comboDiscountBreakupDict[cdbd.CurrentDiscount.ChildProduct.product_description_id] = {
            "discount_type"         : cdbd.CurrentDiscount.discount_type,
            "total_discount_value"  : Number(cdbd.CurrentDiscount.total_discount_value),
        };
    };
    return await Promise.resolve(comboDiscountBreakupDict);
}

async function getComboSku(comboDiscountBreakupDict, childProductsDict){
    let comboSku = {};
    for(let cdbd in comboDiscountBreakupDict){
        if (comboDiscountBreakupDict.hasOwnProperty(cdbd)) {           
            let cdbd_key = cdbd;
            let cdbd_value = comboDiscountBreakupDict[cdbd];
            let sku = cdbd_key;
            let discount_type = cdbd_value.discount_type;
            let discount_value = cdbd_value.total_discount_value;
            let mrp = childProductsDict[cdbd_key].mrp;
            let sp = childProductsDict[cdbd_key].sale_price;
            let quantity = childProductsDict[cdbd_key].quantity;
            if(discount_type === 1){
                let temp_sp = sp*discount_value/100;
                sp -= temp_sp;
            }
            else if(discount_type === 2){
                sp -= discount_value;
            }
            else if(discount_type === 3){
                sp = discount_value;
            }
            comboSku[cdbd_key] = {
                "sp"    :sp,
                "qn"    :quantity,
                "mrp"   :mrp
            }
        }
    };
    return await Promise.resolve(comboSku);
}

async function getAllComboProductsForProductId(productDescriptionId, masterRi) {
    let childIds = await database.getAllComboProductsForProductId(productDescriptionId);
    if (childIds.length === 0){
        return await Promise.resolve({});
    }
    let parentProduct = await getProduct(productDescriptionId, masterRi);
    let childProductResult = await getComboChildProductsDict(childIds, masterRi);
    let childProductsDict = childProductResult[0];
    let childProductsIdsList = childProductResult[1];
    
    let comboDiscountBreakupDict = await getComboDiscountBreakupDict(parentProduct.Product.id, childProductsIdsList)
    
    let comboSku = await getComboSku(comboDiscountBreakupDict, childProductsDict)
    
    
    let total_saving = 0;
    let child_product_savings = 0;
    let is_combo_dicount = false;
    let annotation_msg = '';
    annotation_msg = await getAnnotationMsg(productDescriptionId, childIds, childProductsDict)
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
    console.log('Combo SKU - '+ childIds);
    for(let childId of childIds) {
        console.log(childId[0]);
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
        let product_saving = quantity_in_combo * (Number(childProductsDict[pd_id].mrp) - Number(childProductsDict[pd_id].sale_price))
        let savings_oncombo = quantity_in_combo * (Number(childProductsDict[pd_id].mrp) - Number(comboSku[pd_id].sp))
        let saving_msg;
        if (savings_oncombo > 0 && (savings_oncombo > product_saving)){
            savings_combo_str = String(savings_oncombo)
            savings_oncombo = savings_combo_str
            saving_msg = 'SAVE Rs '+ util.amountDisplay(savings_oncombo) +' With Combo'
            is_combo_dicount = true;
        }
        else if (product_saving > 0){
            child_product_savings = child_product_savings + product_saving
            product_saving_str = String(product_saving)
            product_saving = product_saving_str
            saving_msg = 'SAVE Rs '+ util.amountDisplay(product_saving)
        }
        if (saving_msg){
            comboProductDict['saving_msg'] = saving_msg
        }
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

};

async function getAllRelatedComboProductsForProductId(productDescriptionId) {
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
    console.log('Related combo SKU ids- '+ childIds);

    return await Promise.resolve(response);  
};

module.exports = {getProduct, getAllChildrenForPdId, getAllComboProductsForProductId, 
    getAllRelatedComboProductsForProductId};