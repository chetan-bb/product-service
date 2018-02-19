"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const ProductParentChild = sequelize.define("ProductParentChild",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "isDefault": {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: true, field: "is_default"},
            "order": {type: DataTypes.INTEGER, defaultValue: false},

            "parentId": {type: DataTypes.INTEGER, allowNull: true, field:"parent_id"},
            "childId": {type: DataTypes.INTEGER, allowNull: true, field: "child_id"}
        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("product_productparentchild"));

    ProductParentChild.associate = function (dbModels, value) {
        value.belongsTo(dbModels.ProductDescription, {
            foreignKey: {
                allowNull: true,
                name: 'parent_id',
            },
            as: "ParentId"
        });
    };
    ProductParentChild.associate = function (dbModels, value) {
        value.belongsTo(dbModels.ProductDescription, {
            foreignKey: {
                allowNull: true,
                name: 'child_id',
                as: "childId"
            },
            as: "ChildId"
        });
    };
    return ProductParentChild;
};