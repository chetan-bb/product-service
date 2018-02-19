const Op = require('sequelize').Op;


async function getProductFromDB(dbModels, productDescriptionId, masterRi) {

    return await dbModels.Product.findOne({
        where: {
            //reservation_info_id: masterRi,
            product_description_id: productDescriptionId
        },
        include: [
            {
                model: dbModels.ProductDescription,
                include: [
                    {model: dbModels.ProductBrand},
                    {model: dbModels.Category, as: "TopCategory", attributes: ["name", "slug"]},
                    {model: dbModels.Category, as: "Category", attributes: ["parent_id", "slug"]}
                    ]
            },
            {
                model: dbModels.City
            }
        ]
    });

    // include: [dbModels.ProductBrand, dbModels.Category]


    // return new Promise((resolve, reject) => {
    //     dbModels.Product.findOne({
    //         where: {
    //             //reservation_info_id: masterRi,
    //             product_description_id: productDescriptionId
    //         },
    //         include: [
    //             {
    //                 model: dbModels.ProductDescription,
    //                 include: [dbModels.ProductBrand, dbModels.Category]
    //             },
    //         ]
    //     }).then(product => {
    //         if (product) {
    //             resolve(product);
    //         } else {
    //             reject(false);
    //         }
    //     }).catch(err => {
    //         console.log(err);
    //         reject(err);
    //     })
    // });

}


async function getCategoryFromId(dbModels, categoryId) {
    return await dbModels.Category.findOne({
        where: {
            id: categoryId
        }
        //attributes: ["parent_id", "slug"]
    });
}

async function getProductBundlePack(dbModels, productId) {
    return await dbModels.ProductBundlePack.findOne({
            where: {
                product_id: productId
            }
        });


    // return new Promise((resolve, reject) => {
    //     dbModels.ProductBundlePack.findOne({
    //         where: {
    //             product_id: productId
    //         }
    //     }).then(productBundlePack => {
    //         resolve(productBundlePack)
    //     }).catch(err => {
    //         console.log(err);
    //         reject(false)
    //     })
    // });

}


async function getProductDescMetaData(dbModels, productDescriptionId) {

    return await dbModels.ProductDescriptionAttr.findOne({
            where: {
                parent_obj_id: productDescriptionId
            }
        });


    // return new Promise((resolve, reject) => {
    //     dbModels.ProductDescriptionAttr.findOne({
    //         where: {
    //             parent_obj_id: productDescriptionId
    //         }
    //     }).then(productDescriptionAttr => {
    //         resolve(productDescriptionAttr)
    //     }).catch(err => {
    //         console.log(err);
    //         reject(false);
    //     })
    // });

}


async function getProductPricing(dbModels, productDescriptionId) {
    return await dbModels.Product.findOne({
            where: {
                //reservation_info_id: masterRi,
                product_description_id: productDescriptionId
            },
            attributes: ['mrp', 'salePrice'],
        });



    // return new Promise((resolve, reject) => {
    //     dbModels.Product.findOne({
    //         where: {
    //             //reservation_info_id: masterRi,
    //             product_description_id: productDescriptionId
    //         },
    //         attributes: ['mrp', 'salePrice'],
    //     }).then(product => {
    //         resolve(product);
    //     }).catch(err => {
    //         console.log(err);
    //         reject(err);
    //     })
    // });
}


async function getManualTagAndTagGroup(dbInstance, dbModels, productDescriptionId) {
    return await dbInstance.query('SELECT `tag_tagvalue`.`id`,\n' +
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
            model: dbModels.TagValue,
            replacements: {productDescriptionId: productDescriptionId}
        });
}


async function getAutoTagAndTagGroup(dbInstance, dbModels, productDescriptionId) {
    return await dbInstance.query('SELECT `tag_tagvalue`.`id`,\n' +
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
            model: dbModels.TagValue,
            replacements: {productDescriptionId: productDescriptionId}
        });
}

async function getAllParentChildProductForProductId(dbModels, productDescriptionId) {
    let ProductParentChildObject = await dbModels.ProductParentChild.findOne({
        where: {
            [Op.or]: [{childId: productDescriptionId}, {parentId: productDescriptionId}]
        },
        attributes: ['parentId']
    });

    let childIds = await dbModels.ProductParentChild.findAll({
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