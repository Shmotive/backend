export const generatedTypes = `type User {
  uuid: String
  username: String
  lobby: Lobby
  votes: [Vote]
  created_at: DateTime
  updated_at: DateTime
}

type Lobby {
  id: Int
  lobby_code: String
  state: LobbyState
  owner: User
  owner_uuid: String
  votes: [Vote]
  created_at: DateTime
  updated_at: DateTime
}

type Recommendation {
  id: String
  name: String
  category: RecommendationCategory
  price_range_low: Float
  price_range_high: Float
}

type Vote {
  id: String
  user: User
  user_uuid: String
  lobby: Lobby
  lobby_id: Int
}


enum LobbyState {
  CREATING_LOBBY
  WAITING_FOR_PLAYERS
  VOTING
  RESULTS
  DONE
}

enum RecommendationCategory {
  DINING
  ACTIVITY
  EVENT
  CUSTOM
}
`