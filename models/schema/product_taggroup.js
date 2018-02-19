


"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    return sequelize.define("TagGroup",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "attributeType": {type: DataTypes.STRING(200), field: "attribute_type"},
            "typeSlug": {type: DataTypes.STRING(200), field: "type_slug"},
            "copyToParentChild": {type: DataTypes.BOOLEAN, defaultValue: false, field: "copy_to_parent_child"},
        }, DataTypes),
        // Configs,
        new base.DefaultModelConfig("tag_taggroup"));
};