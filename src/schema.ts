import { generatedTypes } from './schema_typedefs.js'

const resolverString = `
  scalar DateTime

  type Query {
    DEBUG_users: [User]
  }

  type Mutation {
    createUser(uuid: String!, username: String!): User!
    deleteUser(uuid: String!): User!
    createLobby(uuid: String!): Lobby!
    joinLobby(uuid: String!, lobby_id: String!): Lobby!
  }
`;


export default resolverString + generatedTypes

// getRecommendationList: {},
// getResults: {},

// createSuggestion: {},
// startLobby: {},
// submitVote: {},

// subscribeToLobby: {}, // shows users joining/leaving, suggestions
// subscribeToRecommendations: {},

