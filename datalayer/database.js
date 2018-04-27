'use strict';

const Op = require('sequelize').Op;
const path = require('path')
const config = require(path.join(__dirname, "..", "conf", "conf.json"));
process.env["NEW_RELIC_NO_CONFIG_FILE"] = true;
process.env["NEW_RELIC_APP_NAME"] = config['NEWRELIC']["NAME"]
process.env["NEW_RELIC_LICENSE_KEY"] = config['NEWRELIC']["KEY"]
let newRelicEnabled;
let newRelic;
if (config["NEWRELIC"]["ENABLED"] === true || config["NEWRELIC"]["ENABLED"] === "true") {
    newRelic = require("newrelic");
    newRelicEnabled = true;    
}
process.newRelic = newRelic;

const nr = process.newRelic;
function newRelicTransaction(tag,cb){
    return new Promise(function(resolve,reject){
        if(newRelicEnabled){
            resolve(nr.startBackgroundTransaction(tag,cb));
        }
        else{
            resolve(cb());
        }
    })
}
function newRelicSegment(segmentName,cb){
    return new Promise(function(resolve,reject){
        if(newRelicEnabled){
            resolve(nr.startSegment(segmentName, true, cb));
        }
        else{
            resolve(cb());
        }
    })
}
async function getProductFromDB(productDescriptionId, masterRi) {
    return await newRelicTransaction('db_getProductFromDB', function(){
        
        
        return process.dbModels.Product.findOne({
        where: {
            reservation_info_id: masterRi, //todo handle this
            product_description_id: productDescriptionId
        },
        include: [
            {
                model: process.dbModels.ProductDescription,
                include: [
                    {model: process.dbModels.ProductBrand},
                    {model: process.dbModels.Category, as: "TopCategory", attributes: ["name", "slug"]},
                    {model: process.dbModels.Category, as: "Category", attributes: ["parent_id", "slug"]}
                    ]
            },
            {
                model: process.dbModels.City
            }
        ]
        })
    })         

}


async function getCategoryFromId(categoryId) {
    return await newRelicSegment("db_getCategoryFromId",function(){
        return process.dbModels.Category.findOne({
        where: {
            id: categoryId
        }
        //attributes: ["parent_id", "slug"]
    });
    })    
}

async function getProductBundlePack(productId) {
    return await newRelicSegment("db_getProductBundlePack",function(){
        return process.dbModels.ProductBundlePack.findOne({
            where: {
                product_id: productId
            }
        });
    })
}


async function getProductDescMetaData(productDescriptionId) {
    return await newRelicSegment("db_getProductDescMetaData",function(){
        return process.dbModels.ProductDescriptionAttr.findOne({
            where: {
                parent_obj_id: productDescriptionId
            }
        });
        })
}


async function getProductPricing(productDescriptionId, masterRi) {
    return await newRelicSegment("db_getProductPricing",function(){
        return process.dbModels.Product.findOne({
            where: {
                reservation_info_id: masterRi,
                product_description_id: productDescriptionId
            },
            attributes: ['mrp', 'salePrice'],
        });
    });
}

async function getSupplier(supplier_id) {
    return await newRelicSegment("db_getSupplier",function(){    
        return process.dbModels.Supplier.findOne({
            where: {
                id: supplier_id
            },
            include: [
                {   model: process.dbModels.FulfillmentInfo,
                    as: "FulfillmentInfo" 
                },
            ]
        });
    });
}


async function getManualTagAndTagGroup(productDescriptionId) {
    return await newRelicSegment("db_getManualTagAndTagGroup",function(){   
        return process.dbInstance.query('SELECT `tag_tagvalue`.`id`,\n' +
        '`tag_tagvalue`.`tag_group_id`,\n' +
        '`tag_tagvalue`.`tag_value`,\n' +
        '`tag_tagvalue`.`display_order`,\n' +
        '`tag_tagvalue`.`is_active`,\n' +
        '`tag_tagvalue`.`value_slug`,\n' +
        '`tag_taggroup`.`attribute_type`,\n' +
        '`tag_taggroup`.`type_slug`,\n' +
        '`tag_taggroup`.`copy_to_parent_child`\n' +
        'FROM `tag_tagvalue`\n' +
        'INNER JOIN `product_productdescription_product_tags` ON (`tag_tagvalue`.`id` = `product_productdescription_product_tags`.`tagvalue_id`)\n' +
        'INNER JOIN `tag_taggroup` ON (`tag_tagvalue`.`tag_group_id` = `tag_taggroup`.`id`)\n' +
        'WHERE `product_productdescription_product_tags`.`productdescription_id` = :productDescriptionId',
        {
            mapToModel: true,
            model: process.dbModels.TagValue,
            replacements: {productDescriptionId: productDescriptionId}
        });
        });
}


