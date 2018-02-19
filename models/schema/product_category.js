"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const Category = sequelize.define("Category",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "name": {type: DataTypes.STRING(200), allowNull: false},
            "slug": {type: DataTypes.STRING(50), allowNull: false},
            "description": {type: DataTypes.TEXT, allowNull: false},
            "ordering": {type: DataTypes.INTEGER, defaultValue: 0},
            "isActive": {type: DataTypes.BOOLEAN, defaultValue: true, field: "is_active"},
            "isKiranaFmcg": {type: DataTypes.BOOLEAN, defaultValue: true, field: "is_kirana_fmcg"},
            "level": {type: DataTypes.INTEGER, defaultValue: 2},
        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("product_category"));

    Category.associate = function (dbModels, value) {
        value.belongsTo(dbModels.Category, {
            foreignKey: {
                allowNull: true,
                name: 'parent_id',
                as: "Parent"
            }
        });
    };
    return Category;
};