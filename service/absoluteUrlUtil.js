
function getProductAbsoluteUrl(productDescription) {
    let absoluteUrl = "";
    let brandSlug = "";
    let slug = "";
    let weight = "";
    if(productDescription.ProductBrand){
        brandSlug = productDescription.ProductBrand.slug;
    }
    slug = productDescription.slug;
    weight = productDescription.weight;
    absoluteUrl =`/pd/${productDescription.id}/${brandSlug}-${slug}-${weight}/`;
    if (productDescription.packType){
        absoluteUrl = `/pd/${productDescription.id}/${brandSlug}-${slug}-${weight}-${productDescription.packType}/`;
    }
    return absoluteUrl;
}

module.exports = {getProductAbsoluteUrl};