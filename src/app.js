var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { graphqlHTTP } = require("express-graphql")
var { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLString } = require("graphql")
const { User, sequelize } = require('./models');



// https://semaphoreci.com/community/tutorials/dockerizing-a-node-js-web-application



const UserType = new GraphQLObjectType({
  name: "User",
  description: "A User in our application",
  fields: () => ({
      uuid: { type: GraphQLNonNull(GraphQLString) },
      username: { type: GraphQLNonNull(GraphQLString) },
  })
})

// The root provides a resolver function for each API endpoint
var rootQuery = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      description: 'List of users',
      resolve: () => User.findAll()
    },
    hello: {
      type: GraphQLString,
      description: 'hello world',
      resolve: () => "hello world!!"
    }
  })
})

// Construct a schema, using GraphQL schema language
var schema = new GraphQLSchema({
  query: rootQuery,
})


var app = express();

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

