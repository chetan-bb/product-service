const util = require('../utils/util');


function getProductPrimaryImage(Product) {
    let noWatermark = false;
    let subUrl = null;
    let imageName = null;
    let citySlug = Product.City.slug;
    if(Product.ProductBundlePack){
        subUrl = `/bpi/${citySlug}`;
        imageName = getProductImageName(Product.ProductDescription, Product.ProductBundlePack.imageVersion,
                                        noWatermark, citySlug);
    }else {
        subUrl = `/p/`;
        imageName = getProductImageName(Product.ProductDescription, Product.ProductDescription.version,
                                        noWatermark, citySlug);
    }
    return {subUrl, imageName}
}

function getProductImageName(ProductDescription, version, noWaterMark) {
    // assuming that images will always come from s3

    let imageName = null;
    if(version !== 0){
        if(!noWaterMark){
            return `${ProductDescription.id}_${version}-${ProductDescription.ProductBrand.slug.toLowerCase()}-${ProductDescription.slug.toLowerCase()}.jpg`;
        }else {
            return `${generateRawImageFileName(ProductDescription.id)}_${version}`;
        }
    } // todo check, else client handle this
    return imageName;
}


function getProductSecondaryImages(ProductDescription, noWaterMark, ignoreShade, pdMeta) {
    let imageList = [];
    let pdImageMetaData = [];
    if(pdMeta){
        pdImageMetaData = JSON.parse(pdMeta.toString());
    }
    let brandSlug = ProductDescription.brandSlug.call(ProductDescription);

    Object.entries(pdImageMetaData).forEach(([num, imageData]) => {
        let version = imageData.version;
        let imageType = imageData.type;
        if(imageType === 's' && ignoreShade){
            return true;
        }
        let imagePath = `${ProductDescription.id}-${num}`;
        let pdSlug = ProductDescription.slug.toLowerCase();
        if(imageType.length > 0){
            imagePath = `${imageData}-${imageType}`;
        }
        if(version !== 0){
            if(noWaterMark){
                imagePath = `${generateRawImageFileName(imagePath)}_${version}-${brandSlug}-${pdSlug}.jpg`;
            }else {
                imagePath = `${imagePath}_${version}-${brandSlug}-${pdSlug}.jpg`;
            }
        } // no product image handled by client
        imageList.push(imagePath);
    });

    return imageList;
}



function generateRawImageFileName(baseFile) {
    baseFile = baseFile.toString();
    let splitBaseFile = baseFile.split('-');
    let productId = splitBaseFile[0];
    if (splitBaseFile.length === 1) {
        return util.encodeBase64(productId).replace("=", "")
    } else if (splitBaseFile.length === 2) {
        let ext = splitBaseFile[1];
        return util.encodeBase64(productId).replace("=", "") + '-' + ext;
    } else if (splitBaseFile.length === 3) {
        let ext = splitBaseFile[1] + '-' + splitBaseFile[2];
        return util.encodeBase64(productId).replace("=", "") + '-' + ext;
    }
}

module.exports = {
    getProductPrimaryImage,
    getProductSecondaryImages
};