const {
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
const getProductDataForPdId = require('../../assembler/productAssembler');
const ProductType = require('./schema');




// This is the Root Query
const QueryType = new GraphQLObjectType({
    name: 'ProductQuery',
    description: "Product Application Schema Root",
    fields: () => ({
        product: {
            type: ProductType,
            description: "Response data for PD",
            args: {
                id: {type: GraphQLNonNull(GraphQLInt) }
            },
            // The result of the previous resolver call
            resolve:async (product, args, context, info)=> { //esolve: (root, {productDescId, masterRi, ...}) => {
                let ctx = context.context;
                //console.log(context);

                return await getProductDataForPdId(args.id, ctx.masterRi, ctx.cityId, ctx.memberId, ctx.visitorId);
            }
        }
    })
});

// This is the schema declaration
const ProductAppSchema = new GraphQLSchema({
  query: QueryType
});

module.exports = ProductAppSchema;


