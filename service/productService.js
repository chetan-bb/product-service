const database = require('../datalayer/database');
const tagUtil = require('./tagUtil');

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

    }
    return {Product, Price, ProductDescriptionAttr, ParentCategory, ManualTagValues, AutoTagValues}
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

module.exports = {getProduct, getAllChildrenForPdId};