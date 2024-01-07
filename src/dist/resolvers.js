const resolvers = {
    Query: {
        async DEBUG_users(_parent, _args, contextValue, _info) {
            return contextValue.prisma.user.findMany();
        },
    },
    Mutation: {
        async createUser() {
            return {};
        },
    },
};
export default resolvers;
