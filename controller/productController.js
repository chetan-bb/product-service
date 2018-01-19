'use strict';

const express = require('express');
const app = express();
console.log('Env value for env: ' + app.get('env'));

function productController(req, res) {
    console.log("Inside controller!!!");
    console.log('Env value for env: ' + app.get('env'));
    getProductDataAsync(req, res)
        .then((result) => {
            console.log(result);
            res.json({
                "status": 0, "message": "success",
                "response": result
            });
        }).catch((err) => {
            res.status(err.status || 500);
            res.json('error', {
                message: err.message,
            });
    });
}

function getProductDataAsync(req, res) {
    return Promise.all([fetchPromoInfo(),
        getStoreAvailability(),
        getProductData(),
        getSaleInfo(),
        getComboInfo(),
        getProductTags()])
}

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


function getProductTags() {
    let tags = {
        "tags": [
        {
          "header": "FOOD TYPE",
          "values": [
            {
              "Veg": {
                "dest_type": "product_list",
                "dest_slug": "type=ts&slug=161",
                "url": "web url here"
              }
            }
          ],
          "type": 1
        }
      ]
    };

    return new Promise((resolve => {
        setTimeout(resolve(tags), 3000);
    }))
}

module.exports = productController;
