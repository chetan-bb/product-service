"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const ComboProductDiscountBreakup = sequelize.define("ComboProductDiscountBreakup",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "discount_type": {type: DataTypes.INTEGER, defaultValue:1, allowNull: false, field: "discount_type"},
            "total_discount_value": {type: DataTypes.INTEGER, allowNull: true, field: "total_discount_value"},
            "start_date": {type: DataTypes.DATE, allowNull: false, field: "start_date"},
            "end_date": {type: DataTypes.DATE, allowNull: false, field: "end_date"},
            
        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("product_comboproductdiscountbreakup"));

        ComboProductDiscountBreakup.associate = function (dbModels, value) {
            value.belongsTo(dbModels.Product, {
                foreignKey: {
                    allowNull: false,
                    name: 'combo_parent_product_id'
                },
                as: "ParentId"
            });
        };
        ComboProductDiscountBreakup.associate = function (dbModels, value) {
            value.belongsTo(dbModels.Product, {
                foreignKey: {
                    allowNull: false,
                    name: 'combo_child_product_id'
                },
                as: "ChildProduct"
            });
        };    

    return ComboProductDiscountBreakup;
};