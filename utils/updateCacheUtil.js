const controller = require("../service/productService");

const getProduct = controller.getProduct;
const EventEmitter = require('events');

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
    
    emitUpdateCacheList(productIdList, masterRiList){
        logger.debug(`Inside emitUpdateCacheList function. 
                Args pdIdList= ${productIdList} riList= ${masterRiList}`);
        for (let pdId in productIdList){
            for(let ri in masterRiList){
                this.emit('updateCache', pdId, ri);
            }
        }
    };
}

module.exports = new UpdateCacheUtil();