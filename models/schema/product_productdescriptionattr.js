"use strict";
const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const ProductDescriptionAttr = sequelize.define("ProductDescriptionAttr",
        {
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "intValue": {type: DataTypes.INTEGER, defaultValue: 0, field: "int_value"},
            "strValue": {type: DataTypes.STRING(1024), defaultValue: '', field: "str_value"},
        },
        // Configs,
        new base.DefaultModelConfig("product_productdescriptionattr"));

    ProductDescriptionAttr.associate = function (dbModels, value) {
        value.belongsTo(dbModels.ProductDescription, {
            foreignKey: {
                allowNull: true,
                name: "parent_obj_id"
            }
        });
    };
    return ProductDescriptionAttr;
};