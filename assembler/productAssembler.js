'use strict';

const express = require('express');
const discountUtil = require('../controller/discountUtil');
const imageUtil = require('../controller/imageUtil');
const app = express();
const productController = require('../controller/productController');
const striptags = require('striptags');
const CONSTANTS = require('./constants');


function productDetailHandler(req, res) {
    let apiVersion = req.params['apiVersion'];
    let productDescId = req.params['productDescId']; // || 10000148;
    let masterRi = req.params['masterRi'];// || 1;
    let dbModels = req.app.locals.dbModels;
    let dbInstance = req.app.locals.dbInstance;

    getProductDataAsync(dbInstance, dbModels, productDescId, masterRi)
        .then((result) => {
            res.status(200).json({
                "status": 0, "message": "success",
                "response": result
            });
        }).catch((err) => {
            res.status(err.status || 500).json({
                "status": -1, "message": err.message
            });
    });
}

async function getProductDataAsync(dbInstance, dbModels, productDescId, masterRi) {
    try {
        let productPricingResultObject = await Promise.all([
            productController.getProduct(dbInstance, dbModels, productDescId, masterRi),
            productController.getAllChildrenForPdId(dbInstance, dbModels, productDescId, masterRi)]);
        if (!productPricingResultObject) {
            throw "Product not found!";
        }

        let productResult = productPricingResultObject[0];
        let childProducts = productPricingResultObject[1];

        let childProductsResponse = [];
        childProducts.forEach((productResult) => {
            let result = generateProductDetailResponse(productResult.Product,
                productResult.Price,
                productResult.ProductDescriptionAttr,
                productResult.ParentCategory,
                productResult.ManualTagValues, productResult.AutoTagValues);
            childProductsResponse.push(result);
        });
        let parentProductResponse = generateProductDetailResponse(productResult.Product,
            productResult.Price,
            productResult.ProductDescriptionAttr,
            productResult.ParentCategory,
            productResult.ManualTagValues, productResult.AutoTagValues);

        return Object.assign(parentProductResponse, {children: childProductsResponse});
    } catch (err) {
        throw err;
    }

}


function generateProductDetailResponse(Product, Price, ProductDescriptionAttr, ParentCategory,
                                             ManualTagValues, AutoTagValues) {
    //get data from controller and assemble
    let responseGetters = [getProductData(Product),
                                            getPricingData(Price),
                                            getProductImages(Product, ProductDescriptionAttr),
                                            getBrandData(Product),
                                            getCategoryData(Product),
                                            getDiscount(Product),
                                            getProductAdditionalAttr(Product),
                                            getVariableWeightMsgAndLink(Product.ProductDescription,
                                                ParentCategory, Product.City), //todo this city might be request city i think
                                            getProductTags(ManualTagValues, AutoTagValues)
                                            ];
    let response = {};
    responseGetters.forEach((fn)=>{
        Object.assign(response, fn);
    });
    return response;





    // let productResponse = await Promise.all([getProductData(Product),
    //                                         getPricingData(Price),
    //                                         getProductImages(Product, ProductDescriptionAttr),
    //                                         getBrandData(Product),
    //                                         getCategoryData(Product),
    //                                         getGiftData(Product),
    //                                         getDiscount(Product),
    //                                         getProductAdditionalAttr(Product),
    //                                         getVariableWeightMsgAndLink(Product.ProductDescription,
    //                                             ParentCategory, Product.City), //todo this city is request city i think
    //                                         getProductTags(ManualTagValues, AutoTagValues)
    //                                         ]);
    //
    // let response = {};
    // productResponse.forEach((productAttObject)=>{
    //     if(productAttObject){
    //         Object.assign(response, productAttObject);
    //     }
    // });
    // return response;
}


function getProductTags(ManualTagValues, AutoTagValues) {
    let tagList = [];
    if (ManualTagValues) {
        Object.entries(ManualTagValues).forEach(([key, values]) => {
            console.log(key, values);
            tagList.push({
                header: key.toUpperCase(),
                values: values.map((value) => {
                    return {
                        [value['tagValue']]: {
                            dest_type: CONSTANTS.PRODUCT_LIST,
                            dest_slug: `type=${CONSTANTS.TAG_SEARCH}&slug=${value.slug}`,
                            url: value.url
                        }
                    }

                })
            })
        });
    }
    if (AutoTagValues) {
        Object.entries(AutoTagValues).forEach(([key, values]) => {
            console.log(key, values);
            tagList.push({
                header: 'More Info',
                values: values.map((value) => {
                    return {
                        [value['tagValue']]: {
                            dest_type: CONSTANTS.PRODUCT_LIST,
                            dest_slug: `type=${CONSTANTS.TAG_SEARCH}&slug=${value.slug}`,
                            url: value.url
                        }
                    }

                })
            })
        });
    }
    return {tags:tagList}
}

