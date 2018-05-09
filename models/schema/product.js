"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const Product = sequelize.define("Product",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "overrideDescription": {type: DataTypes.TEXT, allowNull: true, field: "override_description"},
            "supplierPrice": {type: DataTypes.DECIMAL(8, 2), allowNull: true, field: "supplier_price"},
            "mrp": {type: DataTypes.DECIMAL(8, 2), allowNull: true},
            "salePrice": {type: DataTypes.DECIMAL(8, 2), allowNull: true, field: "sale_price"},
            "availability": {type: DataTypes.INTEGER, defaultValue: 1},
            "mbq": {type: DataTypes.INTEGER, allowNull: true},
            "isDisplayParent": {type: DataTypes.BOOLEAN, defaultValue: true, field: "is_display_parent"},
            "discountType": {type: DataTypes.STRING(15), allowNull: true, field: "discount_type"},
            "discountPercentage": {type: DataTypes.DECIMAL(5, 2), allowNull: true, field: "discount_percentage"},
            "discountAmount": {type: DataTypes.DECIMAL(8, 2), allowNull: true, field: "discount_amount"},
            "overrideSubtype": {type: DataTypes.BOOLEAN, defaultValue: false, field: "override_subtype"},
            "isKiranaPerishable": {type: DataTypes.BOOLEAN, defaultValue: false, field: "is_kirana_perishable"},
            "isExpress": {type: DataTypes.BOOLEAN, defaultValue: false, field: "is_express"}
        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("product_product"));

    Product.DISCOUNT_TYPE_PERCENTAGE = 'Percentage';
    Product.DISCOUNT_TYPE_AMOUNT = 'Amount';


    Product.associate = function (dbModels, value) {
        value.belongsTo(dbModels.City, {
            foreignKey: {
                allowNull: false,
                defaultValue: 1
            }
        });
        value.belongsTo(dbModels.ProductDescription, {
            foreignKey: {
                allowNull: true
            }
        });
        value.belongsTo(dbModels.Supplier, {
            foreignKey: {
                allowNull: true,
            }
        });
    };

    Product.topCategoryName = function () {
        if(this.ProductDescription.TopCategory){
            return this.ProductDescription.TopCategory.name
        }
    };

    Product.topCategorySlug = function () {
        if(this.ProductDescription.TopCategory){
            return this.ProductDescription.TopCategory.slug
        }
    };

    Product.brandName = function () {
        if(this.ProductDescription.ProductBrand){
            return this.ProductDescription.ProductBrand.name
        }

        return ''
    };

    Product.brandSlug = function () {
        if(this.ProductDescription.ProductBrand){
            return this.ProductDescription.ProductBrand.slug
        }

        return ''
    };

    Product.description = function () {
        // console.log(this);
        if(this.ProductBundlePack){
            return this.ProductBundlePack.description;
        }else if (this.overrideDescription){
            return this.overrideDescription;
        }else if(this.ProductDescription){
            return this.ProductDescription.description;
        }else {
            return '';
        }
    };

    Product.short_description = function () {
        // console.log(this);
        if(this.ProductDescription){
            return this.ProductDescription.short_description;
        }else {
            return '';
        }
    };

    Product.multipackDescription = function () {
        if(this.ProductBundlePack){
            return this.ProductBundlePack.multiPackDescription;
        }else if(this.ProductDescription){
            return this.ProductDescription.multiPackDescription;
        }
    };

    Product.PackType = function () {
        if(this.ProductBundlePack){
            return this.ProductBundlePack.packType;
        }else if(this.ProductDescription){
            return this.ProductDescription.packType;
        }
    };

    Product.weight = function () {
        if(this.ProductBundlePack && this.ProductBundlePack.weight){
            return this.ProductBundlePack.weight;
        }else if(this.ProductDescription && this.ProductDescription.weight){
            return this.ProductDescription.weight;
        }else {
            return ''
        }
    };

    Product.additionalInfoOne = function () {
        if(this.ProductBundlePack){
            return this.ProductBundlePack.additionalInfoOne;
        }else if(this.ProductDescription){
            return this.ProductDescription.additionalInfoOne;
        }
    };

    Product.additionalInfoTwo = function () {
        if(this.ProductBundlePack){
            return this.ProductBundlePack.additionalInfoTwo;
        }else if(this.ProductDescription){
            return this.ProductDescription.additionalInfoTwo;
        }
    };

    Product.additionalInfoThree = function () {
        if(this.ProductBundlePack){
            return this.ProductBundlePack.additionalInfoThree;
        }else if(this.ProductDescription){
            return this.ProductDescription.additionalInfoThree;
        }
    };

    return Product;
};