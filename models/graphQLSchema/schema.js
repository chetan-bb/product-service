let {
  // These are the basic GraphQL types need in this tutorial
  GraphQLString,
    GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  // This is used to create required fileds and arguments
  GraphQLNonNull,
  // This is the class we need to create the schema
  GraphQLSchema,
    graphql,
  GraphQLFloat,
  GraphQLBoolean,
} = require('graphql');

const ProductType = new GraphQLObjectType({
    name: "Product",
    description: "This represent an product",
    fields: () => ({
        // all primary fields
        id: {type: new GraphQLNonNull(GraphQLInt)},
        desc: {type: GraphQLString},
        mrp: {type: GraphQLFloat},
        sp: {type: GraphQLFloat},
        pack_desc: {type: GraphQLFloat},
        w: {type: GraphQLString},


        // object type fields
        images: {type: new GraphQLList(ImageType)},
        variable_weight:{type:VariableWeight},
        discount:{type:Discount},
        brand: {type: BrandType},
        category: {type: CategoryType},
        gift:{type:Gift},
        additional_attr:{type:AdditionalAttr},
        tabs: {type: new GraphQLList(TabType)},
        children:{type: new GraphQLList(ProductType)},
        tags:{type:new GraphQLList(Tag)},
        combo_info:{type: ComboInfo},
        sale_info:{type: SaleInfo},
        promo_info:{type: PromoInfo},
        store_availability:{type: new GraphQLList(Availability)}

    })
});

const Availability = new GraphQLObjectType({
    name: "Availability",
    description: "Product Availability data",
    fields: () => ({
        tab_type: {type: GraphQLString},
        pstat: {type: GraphQLString},
        availability_info_id: {type: GraphQLString},
        store_id: {type: GraphQLInt},
    })
});

const SaleInfo = new GraphQLObjectType({
    name: "SaleInfo",
    description: "Sale related data",
    fields: () => ({
        type: {type: GraphQLString},
        display_message: {type: GraphQLString},
        end_time: {type: GraphQLString},
        maximum_redem_per_order: {type: GraphQLInt},
        maximum_redem_per_member: {type: GraphQLInt},
        show_counter: {type: GraphQLBoolean},
        sale_message: {type: GraphQLString},
        offers_sale_msg: {type: GraphQLString}
    })
});


const PromoInfo = new GraphQLObjectType({
    name: "PromoInfo",
    description: "promo related data",
    fields: () => ({
        type: {type: GraphQLString},
        label: {type: GraphQLString},
        id: {type: GraphQLInt},
        name: {type: GraphQLString},
        saving: {type: GraphQLFloat},
        savings_display: {type: GraphQLString},
        desc: {type: GraphQLString},
        url: {type: GraphQLString}
    })
});



const ComboInfo = new GraphQLObjectType({
    name: "ComboInfo",
    description: "Combo related data",
    fields: () => ({
        destination: {type: GraphQLString},
        total_saving_msg: {type: Destination},
        items: {type: new GraphQLList(Item)},
        total_sp: {type:GraphQLFloat},
        total_mrp: {type:GraphQLFloat},
        annotation_msg: {type:GraphQLString}
    })
});


const Item = new GraphQLObjectType({
    name: "ProductItem",
    description: "Combo product item",
    fields: () => ({
        id: {type: GraphQLInt},
        brand: {type: GraphQLString},
        sp: {type: GraphQLFloat},
        mrp: {type:GraphQLFloat},
        delivery_pref:{type:GraphQLString},
        saving_msg:{type:GraphQLString},
        qty:{type:GraphQLInt},
        wgt:{type:GraphQLString},
        p_desc:{type:GraphQLString}
    })
});



const Destination = new GraphQLObjectType({
    name: "Destination",
    description: "Destination type slug and name",
    fields: () => ({
        display_name:{type:GraphQLString},
        dest_type: {type: GraphQLString},
        dest_slug: {type: GraphQLString},
        url: {type: GraphQLString},
    })
});

const Tag = new GraphQLObjectType({
    name: "Tag",
    description: "tag info",
    fields: () => ({
        header: {type: GraphQLString},
        values: {type: new GraphQLList(Destination)}
    })
});

const TagValue = new GraphQLObjectType({
    name: "TagValue",
    description: "tag value",
    fields: () => ({
        header: {type: GraphQLString},
        values: {type: new GraphQLList(TagValueData)},
        type:{type:GraphQLInt}
    })
});

const TagValueData = new GraphQLObjectType({
    name: "TagValueData",
    description: "tag value data",
    fields: () => ({
        // todo handle "Veg here"
        dest_type: {type: GraphQLString},
        dest_slug: {type: GraphQLString},
        url: {type: GraphQLString}
    })
});


const AdditionalAttr = new GraphQLObjectType({
    name: "AdditionalAttr",
    description: "cosmetic image and other info",
    fields: () => ({
        info: {type: new GraphQLList(Info)}
    })
});

const Info = new GraphQLObjectType({
    name: "Info",
    description: "cosmetic info",
    fields: () => ({
        type: {type: GraphQLString},
        image:{type:GraphQLString},
        sub_type:{type:GraphQLString},
        label:{type:GraphQLString}
    })
});


const Gift = new GraphQLObjectType({
    name: "Gift",
    description: "Gift message",
    fields: () => ({
        msg: {type: GraphQLString}
    })
});


const Discount = new GraphQLObjectType({
    name: "Discount",
    description: "Discount for a product",
    fields: () => ({
        type: {type: GraphQLString},
        amount: {type: GraphQLFloat},
    })
});

const VariableWeight = new GraphQLObjectType({
    name: "VariableWeight",
    description: "VariableWeight for a product mostly for f&v and meat",
    fields: () => ({
        msg: {type: GraphQLString},
        link: {type: GraphQLString},
    })
});

const ImageType = new GraphQLObjectType({
    name: "Image",
    description: "Images urls",
    fields: () => ({
        s: {type: GraphQLString},
        l: {type: GraphQLString},
        ml: {type: GraphQLString},
    })
});

const BrandType = new GraphQLObjectType({
    name: "Brand",
    description: "Brand info related to product",
    fields: () => ({
        name: {type: GraphQLString},
        slug: {type: GraphQLString},
        url: {type: GraphQLString}
    })
});

const CategoryType = new GraphQLObjectType({
    name: "Category",
    description: "Category info related to product",
    fields: () => ({
        tlc_name: {type: GraphQLString},
        tlc_slug: {type: GraphQLString},
    })
});


const TabType = new GraphQLObjectType({
    name: "Tabs",
    description: "additional info for product",
    fields: () => ({
        title: {type: GraphQLString},
        content: {type: GraphQLString}
    })
});


module.exports = ProductType;