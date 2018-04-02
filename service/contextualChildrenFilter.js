
function filterChildren(productList, contextualChildrenIds, parentProduct) {
    // If contextualChildren list is empty then no children is valid
    // All children will be completely removed
    let filteredChildrenList = []
    if(!contextualChildrenIds){
        return filteredChildrenList;
    }

    if(productList.length < 1 || contextualChildrenIds.length < 1){
        return filteredChildrenList; 
    }
    productList.filter(
        el=>{
            if(el){
                if(contextualChildrenIds.indexOf(el.Product.id) >=0
                    && el.Product.id != parentProduct.id){
                    filteredChildrenList.push(el);
                }
            }
        }
    );
    return filteredChildrenList;
}

module.exports = {filterChildren};