'use strict';

const base = require('./base');

module.exports = (sequelize, DataTypes) => {
    const ProductBundlePack = sequelize.define('ProductBundlePack',
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "status": {type: DataTypes.INTEGER},
            "description": {type: DataTypes.TEXT, allowNull: true},
            "multiPackDescription": {type: DataTypes.STRING(200), allowNull: true, field: "multipack_description"},
            "packType": {type: DataTypes.STRING(25), allowNull: true, field: "pack_type"},
            "weight": {type: DataTypes.STRING(25), allowNull: true},
            "additionalInfoOne": {type: DataTypes.TEXT, allowNull: true, field: "additional_info_one"},
            "additionalInfoTwo": {type: DataTypes.TEXT, allowNull: true, field: "additional_info_two"},
            "additionalInfoThree": {type: DataTypes.TEXT, allowNull: true, field: "additional_info_three"},
            "maxQuantity": {type: DataTypes.INTEGER, defaultValue: -1, field: "max_quantity"},
            "imageVersion": {type: DataTypes.INTEGER, allowNull: true, field:"image_version"},
        }, DataTypes),
        new base.DefaultModelConfig("product_productbundlepack"));

    ProductBundlePack.associate = function (dbModels, value) {
        dbModels.Product.hasOne(value, {
            foreignKey: {
                allowNull: false,
                name: 'product_id',
            }
        });
    };


    ProductBundlePack.ACTIVE = 0;
    ProductBundlePack.INACTIVE = 1;

    return ProductBundlePack;
};