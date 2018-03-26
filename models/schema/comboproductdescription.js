"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const ComboProductDescription = sequelize.define("ComboProductDescription",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "quantity": {type: DataTypes.INTEGER, defaultValue:1, allowNull: true, field: "quantity"},
            "combo_type": {type: DataTypes.INTEGER, allowNull: false, field: "combo_type"},
            "status": {type: DataTypes.INTEGER,defaultValue:0, allowNull: true, field: "status"}            
        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("product_comboproductdescription"));

        ComboProductDescription.associate = function (dbModels, value) {
            value.belongsTo(dbModels.ProductDescription, {
                foreignKey: {
                    allowNull: false,
                    name: 'parent_combo_sku_id'
                },
                as: "ParentId"
            });
        };
        ComboProductDescription.associate = function (dbModels, value) {
            value.belongsTo(dbModels.ProductDescription, {
                foreignKey: {
                    allowNull: false,
                    name: 'child_sku_id'
                },
                as: "ChildProductDescription"
            });
        };
    
        //STATUS
        ComboProductDescription.ACTIVE = 0;
        ComboProductDescription.INACTIVE = 1;
        
        //COMBO_TYPE
        ComboProductDescription.SINGLE_SKU = 0;
        ComboProductDescription.MULTI_SKU = 1

    return ComboProductDescription;
};