const util = require('../utils/util');


function getProductPrimaryImage(Product, noWatermark = false) {
    if (!Product || !Product.City) {
        return null;
    }
    let imageSubPathImageName = {};
    let citySlug = Product.City.slug;
    if (Product.ProductBundlePack) {
        imageSubPathImageName = getProductImageName(Product.ProductDescription, Product.ProductBundlePack.imageVersion,
            noWatermark);
        imageSubPathImageName['subUrl'] = `/bpi/${citySlug}`;
    } else {
        imageSubPathImageName = getProductImageName(Product.ProductDescription, Product.ProductDescription.version,
            noWatermark);
    }
    return imageSubPathImageName;
}

function getProductImageName(ProductDescription, version, noWaterMark) {
    // assuming that images will always come from s3

    let imageName = {};
    if (version !== 0) {
        if (!noWaterMark) {
            return {
                subUrl: '/p/',
                imageName: `${ProductDescription.id}_${version}-${ProductDescription.ProductBrand.slug.toLowerCase()}-${ProductDescription.slug.toLowerCase()}.jpg`
            };
        } else {
            return {subUrl: '/pnw/', imageName: `${generateRawImageFileName(ProductDescription.id)}_${version}.jpg`};
        }
    }
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
            imagePath = `${imagePath}-${imageType}`;
        }
        if(version !== 0){
            let imagePathAndName = {};
            if(noWaterMark){
                imagePathAndName = {subUrl: '/pnw/', imageName:`${generateRawImageFileName(imagePath)}_${version}-${brandSlug}-${pdSlug}.jpg`};
            }else {
                imagePathAndName = {subUrl: '/p/', imageName:`${imagePath}_${version}-${brandSlug}-${pdSlug}.jpg`};
            }
            imageList.push(imagePathAndName);
        } // no product image handled by client
    });

    return imageList;
}



function generateRawImageFileName(baseFile) {
    baseFile = baseFile.toString();
    let splitBaseFile = baseFile.split('-');
    let productId = splitBaseFile[0];
    if (splitBaseFile.length === 1) {
        return util.encodeBase64(productId).replace(/=/g, "")
    } else if (splitBaseFile.length === 2) {
        let ext = splitBaseFile[1];
        console.log(productId, ext);
        return util.encodeBase64(productId).replace(/=/g, "") + '-' + ext;
    } else if (splitBaseFile.length === 3) {
        let ext = splitBaseFile[1] + '-' + splitBaseFile[2];
        return util.encodeBase64(productId).replace(/=/g, "") + '-' + ext;
    }
}

module.exports = {
    getProductPrimaryImage,
    getProductSecondaryImages
};