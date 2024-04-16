import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import http from 'http';
import express from 'express';
import typeDefs from './schema.js'
import resolvers from './resolvers.js';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { PrismaClient } from "@prisma/client"
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';

interface ServerContext {
    token?: string;
    prisma: PrismaClient
}
const schema = makeExecutableSchema({ typeDefs, resolvers });
const prisma = new PrismaClient();
const app = express();
const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
});

const wsServerCleanup = useServer({
    schema,
    context: async (ctx: any, msg, args) => {
        // TODO do some auth here
        // https://www.apollographql.com/docs/apollo-server/data/subscriptions#operation-context
        return {ctx, prisma, msg, args}
    },
}, wsServer);

const server = new ApolloServer<ServerContext>({
    typeDefs,
    resolvers,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await wsServerCleanup.dispose();
                    }
                }
            }
        }
    ],
});

await server.start();

app.use(
    '/graphql',
    cors({
        origin: "https://whatsthemotive.app"
    }),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req }) => ({
            token: 'placeholder',
            prisma,
        }),
    }),
);

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);
