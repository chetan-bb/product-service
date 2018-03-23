"use strict";
const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const Supplier = sequelize.define("Supplier",
        {
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},            
            "slug": {type: DataTypes.STRING, allowNull: true,},            
        },
        // Configs,
        new base.DefaultModelConfig("product_supplier"));

    Supplier.associate = function (dbModels, value) {
        value.belongsTo(dbModels.FulfillmentInfo, {
            foreignKey: {
                allowNull: true,
                name: "fulfillment_info_id"
            },
            as: "FulfillmentInfo"
        });
    };
    return Supplier;
};