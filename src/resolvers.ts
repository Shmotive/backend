import { LobbyState, RecommendationCategory } from "@prisma/client";
import dateScalar from './customScalars.js'
import LobbyHelper from './resolvers/lobby_helpers.js'
import { withFilter } from "graphql-subscriptions";
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const resolvers = {
    DateTime: dateScalar,

    Query: {
        async DEBUG_users(_parent: any, _args: {}, context: any, _info: any) {
            return await context.prisma.User.findMany({
                include: {
                    owned_lobbies: true,
                    joined_lobbies: true,
                }
            });
        },

        async DEBUG_getUser(_parent: any, args: { uuid: String }, context: any, _info: any) {
            return await context.prisma.User.findUnique({
                where: {
                    uuid: args.uuid
                },
                include: {
                    owned_lobbies: true,
                    joined_lobbies: true,
                }
            })
        },

        async DEBUG_triggerSubscription() {
            pubsub.publish('TEST', {
                data: 123
            })
            return true;
        },

        async getLiveLobby(_parent: any, args: { lobby_code: String }, context: any, _info: any) {
            return await context.prisma.lobby.findFirst({
                where: {
                    lobby_code: args.lobby_code,
                    NOT: { state: LobbyState.DONE }
                },
                include: {
                    owner: true,
                    participants: true,
                    votes: true,
                    recommendations: true,
                    skips: true
                }
            })
        }
    },

    Mutation: {
        async createUser(_parent: any, args: { uuid: String, username: String }, context: any) {
            return await context.prisma.User.create({
                data: {
                    uuid: args.uuid,
                    username: args.username
                }
            });
        },

        async deleteUser(_parent: any, args: { uuid: String }, context: any) {
            return await context.prisma.User.delete({
                where: { uuid: args.uuid }
            });
        },

        async createLobby(_parent: any, args: { uuid: String }, context: any) {
            let unique = false;
            let code;
            while (!unique) {
                code = Math.floor(100000 + Math.random() * 900000);
                let lobby = await context.prisma.Lobby.findMany({
                    where: {
                        lobby_code: code + '',
                        NOT: { state: LobbyState.DONE }
                    }
                })
                unique = lobby.length == 0
            }

            let updateUser = await context.prisma.User.update({
                where: { uuid: args.uuid },
                data: {
                    owned_lobbies: {
                        create: {
                            lobby_code: code + '',
                            state: LobbyState.WAITING_FOR_PLAYERS
                        }
                    }
                }
            })

            return await context.prisma.lobby.findFirstOrThrow({
                where: {
                    lobby_code: code + '',
                    state: LobbyState.WAITING_FOR_PLAYERS,
                }
            })
        },

        async joinLobby(_parent: any, args: { uuid: String, lobby_code: String }, context: any) {
            var tx_result = await context.prisma.$transaction(async (tx: any) => {
                var lobby = await tx.lobby.findFirstOrThrow({
                    where: {
                        lobby_code: args.lobby_code,
                        state: { in: [LobbyState.WAITING_FOR_PLAYERS, LobbyState.READY_TO_START] }
                    }
                })

                let updateUser = await tx.user.update({
                    where: { uuid: args.uuid },
                    data: {
                        joined_lobbies: { connect: { id: lobby.id } }
                    }
                })

                if (lobby.state == LobbyState.READY_TO_START) {
                    lobby = tx.lobby.update({
                        where: { id: lobby.id},
                        data: {
                            state: LobbyState.WAITING_FOR_PLAYERS
                        }
                    })
                }

                pubsub.publish(`${args.lobby_code}`, {})
                return lobby
            })

            return tx_result;
        },

        async DEBUG_resetLobbies(_parent: any, args: {}, context: any) {
            return (await context.prisma.lobby.deleteMany({}))?.count;
        },

        async skipSuggestion(_parent: any, args: { uuid: String, lobby_code: String }, context: any) {
            // Validate that lobby exists and is in correct state (WAITING_FOR_PLAYERS)
            var lobby = await context.prisma.lobby.findFirstOrThrow({
                where: {
                    lobby_code: args.lobby_code,
                    state: LobbyState.WAITING_FOR_PLAYERS
                },
                include: {
                    _count: { select: { participants: true } },
                    participants: true
                }
            })

            // Begin transaction
            var tx_result = await context.prisma.$transaction(async (tx: any) => {
                // Create SkipRecommendation if not exists 
                var skip = await tx.SkipRecommendation.upsert({
                    where: {
                        id: { lobby_id: lobby.id, uuid: args.uuid }
                    },
                    update: {},
                    create: {
                        user: { connect: { uuid: args.uuid } },
                        lobby: { connect: { id: lobby.id } },
                    }
                })

                // Check if we can start the lobby
                var readyToStart = await LobbyHelper.allUsersReady(tx, lobby.id, lobby._count.participants + 1)
                if (readyToStart) {
                    console.log(`Lobby ${args.lobby_code}: ready to start voting`)
                    await tx.lobby.update({
                        where: { id: lobby.id },
                        data: { state: LobbyState.READY_TO_START }
                    })
                }
                pubsub.publish(`${args.lobby_code}`, {})
                return skip;
            })

            return tx_result;
        },

        async addSuggestion(_parent: any, args: { uuid: String, lobby_code: String, name: String }, context: any) {
            // Validate that lobby exists and is in correct state (WAITING_FOR_PLAYERS)
            var lobby = await context.prisma.lobby.findFirstOrThrow({
                where: {
                    lobby_code: args.lobby_code,
                    state: { in: [LobbyState.WAITING_FOR_PLAYERS, LobbyState.READY_TO_START] }
                },
                include: {
                    _count: { select: { participants: true } },
                    participants: true
                }
            })

            // Begin transaction
            var tx_result = await context.prisma.$transaction(async (tx: any) => {
                // Check if suggestion was already made.
                var suggestion = await tx.Recommendation.findFirst({
                    where: {
                        name: args.name,
                        category: RecommendationCategory.CUSTOM,
                        lobby_id: lobby.id
                    }
                })
                // If so, submit as a SkipRecommendation. Otherwise, create the suggestion.
                if (suggestion) {
                    var skip = await tx.SkipRecommendation.upsert({
                        where: {
                            id: { lobby_id: lobby.id, uuid: args.uuid }
                        },
                        update: {},
                        create: {
                            user: { connect: { uuid: args.uuid } },
                            lobby: { connect: { id: lobby.id } },
                        }
                    })
                } else {
                    suggestion = await tx.Recommendation.create({
                        data: {
                            name: args.name,
                            category: RecommendationCategory.CUSTOM,
                            suggested_by: { connect: { uuid: args.uuid } },
                            lobby: { connect: { id: lobby.id } }
                        }
                    })
                }

                // Check if we can start the lobby
                var readyToStart = await LobbyHelper.allUsersReady(
                    tx,
                    lobby.id,
                    lobby._count.participants + 1
                )
                if (readyToStart) {
                    console.log(`Lobby ${args.lobby_code}: ready to start voting`)
                    await tx.lobby.update({
                        where: { id: lobby.id },
                        data: { state: LobbyState.READY_TO_START }
                    })
                }
                pubsub.publish(`${args.lobby_code}`, {})
                return suggestion;
            })

            return tx_result;
        },

        async startLobby(_parent: any, args: { lobby_code: String }, context: any) {
            var lobby = await context.prisma.lobby.findFirstOrThrow({
                where: {
                    lobby_code: args.lobby_code,
                    state: { in: [LobbyState.WAITING_FOR_PLAYERS, LobbyState.READY_TO_START] }
                }
            })

            var updateLobby = await context.prisma.lobby.update({
                where: { id: lobby.id },
                data: { state: LobbyState.VOTING }
            })
            pubsub.publish(`${args.lobby_code}`, {})

            return updateLobby
        },

        async submitVote(_parent: any, args: { uuid: String, lobby_code: String, recommendation_id: String, vote: Boolean }, context: any) {
            var lobby = await context.prisma.lobby.findFirstOrThrow({
                where: {
                    lobby_code: args.lobby_code,
                    state: LobbyState.VOTING
                }
            })

            var tx_result = await context.prisma.$transaction(async (tx: any) => {
                var upsertVote = await tx.vote.upsert({
                    where: {
                        id: { user_uuid: args.uuid, lobby_id: lobby.id, recommendation_id: args.recommendation_id }
                    },
                    update: { yes_vote: args.vote },
                    create: {
                        user: { connect: { uuid: args.uuid } },
                        lobby: { connect: { id: lobby.id } },
                        recommendation: { connect: { id: args.recommendation_id } },
                        yes_vote: args.vote
                    },
                    include: {
                        recommendation: true
                    }
                })

                var votingComplete = await LobbyHelper.allUsersDoneVoting(tx, lobby.id)
                if (votingComplete) {
                    console.log(`Lobby ${args.lobby_code}: has completed voting`)
                    tx.lobby.update({
                        where: { lobby_id: lobby.id },
                        data: { state: LobbyState.RESULTS }
                    })
                }
                pubsub.publish(`${args.lobby_code}`, {})
                return upsertVote
            })
            return tx_result
        }
    },

    Subscription: {
        DEBUG_subscription_test: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(['TEST']),
                (payload: any, variables: any) => {
                    return true;
                }
            ),
            resolve: (payload: any) => payload.data
        },
        subscribeToLobby: {
            subscribe: (_parent: any, args: { lobby_code: String, uuid: String }, context: any) => {
                console.log(`user ${args.uuid} is listening to lobby ${args.lobby_code}`)
                return pubsub.asyncIterator([`${args.lobby_code}`])
            },
            resolve: async (payload: any, args: { lobby_code: String, uuid: String }, context: any) => {
                console.log(`lobby ${args.lobby_code} has been updated`)
                return await context.prisma.lobby.findFirst({
                    where: {
                        lobby_code: args.lobby_code,
                    },
                    include: {
                        owner: true,
                        participants: true,
                        votes: true,
                        recommendations: true,
                        skips: true
                    }
                })
            }
        }

    }
};


export default resolvers