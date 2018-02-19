"use strict";

const base = require('./base');

const DefaultModelConfig = base.DefaultModelConfig;

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const Supplier = sequelize.define("Supplier",
        // Columns
        {
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
            // "code": {type: DataTypes.STRING(10), allowNull: true},
            // "name": {type: DataTypes.STRING(100), allowNull: false},
            // "slug": {type: DataTypes.STRING(100), allowNull: true},
            // "description": {type: DataTypes.TEXT, allowNull: true},
            // "rank": {type: DataTypes.INTEGER, defaultValue: 0}
        },
        // Configs, 
        new DefaultModelConfig("product_supplier"));

    Supplier.associate = function (dbModels, value) {
        value.belongsTo(dbModels.City, {
            foreignKey: {
                allowNull: false,
                defaultValue: 1
            }
        });
        value.belongsTo(dbModels.FulfillmentInfo, {
            foreignKey: {
                allowNull: true
            }
        });
    };
    return Supplier;
};