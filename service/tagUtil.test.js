"use strict";

const chai = require("chai");
const assert = chai.assert;    // Using Assert style
const expect = chai.expect;    // Using Expect style
const should = chai.should();  // Using Should style
const tagUtil = require('./tagUtil');


describe("Function Unit test", function () {
    describe("#createTagObject() Positive test case for veg tag", function () {
        it("should return veg tag object ", function (done) {

            let tagValueList = [
                {
                    "id": 787,
                    "tagValue": "Vegetarian",
                    "valueSlug": "vegetarian",
                    "displayOrder": 1,
                    "isActive": true,
                    "tagGroupId": 84,
                    "tagGroupAttributeType": "Food Preference",
                    "tagGroupTypeSlug": "food-preference",
                    "tagGroupCopyToParentChild": false
                },

                {
                    "id": 788,
                    "tagValue": "Chinese",
                    "valueSlug": "chinese",
                    "displayOrder": 2,
                    "isActive": true,
                    "tagGroupId": 85,
                    "tagGroupAttributeType": "Food Preference",
                    "tagGroupTypeSlug": "food-preference",
                    "tagGroupCopyToParentChild": false
                }
            ];

            const tagList = tagUtil.createTagObject(tagValueList);
            console.log(tagList);

            tagList.should.be.an('object');
            expect(tagList).to.have.property(tagValueList[0]['tagGroupAttributeType']);
            expect(tagList[tagValueList[0]['tagGroupAttributeType']]).to.have.lengthOf(2);
            assert.equal(tagList['Food Preference'][0]['slug'], tagValueList[0].id);
            done();
        })
    });
});