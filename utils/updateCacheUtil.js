const controller = require("../service/productService");

const getProduct = controller.getProduct;
const EventEmitter = require('events');
const productCacheEmitter = require('events');

class UpdateCacheUtil extends EventEmitter {
    constructor(){
        super();
        this.on('updateCache',(productId, masterRi) => {
            // logger.debug(`Inside updateCache ON function.
            //     Args pdId= ${productId} ri= ${masterRi}`);
            const updateCacheMode = true;
            getProduct(productId, masterRi, updateCacheMode);
        });
    }

    emitUpdateCache(productId, masterRi){
        logger.debug(`Inside emitUpdateCache function. 
                Args pdId= ${productId} ri= ${masterRi}`);
        this.emit('updateCache', productId, masterRi);
        
    };    
}

module.exports = new UpdateCacheUtil();