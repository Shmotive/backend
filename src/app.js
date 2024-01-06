var express = require('express');
var path = require('path');
var { graphqlHTTP } = require("express-graphql")
var { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLString, GraphQLScalarType } = require("graphql")
const { User, sequelize } = require('./models');

// https://semaphoreci.com/community/tutorials/dockerizing-a-node-js-web-application
sequelize.sync();

const UserType = new GraphQLObjectType({
  name: "User",
  description: "A User in our application",
  fields: () => ({
    uuid: { type: GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLNonNull(GraphQLString) },
    created_at: {type: (GraphQLString) }
  })
})

// The root provides a resolver function for each API endpoint
var rootQuery = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    // getRecommendationList: {},
    // getResults: {},
    hello_world: {
      type: GraphQLString,
      description: 'hello world',
      resolve: () => "hello world!!"
    },
    DEBUG_getUsers: { // TODO: remove this
      type: new GraphQLList(UserType),
      description: 'get users',
      resolve: () => User.findAll()
    }
  })
})

var rootMutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    createUser: {
      type: UserType,
      description: 'Add a user',
      args: {
        username: { type: GraphQLNonNull(GraphQLString) },
        uuid: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (_parent, args) => {
        const user = User.create({
          username: args.username,
          uuid: args.uuid,
        })
        return user
      }
    },
    // joinLobby: {},
    // createLobby: {
    //   type: GraphQLString
    // },
    // createSuggestion: {},
    // startLobby: {},
    // submitVote: {},

  })
})

var rootSubscription = new GraphQLObjectType({
  name: "Subscription",
  description: "Root Subscription",
  fields: () => ({
    // subscribeToLobby: {}, // shows users joining/leaving, suggestions
    // subscribeToRecommendations: {},
  })
})

// Construct a schema, using GraphQL schema language
var schema = new GraphQLSchema({
  query: rootQuery,
  mutation: rootMutation,
  // subscription: rootSubscription
})

var app = express();
// var expressWs = require('express-ws')(app);

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use(
  "/",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
)
console.log("Running server at http://localhost:3000")

module.exports = app;

