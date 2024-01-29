import { generatedTypes } from './schema_typedefs.js'

const resolverString = `
  scalar DateTime

  type Query {
    DEBUG_users: [User]
    DEBUG_getUser(uuid: String!): User!
    DEBUG_triggerSubscription: Boolean
    getLiveLobby(lobby_code: String!): Lobby!
  }

  type Mutation {
    createUser(uuid: String!, username: String!): User!
    deleteUser(uuid: String!): User!
    createLobby(uuid: String!): Lobby!
    joinLobby(uuid: String!, lobby_code: String!): Lobby!
    DEBUG_resetLobbies: Int
    addSuggestion(uuid: String!, lobby_code: String!, name: String!): Recommendation
    skipSuggestion(uuid: String!, lobby_code: String!): SkipRecommendation
    startLobby(lobby_code: String!): Lobby!
    submitVote(uuid: String!, lobby_code: String!, recommendation_id: String!, vote: Boolean!): Vote
  }

  type Subscription {
    DEBUG_subscription_test: Int
    subscribeToLobby(lobby_code: String!, uuid: String!): Lobby!
  }
`;


export default resolverString + generatedTypes

