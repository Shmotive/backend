export const generatedTypes = `type User {
  uuid: String
  username: String
  owned_lobbies: [Lobby]
  joined_lobbies: [Lobby]
  lobby_recommendations: [Recommendation]
  skipped_recommendations: [SkipRecommendation]
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
  participants: [User]
  votes: [Vote]
  recommendations: [Recommendation]
  skips: [SkipRecommendation]
  created_at: DateTime
  updated_at: DateTime
}

type Recommendation {
  id: String
  name: String
  category: RecommendationCategory
  price_range_low: Float
  price_range_high: Float
  suggested_by: User
  suggested_by_uuid: String
  lobby: Lobby
  lobby_id: Int
  votes: [Vote]
}

type SkipRecommendation {
  lobby: Lobby
  lobby_id: Int
  user: User
  uuid: String
}

type Vote {
  id: String
  user: User
  user_uuid: String
  lobby: Lobby
  lobby_id: Int
  yes_vote: Boolean
  recommendation: Recommendation
  recommendation_id: String
}


enum LobbyState {
  WAITING_FOR_PLAYERS
  READY_TO_START
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