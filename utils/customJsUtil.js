'use strict';
const underscore = require("underscore")._;

module.exports = ()=> {
    Object.prototype.isEmpty = function () {
        if(!this) return true;
        return underscore.isEmpty(this);
    };
};