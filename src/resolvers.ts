const resolvers = {
    Query: {
        async DEBUG_users(_parent: any, _args: {}, context: any, _info: any) {
            return context.prisma.user.findMany();

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
            return context.prisma.user.delete({
                where: {
                    uuid: args.uuid
                }
            })
        },
    },
};

export default resolvers