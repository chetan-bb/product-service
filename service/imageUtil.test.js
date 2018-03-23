"use strict";

const chai = require("chai");
const assert = chai.assert;    // Using Assert style
const expect = chai.expect;    // Using Expect style
const should = chai.should();  // Using Should style
const imageUtil = require('./imageUtil');


describe("Function Unit test", function () {
    let Product = {
        "id": 10000148,
        "overrideDescription": null,
        "supplierPrice": "37.90",
        "mrp": "47.00",
        "salePrice": "47.00",
        "availability": 1,
        "mbq": 15,
        "isDisplayParent": true,
        "discountType": null,
        "discountPercentage": null,
        "discountAmount": null,
        "overrideSubtype": false,
        "isKiranaPerishable": true,
        "isExpress": true,
        "createdOn": "2012-05-21T19:35:37.000Z",
        "updatedOn": "2018-01-08T00:49:26.000Z",
        "city_id": 1,
        "product_description_id": 10000148,
        "ProductDescription": {
            "id": 10000148,
            "packType": "",
            "multiPackDescription": "approx. 10 to 12 nos",
            "additionalInfoOne": "Onion is a vegetable which is almost like a staple in Indian food. This is also known to be one of the essential ingredients of raw salads. They come in different colours like white, red or yellow and are quite in demand in cold salads and hot soups. You can dice, slice or cut it in rings and put it in burgers and sandwiches. Onions emit a sharp flavour and fragrance once they are fried; it is due to the sulphur compound in the vegetable.",
            "additionalInfoTwo": "<h3> Nutritional Facts </h3> Onions are known to be rich in biotin. Most of the flavonoids which are known as anti-oxidants are concentrated more in the outer layers, so when you peel off the layers, you should remove as little as possible. Onions, like garlic, are also rich in sulphur compounds. Onions are known to contain manganese, copper, Vitamin B6, Vitamin C and dietary fibers along with phosphorus, folate and copper.",
            "additionalInfoThree": "<h3> Benefits </h3> Onions are known to have antiseptic, antimicrobial and antibiotic properties which help you to get rid of infections. If a piece of onion is inhaled, it can slow down or stop nose bleeding. Those who have sleeping disorders or insomnia can have a good night’s sleep if they have an onion every day. Onions also help to improve the functions of the digestive system; because it releases the digestive juices and cures any problem related to digestion.",
            "isFood": true,
            "isDummy": false,
            "name": "Onion",
            "slug": "onion",
            "description": "Onion",
            "shortDescription": "",
            "version": 16,
            "newInMarket": false,
            "hasVariableWeight": true,
            "department": "National Sourcing",
            "createdOn": "2012-10-10T23:19:40.000Z",
            "updatedOn": "2018-01-03T02:18:01.000Z",
            "brand_id": 1847,
            "top_level_category_id": 489,
            "category_id": 1354,
            "brandSlug": function () {
                return this.ProductBrand.slug;
            },
            "ProductBrand": {
                "id": 1847,
                "internalName": "Fresho",
                "name": "Fresho",
                "slug": "fresho",
                "createdOn": "2013-03-28T14:56:50.000Z",
                "updatedOn": "2016-05-12T15:26:40.000Z"
            },
            "TopCategory": {
                "name": "Fruits & Vegetables",
                "slug": "fruits-vegetables"
            },
            "Category": {
                "parent_id": 1353,
                "slug": "potatoes-onions-tomatoes"
            }
        },
        "City": {
            "id": 1,
            "name": "Bangalore",
            "slug": "bangalore",
            "prefix": "B",
            "active": true,
            "warehouseFulfilment": true,
            "createdOn": "2012-07-16T13:44:03.000Z",
            "updatedOn": "2018-01-09T17:17:24.000Z"
        }
    };

    describe("#getProductPrimaryImage() Positive test with Product Object", function () {
        it("should return sub url as /p/ and image name", function (done) {
            const primaryImage = imageUtil.getProductPrimaryImage(Product);
            //console.log(primaryImage);
            primaryImage.should.be.an('object');
            expect(primaryImage).to.have.property('subUrl');
            expect(primaryImage).to.have.property('imageName');

            let imageName = primaryImage['imageName'];
            let ProductDescription = Product.ProductDescription;
            let version = ProductDescription.version;
            assert.equal(imageName, `${ProductDescription.id}_${version}-${ProductDescription.ProductBrand.slug.toLowerCase()}-${ProductDescription.slug.toLowerCase()}.jpg`);
            done();
        })
    });

    describe("#getProductPrimaryImage() Positive test with waterMark", function () {
        it("should return sub url as /p/ and image name", function (done) {
            let noWaterMark = true;
            const primaryImage = imageUtil.getProductPrimaryImage(Product, noWaterMark);
            //console.log(primaryImage);
            primaryImage.should.be.an('object');
            expect(primaryImage).to.have.property('subUrl');
            expect(primaryImage).to.have.property('imageName');
            done();
        })
    });

    describe("#getProductPrimaryImage() Negative test with Product as null", function () {
        it("should return null ", function (done) {
            const primaryImage = imageUtil.getProductPrimaryImage(null);
            assert.equal(primaryImage, null);
            done();
        })
    });

    describe("#getProductPrimaryImage() Negative test where ProductDescription version is 0", function () {
        it("should return empty object ", function (done) {
            Product.ProductDescription.version = 0;
            const primaryImage = imageUtil.getProductPrimaryImage(Product);
            //console.log(primaryImage);
            primaryImage.should.be.an('object');
            expect(primaryImage).to.not.have.property('subUrl');
            expect(primaryImage).to.not.have.property('imageName');
            done();
        })
    });

    describe("#getProductPrimaryImage() Bundle Pack Positive", function () {
        it("should return sub url as /bpi/ and image name", function (done) {
            Object.assign(Product, {
                ProductBundlePack: {
                    "id": 1016,
                    "status": 0,
                    "description": "Heracles Olive Oil - Extra Virgin 250 ml Bottle : Buy 1 Get 1 Free",
                    "multiPackDescription": "",
                    "packType": "Bottle",
                    "weight": "250 ml",
                    "additionalInfoOne": "",
                    "additionalInfoTwo": "<h3> Ingredients </h3> Extra Virgin Olive Oil Superior Category Olive oil obtained directly from Olives and Solily by Mechanical means.",
                    "additionalInfoThree": "<h3> How to use </h3> Add in Salads,Marinades, Rotis & dals, Breads, Pastas, Baking Vegetables/Meats/Fish, Also used cooking and baking.",
                    "maxQuantity": -1,
                    "imageVersion": 12,
                    "createdOn": "2015-08-07T12:33:26.000Z",
                    "updatedOn": "2018-01-07T21:20:39.000Z",
                    "product_id": 100750299
                }
            });
            const primaryImage = imageUtil.getProductPrimaryImage(Product);
            //console.log(primaryImage);
            primaryImage.should.be.an('object');
            expect(primaryImage).to.have.property('subUrl');
            expect(primaryImage).to.have.property('imageName');
            let imageName = primaryImage['imageName'];
            let ProductDescription = Product.ProductDescription;
            let version = Product.ProductBundlePack.imageVersion;
            assert.equal(imageName, `${ProductDescription.id}_${version}-${ProductDescription.ProductBrand.slug.toLowerCase()}-${ProductDescription.slug.toLowerCase()}.jpg`);
            done();
        })
    });

    describe("#getProductSecondaryImages() Positive", function () {
        it("should return a list of string", function (done) {
            let productDescriptionAttrStrVal = "{\"3\": {\"version\": 1, \"type\": \"\"}, \"2\": {\"version\": 1, \"type\": \"\"}, \"4\": {\"version\": 1, \"type\": \"\"}}";
            let noWatermark = false;
            let ignoreShade = true;
            const primaryImage = imageUtil.getProductSecondaryImages(Product.ProductDescription,
                noWatermark, ignoreShade,
                productDescriptionAttrStrVal);
            //console.log(primaryImage);
            primaryImage.should.be.an('array');
            expect(primaryImage).to.have.lengthOf(3);
            done();
        })
    });

    describe("#getProductSecondaryImages() Positive with water-mark", function () {
        it("should return a list of string", function (done) {
            let productDescriptionAttrStrVal = "{\"3\": {\"version\": 1, \"type\": \"\"}, \"5\": {\"version\": 2, \"type\": \"\"}, \"4\": {\"version\": 1, \"type\": \"\"}}";
            let noWatermark = true;
            let ignoreShade = true;
            const primaryImage = imageUtil.getProductSecondaryImages(Product.ProductDescription,
                noWatermark, ignoreShade,
                productDescriptionAttrStrVal);
            //console.log(primaryImage);
            primaryImage.should.be.an('array');
            expect(primaryImage).to.have.lengthOf(3);
            let imageName = primaryImage[0]['imageName'];
            let subUrl = primaryImage[0]['subUrl'];
            assert.equal(subUrl, '/pnw/');
            assert.equal(imageName, 'MzE0MzE0NjQ5MA-3_1-fresho-onion.jpg');
            done();
        })
    });

     describe("#getProductSecondaryImages() Positive with water-mark and image type given", function () {
        it("should return a list of string with type in image name", function (done) {
            let productDescriptionAttrStrVal = "{\"3\": {\"version\": 1, \"type\": \"jpg\"}, \"5\": {\"version\": 2, \"type\": \"\"}," +
                " \"4\": {\"version\": 1, \"type\": \"s\"}}";
            let noWatermark = true;
            let ignoreShade = true;
            const primaryImage = imageUtil.getProductSecondaryImages(Product.ProductDescription,
                noWatermark, ignoreShade,
                productDescriptionAttrStrVal);
            //console.log(primaryImage);
            primaryImage.should.be.an('array');
            expect(primaryImage).to.have.lengthOf(2); // size two as type=s and ignoreShade should not be added to secondary images
            let imageName = primaryImage[0]['imageName'];
            let subUrl = primaryImage[0]['subUrl'];
            assert.equal(subUrl, '/pnw/');
            assert.equal(imageName, 'MzE0MzE0NjQ5MA-3-jpg_1-fresho-onion.jpg');
            done();
        })
    });

    describe("#getProductSecondaryImages() Negative with empty description attr", function () {
        it("should return a list of string", function (done) {
            let productDescriptionAttrStrVal = "";
            let noWatermark = false;
            let ignoreShade = true;
            const primaryImage = imageUtil.getProductSecondaryImages(Product.ProductDescription,
                noWatermark, ignoreShade,
                productDescriptionAttrStrVal);
            //console.log(primaryImage);
            primaryImage.should.be.an('array');
            expect(primaryImage).to.have.lengthOf(0);
            done();
        })
    })

});