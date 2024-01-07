import { LobbyState } from "@prisma/client";
import dateScalar from './customScalars.js'

const resolvers = {
    DateTime: dateScalar,
    
    Query: {
        async DEBUG_users(_parent: any, _args: {}, context: any, _info: any) {
            return context.prisma.User.findMany();
        },
    },

    Mutation: {
        async createUser(_parent: any, args: { uuid: String, username: String }, context: any) {
            return context.prisma.User.create({
                data: {
                    uuid: args.uuid,
                    username: args.username
                }
            })
        },
        async deleteUser(_parent: any, args: { uuid: String }, context: any) {
            return context.prisma.User.delete({
                where: {
                    uuid: args.uuid
                }
            })
        },
        async createLobby(_parent: any, args: { uuid: String }, context: any) {
            var unique = false;
            let code;
            while (!unique) {
                code = Math.floor(100000 + Math.random() * 900000);
                unique = context.prisma.Lobby.findMany({
                    where: {
                        AND: [
                            { lobby_code: code },
                            {
                                NOT: {
                                    state: LobbyState.DONE
                                }
                            }

                        ]
                    }
                }).length == 0
            }

            return context.prisma.Lobby.create({
                data: {
                    lobby_code: code + '',
                    state: LobbyState.CREATING_LOBBY,
                    owner_uuid: args.uuid,
                }
            })

        }
    },
};


export default resolvers