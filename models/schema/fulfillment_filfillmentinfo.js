"use strict";
const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const FulfillmentInfo = sequelize.define("FulfillmentInfo",
        {
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "fulfillment_type": {type: DataTypes.STRING(30), defaultValue: '', field: "fulfillment_type"},
        },
        // Configs,
        new base.DefaultModelConfig("fulfillment_fulfillmentinfo"));

    // FulfillmentInfo.associate = function (dbModels, value) {
    //     value.belongsTo(dbModels.Supplier, {
    //         foreignKey: {
    //             allowNull: true,
    //             name: "id"
    //         }
    //     });
    // };

    // Fulfillmentinfo type enums
    FulfillmentInfo.NORMAL = 'normal';
    FulfillmentInfo.IRCDC = 'ircdc';
    FulfillmentInfo.EXPRESS = 'express';
    FulfillmentInfo.DROP = 'drop';
    FulfillmentInfo.INSTITUTIONAL = 'institutional';
    FulfillmentInfo.KIRANA_BULK = 'kirana-bulk';
    FulfillmentInfo.KIRANA_PERISHABLE = 'kirana-perishable';
    FulfillmentInfo.KIRANA_JIT = 'kirana-jit';
    FulfillmentInfo.MARKET_PLACE = "marketplace";
    FulfillmentInfo.MARKET_PLACE_1 = "marketplace_1";
    FulfillmentInfo.NGO = "ngo";
    FulfillmentInfo.HUL = "HUL";
    FulfillmentInfo.JIT = "jit";
    FulfillmentInfo.DARKSTORE = 'darkstore-express';
    // EXPRESS_STATIC_SLOTTED = 'exp-static-slotted'
    FulfillmentInfo.SPECIALITY = 'speciality-express';
    FulfillmentInfo.SPECIALITY_CHILD = 'speciality-child-express';
    FulfillmentInfo.GIFTPREWRAP = 'gift-prewrap';
    FulfillmentInfo.INSTITUTIONAL_JIT = 'institutional-jit';
    FulfillmentInfo.DS_JIT = 'ds-jit';
    FulfillmentInfo.DARKSTORE_EXPRESS_ONLY ='darkstore-express-only';
    // FULFILLMENT_COMPANY_TYPE = (
    //     (NORMAL, 'Normal'),
    //     (IRCDC, 'ircdc'),
    //     (EXPRESS, 'Express'),
    //     (DROP, 'Drop'),
    //     (INSTITUTIONAL, 'Institutional'),
    //     (MARKET_PLACE, 'Marketplace'),
    //     (MARKET_PLACE_1, "Marketplace #1"),
    //     (KIRANA_BULK, 'Kirana Bulk'),
    //     (KIRANA_PERISHABLE, 'Kirana Perishable'),
    //     (KIRANA_JIT, 'Kirana JIT'),
    //     (HUL, 'HUL'),
    //     (NGO, 'ngo'),
    //     (JIT, 'JIT Marketplace'),
    //     (DARKSTORE, 'Darkstore Express'),
    //     (SPECIALITY, 'Speciality Express'),
    //     (SPECIALITY_CHILD, 'Speciality Child Express'),
    //     (GIFTPREWRAP,'Gift Pre Wrap'),
    //     (INSTITUTIONAL_JIT, 'Institutional Jit'),
    //     (DS_JIT, 'DarkStore JIT'),
    //     (DARKSTORE_EXPRESS_ONLY, 'Darkstore Express Only'),
    // );

    return FulfillmentInfo;
};