import { PrismaClient, RecommendationCategory } from "@prisma/client";

export default {
    allUsersReady: async (prisma: PrismaClient, lobby_id: number, num_users: number) => {
        // check that all players have added a suggestion
        var numUserRecommendations = await prisma.recommendation.findMany({
            distinct: ['suggested_by_uuid', 'custom_lobby_id'],
            where: { custom_lobby_id: lobby_id },
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
        var lobby = await prisma.lobby.findUniqueOrThrow({
            where: { id: lobby_id },
            include: {
                _count: { select: { participants: true, custom_recommendations: true, generated_recommendations: true, votes: true } },
            }
        })
        const numRecs = lobby._count.generated_recommendations + lobby._count.custom_recommendations
        const numParticipants = lobby._count.participants
        const numVotes = lobby._count.votes
        return numVotes >= (numParticipants + 1) * numRecs;
    },

    generateRecommendations: async (prisma: PrismaClient, lobby_id: number) => {
        return await prisma.recommendation.findMany({
            where: {
                NOT: { category: RecommendationCategory.CUSTOM }
            },
            select: { id: true }
        })


    },

    calculateLobbyPicks: async (prisma: PrismaClient, lobby_id: number) => {
        var picks = await prisma.vote.groupBy({
            by: ['recommendation_id'],
            where: {
                lobby_id: lobby_id,
                yes_vote: true,
            },
            orderBy: {
                _count: {
                    recommendation_id: 'desc'
                }
            }
        })

        return picks.map(pick => ({id: pick.recommendation_id}))
    }


}