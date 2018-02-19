"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const ProductDescription = sequelize.define("ProductDescription",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "packType": {type: DataTypes.STRING(25), allowNull: true, field: "pack_type"},
            "multiPackDescription": {type: DataTypes.TEXT, allowNull: false, field: "multipack_description"},
            "additionalInfoOne": {type: DataTypes.TEXT, allowNull: true, field: "additional_info_one"},
            "additionalInfoTwo": {type: DataTypes.TEXT, allowNull: true, field: "additional_info_two"},
            "additionalInfoThree": {type: DataTypes.TEXT, allowNull: true, field: "additional_info_three"},
            "isFood": {type: DataTypes.BOOLEAN, defaultValue: true, field: "is_food"},
            "isDummy": {type: DataTypes.BOOLEAN, defaultValue: false, field: "is_dummy"},
            "name": {type: DataTypes.STRING(255), allowNull: false},
            "slug": {type: DataTypes.STRING(255), allowNull: false},
            "description": {type: DataTypes.TEXT, allowNull: false},
            "shortDescription": {type: DataTypes.STRING(55), defaultValue: "", field: "short_description"},
            "version": {type: DataTypes.INTEGER, defaultValue: 0},
            "newInMarket": {type: DataTypes.BOOLEAN, defaultValue: false, field: "new_in_market"},
            "hasVariableWeight": {type: DataTypes.BOOLEAN, defaultValue: false, field: "has_variable_weight"},
            "department": {type: DataTypes.STRING(50)},
        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("product_productdescription"));

    ProductDescription.associate = function (dbModels, value) {
        value.belongsTo(dbModels.ProductBrand, {
            foreignKey: {
                allowNull: true,
                name: "brand_id"
            }
        });
        value.belongsTo(dbModels.Category, {
            foreignKey: {
                allowNull: true,
                name: "top_level_category_id",
            },
            as: "TopCategory"

        });
        value.belongsTo(dbModels.Category, {
            foreignKey: {
                allowNull: true,
                name: "category_id",
            },
            as: "Category"
        });
        value.belongsToMany(dbModels.TagValue, {
            through: "product_productdescription_product_tags",
            timestamps: false  // Always pass it, otherwise two new columns "created_at", "updated_at" will get created
        });
    };

    ProductDescription.prototype.brandSlug = function () {
        if(this.ProductBrand){
            return this.ProductBrand.slug;
        }
        return ''
    };

    return ProductDescription;
};