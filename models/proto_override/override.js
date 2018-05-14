let ProductDescription = {}
let Product = {}

ProductDescription.brandSlug = function (productDescription) {
    if(productDescription.ProductBrand){
        return productDescription.ProductBrand.slug;
    }
    return ''
};


Product.topCategoryName = function (product) {
    if(product.ProductDescription.TopCategory){
        return product.ProductDescription.TopCategory.name
    }
};

Product.topCategorySlug = function (product) {
    if(product.ProductDescription.TopCategory){
        return product.ProductDescription.TopCategory.slug
    }
};

Product.brandName = function (product) {
    if(product.ProductDescription.ProductBrand){
        return product.ProductDescription.ProductBrand.name
    }

    return ''
};

Product.brandSlug = function (product) {
    if(product.ProductDescription.ProductBrand){
        return product.ProductDescription.ProductBrand.slug
    }

    return ''
};

Product.description = function (product) {
    if(product.ProductBundlePack){
        return product.ProductBundlePack.description;
    }else if (product.overrideDescription){
        return product.overrideDescription;
    }else if(product.ProductDescription){
        return product.ProductDescription.description;
    }else {
        return '';
    }
};

Product.short_description = function (product) {
    if(product.ProductDescription){
        return product.ProductDescription.short_description;
    }else {
        return '';
    }
};

Product.multipackDescription = function (product) {
    if(product.ProductBundlePack){
        return product.ProductBundlePack.multiPackDescription;
    }else if(product.ProductDescription){
        return product.ProductDescription.multiPackDescription;
    }
};

Product.PackType = function (product) {
    if(product.ProductBundlePack){
        return product.ProductBundlePack.packType;
    }else if(product.ProductDescription){
        return product.ProductDescription.packType;
    }
};

Product.weight = function (product) {
    if(product.ProductBundlePack && product.ProductBundlePack.weight){
        return product.ProductBundlePack.weight;
    }else if(product.ProductDescription && product.ProductDescription.weight){
        return product.ProductDescription.weight;
    }else {
        return ''
    }
};

Product.additionalInfoOne = function (product) {
    if(product.ProductBundlePack){
        return product.ProductBundlePack.additionalInfoOne;
    }else if(product.ProductDescription){
        return product.ProductDescription.additionalInfoOne;
    }
};

Product.additionalInfoTwo = function (product) {
    if(product.ProductBundlePack){
        return product.ProductBundlePack.additionalInfoTwo;
    }else if(product.ProductDescription){
        return product.ProductDescription.additionalInfoTwo;
    }
};

Product.additionalInfoThree = function (product) {
    if(product.ProductBundlePack){
        return product.ProductBundlePack.additionalInfoThree;
    }else if(product.ProductDescription){
        return product.ProductDescription.additionalInfoThree;
    }
};

module.exports = {Product, ProductDescription}