const Op = require('sequelize').Op;


async function getProductFromDB(productDescriptionId, masterRi) {

    return await process.dbModels.Product.findOne({
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
    });

}


async function getCategoryFromId(categoryId) {
    return await process.dbModels.Category.findOne({
        where: {
            id: categoryId
        }
        //attributes: ["parent_id", "slug"]
    });
}

async function getProductBundlePack(productId) {
    return await process.dbModels.ProductBundlePack.findOne({
            where: {
                product_id: productId
            }
        });
}


async function getProductDescMetaData(productDescriptionId) {

    return await process.dbModels.ProductDescriptionAttr.findOne({
            where: {
                parent_obj_id: productDescriptionId
            }
        });
}


async function getProductPricing(productDescriptionId, masterRi) {
    return await process.dbModels.Product.findOne({
            where: {
                reservation_info_id: masterRi,
                product_description_id: productDescriptionId
            },
            attributes: ['mrp', 'salePrice'],
        });
}


async function getManualTagAndTagGroup(productDescriptionId) {
    return await process.dbInstance.query('SELECT `tag_tagvalue`.`id`,\n' +
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
}


async function getAutoTagAndTagGroup(productDescriptionId) {
    return await process.dbInstance.query('SELECT `tag_tagvalue`.`id`,\n' +
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
}

async function getAllParentChildProductForProductId(productDescriptionId) {
    let ProductParentChildObject = await process.dbModels.ProductParentChild.findOne({
        where: {
            [Op.or]: [{childId: productDescriptionId}, {parentId: productDescriptionId}]
        },
        attributes: ['parentId']
    });

    let childIds = await process.dbModels.ProductParentChild.findAll({
        where: {
            parentId: ProductParentChildObject.parentId
        },
        attributes: ['childId'],
        order: ['order']
    });

    return Array.from(new Set(childIds.map((child)=> child.childId))).filter((val)=>val !== ProductParentChildObject.parentId);

}



let dataBase = {getProductFromDB, getProductDescMetaData,
    getProductBundlePack, getProductPricing, getCategoryFromId,
    getManualTagAndTagGroup, getAutoTagAndTagGroup, getAllParentChildProductForProductId};
module.exports = dataBase;