import { LobbyState } from "@prisma/client";
import dateScalar from './customScalars.js'

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
                where: {
                    uuid: args.uuid
                }
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
                        NOT: {
                            state: LobbyState.DONE
                        }

                    }
                })
                unique = lobby.length == 0
            }


            let lobby = await context.prisma.Lobby.create({
                data: {
                    lobby_code: code + '',
                    state: LobbyState.CREATING_LOBBY,
                    owner: {
                        connect: { uuid: args.uuid }
                    }
                }
            });

            console.log(lobby)

            let updateUser = await context.prisma.User.update({
                where: { uuid: args.uuid },
                data: {
                    owned_lobbies: {
                        connect: { id: lobby.id }
                    }
                }
            })

            return lobby



        },
        async joinLobby(_parent: any, args: { uuid: String, lobby_code: String }, context: any) {
            var lobby = await context.prisma.lobby.findFirstOrThrow({
                where: {
                    lobby_code: args.lobby_code,
                    OR: [
                        { state: LobbyState.WAITING_FOR_PLAYERS },
                        { state: LobbyState.CREATING_LOBBY },

                    ]
                }
            })

            let updateUser = await context.prisma.user.update({
                where: {
                    uuid: args.uuid
                },
                data: {
                    joined_lobbies: {
                        connect: { id: lobby.id }
                    }
                }
            })

            return lobby;
        },
        async DEBUG_resetLobbies(_parent: any, args: {}, context: any) {
            return (await context.prisma.lobby.deleteMany({}))?.count;
        }
    },
};


export default resolvers