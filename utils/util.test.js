"use strict";
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const path = require("path");
const amountDisplay = require("../utils/util").amountDisplay;


describe("Functional testing for #amountDisplay", function(){
    it("should return empty string", function(){
        let input = "";
        let res = amountDisplay(input);
        assert(res === "", `Error ${res} returned for ${input}`);
    })
    it("should return empty string", function(){
        let input = undefined;
        let res = amountDisplay(input);
        assert(res === "", `Error ${res} returned for ${input}`);
    })
    it("should return string 0", function(){
        let input = 0;
        let res = amountDisplay(input);
        assert(res === "0", `Error ${res} returned for ${input}`);
    })
    it("should return string 0", function(){
        let input = 0.00;
        let res = amountDisplay(input);
        assert(res === "0", `Error ${res} returned for ${input}`);
    })
    it("should return string 10", function(){
        let input = 10.00;
        let res = amountDisplay(input);
        assert(res === "10", `Error ${res} returned for ${input}`);
    })
    it("should return string 20", function(){
        let input = 20.00000000000002;
        let res = amountDisplay(input);
        assert(res === "20", `Error ${res} returned for ${input}`);
    })

    it("should return string 10.33", function(){
        let input = 10.33333333333;
        let res = amountDisplay(input);
        assert(res === "10.33", `Error ${res} returned for ${input}`);
    })

    it("should return string 110.56", function(){
        let input = 110.555555555555;
        let res = amountDisplay(input);
        assert(res === "110.56", `Error ${res} returned for ${input}`);
    })

    it("should return string 0.01", function(){
        let input = 0.01231;
        let res = amountDisplay(input);
        assert(res === "0.01", `Error ${res} returned for ${input}`);
    })

    it("should return string 0.10", function(){
        let input = 0.0999991;
        let res = amountDisplay(input);
        assert(res === "0.10", `Error ${res} returned for ${input}`);
    })

    it("should return string 1000", function(){
        let input = 999.999999;
        let res = amountDisplay(input);
        assert(res === "1000", `Error ${res} returned for ${input}`);
    })

    it("should return string -10", function(){
        let input = -10.00;
        let res = amountDisplay(input);
        assert(res === "-10", `Error ${res} returned for ${input}`);
    })

    it("should return string hello", function(){
        let input = "hello";
        let res = amountDisplay(input);
        assert(res === "hello", `Error ${res} returned for ${input}`);
    })

})