async function getAutoTagAndTagGroup(productDescriptionId) {
    return await newRelicSegment("db_getAutoTagAndTagGroup",function(){   
        return process.dbInstance.query('SELECT `tag_tagvalue`.`id`,\n' +
        '`tag_tagvalue`.`tag_group_id`,\n' +
        '`tag_tagvalue`.`tag_value`,\n' +
        '`tag_tagvalue`.`display_order`,\n' +
        '`tag_tagvalue`.`is_active`,\n' +
        '`tag_tagvalue`.`value_slug`,\n' +
        '`tag_taggroup`.`attribute_type`,\n' +
        '`tag_taggroup`.`type_slug`,\n' +
        '`tag_taggroup`.`copy_to_parent_child`\n' +
        'FROM `tag_tagvalue`\n' +
        'INNER JOIN `product_productdescription_auto_product_tags` ON (`tag_tagvalue`.`id` = `product_productdescription_auto_product_tags`.`tagvalue_id`)\n' +
        'INNER JOIN `tag_taggroup` ON (`tag_tagvalue`.`tag_group_id` = `tag_taggroup`.`id`)\n' +
        'WHERE `product_productdescription_auto_product_tags`.`productdescription_id` = :productDescriptionId',
        {
            mapToModel: true,
            model: process.dbModels.TagValue,
            replacements: {productDescriptionId: productDescriptionId}
        });
    });
}

async function getAllParentChildProductForProductId(productDescriptionId) {
    return await newRelicSegment("db_getAllParentChildProductForProductId", async function(){
        let ProductParentChildObject = await process.dbModels.ProductParentChild.findOne({
            where: {
                [Op.or]: [{childId: productDescriptionId}, {parentId: productDescriptionId}]
            },
            attributes: ['parentId']
        });
        if(!ProductParentChildObject){
            return []
        }
        let childIds = await process.dbModels.ProductParentChild.findAll({
            where: {
                parentId: ProductParentChildObject.parentId
            },
            attributes: ['childId'],
            order: ['order']
        });
    return Array.from(new Set(childIds.map((child)=> child.childId))).filter((val)=>val !== ProductParentChildObject.parentId);
    })
}

async function isComboProduct(productDescriptionId) {
     ;
    console.log("isComboProduct");
    await newRelicSegment("db_isComboProduct", async function(){
        let comboProducts = await process.dbModels.ComboProductDescription.findAll({
            where: {
                status: process.dbModels.ComboProductDescription.ACTIVE,
                parent_combo_sku_id: productDescriptionId
            }
        });
    if(comboProducts.length>0){
         ;
        return true;
    }
    else{
         ;
        return false;
    }
    })
}

async function isSingleSkuComboProduct(productDescriptionId) {
    return await newRelicSegment("db_isSingleSkuComboProduct", async function(){
        let comboProducts = await process.dbModels.ComboProductDescription.findAll({
            where: {
                status: process.dbModels.ComboProductDescription.ACTIVE,
                combo_type: process.dbModels.ComboProductDescription.SINGLE_SKU,
                parent_combo_sku_id: productDescriptionId
            }
        });
        if(comboProducts.length>0){
            return true;
        }
        else{
            return false;
        }
    });
}

async function getAllComboProductsForProductId(productDescriptionId) {
    return await newRelicSegment("db_getAllComboProductsForProductId", async function(){
        let comboProducts = await process.dbModels.ComboProductDescription.findAll({
        where: {
            status: process.dbModels.ComboProductDescription.ACTIVE,
            combo_type: process.dbModels.ComboProductDescription.MULTI_SKU,
            parent_combo_sku_id: productDescriptionId
        },
        attributes: ['child_sku_id','quantity'],
        include:[
            { 
                model: process.dbModels.ProductDescription,
                as: "ChildProductDescription",
                include: [
                    {
                        model: process.dbModels.ProductBrand
                    },
                ]
            }
        ]
        });
        return Array.from(new Set(comboProducts.map((child)=> [child.dataValues.child_sku_id,child.dataValues.quantity, child.ChildProductDescription.dataValues])));
    });
}

async function getAllRelatedComboProductsForProductId(productDescriptionId) {
    return await newRelicSegment("db_getAllRelatedComboProductsForProductId", async function(){
        let relatedComboProducts = await process.dbModels.ComboProductDescription.findAll({
            where: {
                status: process.dbModels.ComboProductDescription.ACTIVE,
                child_sku_id: productDescriptionId
            },
            attributes: ['parent_combo_sku_id']
        })
    
    return Array.from(new Set(relatedComboProducts.map((child)=> child.dataValues.parent_combo_sku_id)));
    });
}

async function getComboPcForParentCombo(parentProductId, childProductList){
    return await newRelicSegment("db_getComboPcForParentCombo", async function(){    
        let comboDiscountBreakups = await process.dbModels.ComboPc.findAll({
            where: {
                // status: process.dbModels.ComboPc.ACTIVE,
                combo_parent_product_id: parentProductId,
                combo_child_product_id: {
                    [Op.in] : childProductList
                }
            },
            include:[
                {
                    model: process.dbModels.ComboProductDiscountBreakup,
                    as: "CurrentDiscount",
                    include:[
                        {
                            model: process.dbModels.Product,
                            as : "ChildProduct"
                        }
                    ]
                }
            ]
        });
        return comboDiscountBreakups;
    });
}

let dataBase = {getProductFromDB, getProductDescMetaData,
    getProductBundlePack, getProductPricing, getCategoryFromId,
    getManualTagAndTagGroup, getAutoTagAndTagGroup, getAllParentChildProductForProductId,
    getAllComboProductsForProductId, getAllRelatedComboProductsForProductId, 
    getComboPcForParentCombo, getSupplier, isComboProduct, isSingleSkuComboProduct
};
module.exports = dataBase;