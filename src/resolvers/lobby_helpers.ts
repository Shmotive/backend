import { PrismaClient } from "@prisma/client";

export default {
    allUsersReady: async (prisma: PrismaClient, lobby_id: number, num_users: number) => {
        // check that all players have added a suggestion
        var numUserRecommendations = await prisma.recommendation.findMany({
            distinct: ['suggested_by_uuid', 'lobby_id'],
            where: { lobby_id: lobby_id },
        })

        var numUserSkips = await prisma.skipRecommendation.findMany({
            distinct: ['uuid', 'lobby_id'],
            where: { lobby_id: lobby_id },
        })

        // console.log(`recs: ${JSON.stringify(numUserRecommendations, null, 2)},\n skips: ${JSON.stringify(numUserSkips, null, 2)}`)
        // console.log(`lobby: ${JSON.stringify(lobby, null, 2)}`)
        var numUniqueVotes = numUserRecommendations.length + numUserSkips.length
        // console.log(`numUniqueVotes: ${numUniqueVotes}`)
        return numUniqueVotes >= num_users
    },

    allUsersDoneVoting: async (prisma: PrismaClient, lobby_id: number) => {
        // todo
        return false;
    }
}