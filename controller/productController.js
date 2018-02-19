const database = require('../datalayer/database');
const tagUtil = require('./tagUtil');

/*
This is responsible to call data-layer and get json object from there
 */

async function getProduct(dbInstance, dbModels, productDescriptionId, masterRi) {
    let productAndPricing = await Promise.all([database.getProductFromDB(dbModels, productDescriptionId, masterRi),
                                    database.getProductPricing(dbModels, productDescriptionId, masterRi)]);
    //let Product = await database.getProductFromDB(models, productDescriptionId, masterRi);
    if(!productAndPricing){
        console.log("Error while fetching product from db");
        return null;
    }
    let Product = productAndPricing[0];
    let Price = productAndPricing[1];
    let ProductDescriptionAttr = null;
    let ParentCategory = null;
    let ManualTagValues = null;
    let AutoTagValues = null;
    if (Product) {
        let resultBundlePackPDMetaParentCategory = await getProductRelatedDataAsync(dbInstance, dbModels, Product);
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


async function getProductRelatedDataAsync(dbInstance, dbModels, Product, childIds) {
    let result = await Promise.all([database.getProductBundlePack(dbModels, Product.id),
                database.getProductDescMetaData(dbModels, Product.ProductDescription.id),
                database.getCategoryFromId(dbModels, Product.ProductDescription.Category.parent_id),
                database.getManualTagAndTagGroup(dbInstance, dbModels, Product.ProductDescription.id),
                database.getAutoTagAndTagGroup(dbInstance, dbModels, Product.ProductDescription.id)]);


    return {
        ProductBundlePack: result[0],
        ProductDescriptionAttr: result[1],
        ParentCategory: result[2],
        ManualTagValues: result[3],
        AutoTagValues: result[4],
    }
}

async function getAllChildrenForPdId(dbInstance, dbModels, productDescriptionId, masterRi) {
    let childIds = await database.getAllParentChildProductForProductId(dbModels, productDescriptionId);

    // fire len(child) queries async
    let asyncTasks = [];
    childIds.forEach((childId) => {
        asyncTasks.push(getProduct(dbInstance, dbModels, childId, masterRi));
    });
    return await Promise.all(asyncTasks);

}

module.exports = {getProduct, getAllChildrenForPdId};