function getProductImages(Product, ProductDescriptionAttr) {
    let primaryImageObj = imageUtil.getProductPrimaryImage(Product);
    console.log(primaryImageObj);
    if(!primaryImageObj) return {images:[]};

    let noWatermark = false;
    let ignoreShade = true;
    let secondaryImages = [];
    if(ProductDescriptionAttr) {
        secondaryImages = imageUtil.getProductSecondaryImages(Product.ProductDescription,
            noWatermark, ignoreShade,
            ProductDescriptionAttr.strValue);
    }
    console.log(secondaryImages);

    let subUrl = primaryImageObj.subUrl;
    let images = [primaryImageObj.imageName];
    images = images.concat(secondaryImages);
    return {images:images, subUrl:subUrl}
}

function getBrandData(Product) {
    return {
        "brand": {
            "name": Product.brandName.call(Product),
            "slug": Product.brandSlug.call(Product),
            "url": `/pb/${Product.brandSlug.call(Product)}`
        }
    }
}

function getCategoryData(Product) {
    return {
        "category": {
            "tlc_name": Product.topCategoryName.call(Product),
            "tlc_slug": Product.topCategorySlug.call(Product)
        }
    }
}

function getDiscount(Product) {
    return discountUtil.getDiscountValueType(Product)
}


function getProductData(Product) {
    // return new Promise((resolve, reject) => {
    //     resolve({
    //     id: Product.ProductDescription.id,
    //      desc: Product.description.call(Product),
    //     sp: Product.salePrice,
    //     pack_desc: Product.multipackDescription.call(Product) || Product.PackType.call(Product),
    //     mrp: Product.mrp,
    //     w: Product.weight.call(Product),
    //     });
    // });
    return {
        "id": Product.ProductDescription.id,
         "desc": Product.description.call(Product),
        "pack_desc": Product.multipackDescription.call(Product) || Product.PackType.call(Product),
        "w": Product.weight.call(Product),
    };
}

function getPricingData(Price) {
    return {
        "mrp": Price.mrp,
        "sp": Price.salePrice
    }
}

function getProductAdditionalAttr(Product) {

    let additionalInfoOne = Product.additionalInfoOne.call(Product);
    let additionalInfoTwo = Product.additionalInfoTwo.call(Product);
    let additionalInfoThree = Product.additionalInfoThree.call(Product);
    let tabContent = [];

    if(additionalInfoOne){
        tabContent.push({
            title: 'About',
            content: additionalInfoOne
        })
    }
    
    if(additionalInfoTwo){
        let extractedString = extractTabTitleAndContent(additionalInfoTwo);
        tabContent.push({
            title: extractedString.title,
            content: extractedString.content
        })
    }

    if(additionalInfoThree){
        let extractedString = extractTabTitleAndContent(additionalInfoThree);
        tabContent.push({
            title: extractedString.title,
            content: extractedString.content
        })
    }

    return {tabs: tabContent}
}

function extractTabTitleAndContent(extractingString) {
    let title = null;
    let content = null;
    let h3TagEndIndex = extractingString.indexOf('</h3>');
    let hasHtmlTag = h3TagEndIndex !== -1;
    if(hasHtmlTag){
        title = striptags(extractingString.substr(0, h3TagEndIndex)).trim();
        content = striptags(extractingString.substr(h3TagEndIndex, extractingString.length));
    }else {
        title = 'About';
        content = extractingString;
    }

    return {title: title, content: content}
}

function getVariableWeightMsgAndLink(ProductDescription, ParentCategory, City) {
    let storeVariableWeight = false; //todo fix me for speciality products
    let CAP_VARIABLE_WEIGHT = 5; //todo fix me for getting data from local settings
    if(ProductDescription.hasVariableWeight && City.warehouseFulfilment){
        return { variableWeight: {
                    msg: getVariableWeightMsg(ProductDescription, ParentCategory,
                        CAP_VARIABLE_WEIGHT, storeVariableWeight),
                    link: '/variableweight/?source=app'
            }
        }
    }
}

function getVariableWeightMsg(ProductDescription, ParentCategory, CAP_VARIABLE_WEIGHT, storeVariableWeight) {
    /*
    storeVariableWeight: for speciality products
     */
    if(storeVariableWeight){
        return `Please note that this item will be billed based on actual weight during order processing.`+
        `If the weight of this item delivered to you is more than ${storeVariableWeight}%, bigbasket will `+
        `charge you an increase of only ${storeVariableWeight}%`
    } else if(ParentCategory.slug === 'seafood'){
        return 'Please note that the weight is prior to cleaning and cutting. ' +
            'Product will be delivered after cleaning and cutting. ' +
            'There will be a weight loss of about 30-40% after cleaning and cutting. ' +
            'Cleaned with bones retained.'
    }else {
        let productType = ProductDescription.department === 'MEAT' ? 'meat' : 'fresh fruit and vegetables';
        return `Please note that ${productType} items will be billed based on exact weight during order `+
        `processing (in case the actual weight exceeds the requested weight by more than ${CAP_VARIABLE_WEIGHT}%, `+
        `you will be charged only for ${CAP_VARIABLE_WEIGHT}% excess weight).`
    }
}





















































