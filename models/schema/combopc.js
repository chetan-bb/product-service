"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const ComboPc = sequelize.define("ComboPc",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "quantity": {type: DataTypes.INTEGER, defaultValue:1, allowNull: false, field: "quantity"},
            "status": {type: DataTypes.INTEGER, allowNull: true, field: "status"},
        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("promo_combopc"));

        ComboPc.associate = function (dbModels, value) {
            value.belongsTo(dbModels.Product, {
                foreignKey: {
                    allowNull: false,
                    name: 'combo_parent_product_id'
                },
                as: "ParentId"
            });
        };
        ComboPc.associate = function (dbModels, value) {
            value.belongsTo(dbModels.Product, {
                foreignKey: {
                    allowNull: false,
                    name: 'combo_child_product_id'
                },
                as: "ChildId"
            });
        };

        ComboPc.associate = function (dbModels, value) {
            value.belongsTo(dbModels.ComboProductDiscountBreakup, {
                foreignKey: {
                    allowNull: false,
                    name: 'current_discount_id'
                },
                as: "CurrentDiscount"
            });
        };
    
        //STATUS
        ComboPc.ACTIVE = 0;
        ComboPc.INACTIVE = 1;
        
        //COMBO_TYPE
        // ComboProductDescription.SINGLE_SKU = 0;
        // ComboProductDescription.MULTI_SKU = 1

    return ComboPc;
};