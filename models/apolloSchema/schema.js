const { makeExecutableSchema } = require('graphql-tools');
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



// The GraphQL schema in string form
const typeDefs = `
  type Query { getProduct(id: Int!, visitorId: Int!, masterRi: Int!, cityId: Int!): Product }
  type Product {    id: String, 
                    mrp: String,
                    tag: Tag
               }
  type Tag {id: Int!}
`;

const getProductDataForPdId = require('../../assembler/productAssembler');

// The resolvers
const resolvers = {
    Query: {
        getProduct: (root, args, context) => {
            // console.log(args);
            return getDummyData(args);
            //console.log(result);
            //return { id: '12', mrp: '27', tag: {id:123} };
        }
    }
};


const sleep = require('util').promisify(setTimeout);
async function getDummyData(args) {
    // console.log("Slept for");
    let result = await getProductDataForPdId(args.id, args.masterRi, args.cityId, args.memberId, args.visitorId);

    // console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++'+ JSON.stringify(result));
    return result


}

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = schema;