// function getProductDataAsync(req, res) {
//     return Promise.all([fetchPromoInfo(),
//         getStoreAvailability(),
//         getProductData(),
//         getSaleInfo(),
//         getComboInfo(),
//         getProductTags()])
// }

function fetchPromoInfo() {

    let promo = {
        "promo_info": {
            "type": "customized_combo",
            "label": "Offer",
            "id": 267005,
            "name": "Offer on bb Royal Whole Wheat Atta 5 kg",
            "saving": 39.0,
            "savings_display": "Get additional 17.3% off",
            "desc": "Buy bb Royal Whole Wheat Atta 5 kg at Rs. 130/- only",
            "url": "/promo/offers-for-january/offer-on-bb-royal-whole-wheat-atta-/267005/"
        }
    };
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(promo);
        }, 5000);
    });
}


function getStoreAvailability() {

    let store_availability = {
        "store_availability": [
                {
                    "tab_type": "express",
                    "pstat": "A",
                    "availability_info_id": "37.57",
                    "store_id": "37"
                }
            ]
    };
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(store_availability);
        }, 5000);
    });

}

/*
function getProductData() {
    let product = {
        "product": {
            "id": 10000148,
            "desc": "Onion",
            "sp": "39.00",
            "pack_desc": "approx. 10 to 12 nos",
            "mrp": "39.00",
            "w": "1 kg",
            "images": ["10000148-2_2-fresho-onion.jpg", "10000148-2_3-fresho-onion.jpg"],
            "variable_weight": {
                "msg": "",
                "link": ""
            },
            "discount": {
                "type": "A",
                "amount": "10.35"
            },
            "brand": {
                "name": "Fresho",
                "slug": "fresho",
                "url": "/pb/fresho/"
            },
            "category": {
                "tlc_name": "Fruits & Vegetables",
                "tlc_slug": "fruits-vegetables"
            },
            "gift": {
                "msg": "Gift message can be entered on the checkout page!"
            },
            "additional_attr": {
                "is_new": false,
                "display_order": 0,
                "offer_score": 0,
                "info": [
                    {
                        "type": "parent_child_variant_type|bby|reco",
                        "image": "40078331-100-s_3.jpg",
                        "sub_type": "annotation|colour",
                        "label": "18 more shades|One week ago"
                    }
                ]
            },

        }
    };

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(product);
        }, 2000);
    });
}
*/



function getSaleInfo() {
    let saleInfo = {
        "sale_info": {
        "type": "SALE_TYPE_FLASH",
        "display_message": "",
        "end_time": "1502103600",
        "maximum_redem_per_order": 5,
        "maximum_redem_per_member": 10,
        "show_counter": false,
        "sale_message": "",
        "offers_sale_msg": "Flas"
      }
    };

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(saleInfo);
        }, 2000);
    });
}


function getComboInfo() {
    let comboInfo = {
        "combo_info": {
        "destination": {
          "dest_type": "combo_list",
          "display_name": "+ 2  More Combos",
          "dest_slug": "prod_id=10000148"
        },
        "total_saving_msg": "SAVE Rs 242 with Combo",
        "items": [
          {
            "id": 40110352,
            "brand": "bb Royal",
            "sp": "246",
            "mrp": "360",
            "delivery_pref": "standard",
            "saving_msg": "SAVE Rs 114 With Combo",
            "qty": "3",
            "wgt": "1 kg",
            "p_desc": "bb Royal Basmati Rice - Premium 1 kg "
          }
        ],
        "total_sp": "663",
        "total_mrp": "905",
        "annotation_msg": "All items will go together in a single shipment"
      }
    };

    return new Promise(function (resolve, reject) {
        setTimeout(()=>{resolve(comboInfo)}, 1000);
    });
}


// function getProductTags() {
//     let tags = {
//         "tags": [
//         {
//           "header": "FOOD TYPE",
//           "values": [
//             {
//               "Veg": {
//                 "dest_type": "product_list",
//                 "dest_slug": "type=ts&slug=161",
//                 "url": "web url here"
//               }
//             }
//           ],
//           "type": 1
//         }
//       ]
//     };
//
//     return new Promise((resolve => {
//         setTimeout(resolve(tags), 3000);
//     }))
// }

module.exports = productDetailHandler;
