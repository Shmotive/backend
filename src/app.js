var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { graphqlHTTP } = require("express-graphql")
var { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLString } = require("graphql")
const { User, sequelize } = require('./models');



var indexRouter = require('./routes/index');
var errorHandler = require('errorhandler')

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

app.use('/', indexRouter);

app.use(errorHandler({ dumpExceptions: true, showStack: true })); 
process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
)
console.log("Running server at http://localhost:3000")

module.exports = app;

