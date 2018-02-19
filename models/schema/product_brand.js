"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    return sequelize.define("ProductBrand",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "internalName": {type: DataTypes.STRING(255), allowNull: false, field: "internal_name"},
            "name": {type: DataTypes.STRING(255), allowNull: false},
            "slug": {type: DataTypes.STRING(50), allowNull: true, unique: true}
        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("product_productbrand"));
};