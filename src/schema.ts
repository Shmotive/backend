const typeDefs = `
  type User {
    uuid: String!
    username: String!
  }

  type Query {
    DEBUG_users: [User]
  }

  type Mutation {
    createUser(uuid: String!, username: String!): User!
    deleteUser(uuid: String!): User!
  }
`;

export default typeDefs