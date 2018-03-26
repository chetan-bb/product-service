"use strict";

const chai = require("chai");
const assert = chai.assert;    // Using Assert style
const expect = chai.expect;    // Using Expect style
const should = chai.should();  // Using Should style
const discountUtil = require('./discountUtil');


describe("Function Unit test", function () {
       let Product = {
        "id": 10000148,
        "overrideDescription": null,
        "supplierPrice": "37.90",
        "mrp": "50.00",
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
    };

    describe("#getDiscountValueType() Negative test case with no discount value", function () {
        it("should return Empty object", function (done) {
            const discountValueType = discountUtil.getDiscountValueType(Product);
            discountValueType.should.be.an('object');
            expect(discountValueType).to.not.have.property('discount');
            done();
        })
    });

    describe("#getDiscountValueType() Positive test with Product Object and discount type Percentage", function () {
        it("should return type as A and value as 5", function (done) {
            Product.discountType = 'Percentage';
            Product.discountPercentage = 5;
            const discountValueType = discountUtil.getDiscountValueType(Product);
            //console.log(primaryImage);
            discountValueType.should.be.an('object');
            expect(discountValueType).to.have.property('discount');
            let discount = discountValueType.discount;
            expect(discount).to.have.property('type');
            expect(discount).to.have.property('value');

            //console.log(discountValueType);
            assert.equal(discount['type'], 'P');
            assert.equal(discount['value'], '5');
            done();
        })
    });

    describe("#getDiscountValueType() Positive test with Product Object and discount type Amount", function () {
        it("should return type as P and value as 20", function (done) {
            Product.discountType = 'Amount';
            Product.discountAmount = 10;
            const discountValueType = discountUtil.getDiscountValueType(Product);
            //console.log(primaryImage);
            discountValueType.should.be.an('object');
            expect(discountValueType).to.have.property('discount');
            let discount = discountValueType.discount;

            expect(discount).to.have.property('type');
            expect(discount).to.have.property('value');

            //console.log(discountValueType);
            assert.equal(discount['type'], 'P');
            assert.equal(discount['value'], '20');
            done();
        })
    });

    describe("#getDiscountValueType() Positive test with Product Object and discount type Amount", function () {
        it("should return type as A and value as 100", function (done) {
            Product.discountType = 'Percentage';
            Product.mrp = 1000;
            Product.discountPercentage = 10;
            const discountValueType = discountUtil.getDiscountValueType(Product);
            //console.log(primaryImage);
            discountValueType.should.be.an('object');
            expect(discountValueType).to.have.property('discount');
            let discount = discountValueType.discount;
            expect(discount).to.have.property('type');
            expect(discount).to.have.property('value');

            console.log(discountValueType);
            assert.equal(discount['type'], 'A');
            assert.equal(discount['value'], '100');
            done();
        })
    });
});