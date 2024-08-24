import { PrismaClient, RecommendationCategory } from "@prisma/client";
import createRecommendations from "../google/nearbySearch.js";
import geolib from "geolib";

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

    generateRecommendations: async (prisma: PrismaClient, lobby_id: number, latitude: number, longitude: number, postal_code: string | null) => {
        // trigger the process to make the nearbysearch requests to google, then create the recs
        if (!postal_code) {
            try {
                console.log(`null postal code:${postal_code}, creating recommendations...`);
                let recommendations;
                
                let res: any = await createRecommendations(prisma, lobby_id, latitude, longitude);
                console.log("create recommendations response(no lobby postal code):", res);
        
                // Fetch and return the generated recommendations associated with the given lobby
                recommendations = await prisma.recommendation.findMany({
                    where: {
                        generated_lobby_relation: {
                            some: { id: lobby_id }
                        }
                    },
                    select: { id: true }
                });
        
                return recommendations;
                
            } catch (err) {
                console.error("Error creating recommendations:", err);
                throw err;
            }
        }
        console.log("Postal code exists. Filtering recommendations based on postal code and location radius.");
    
        // filter existing recommendations by the first 3 characters of lobby's postal code -- cuts down search field

        const recommendationsWithMatchingPostalCode = await prisma.recommendation.findMany({
            where: {
                postal_code: {
                    startsWith: postal_code.substring(0, 3),
                },
            },
        });

        // check to see if those recommendations satisfy being in a 1km radius of lobby location

        const recommendationsWithinRadius = recommendationsWithMatchingPostalCode.filter(recommendation => {
            return recommendation.latitude !== null && recommendation.longitude !== null && 
                   geolib.isPointWithinRadius(
                       {
                           latitude: recommendation.latitude, 
                           longitude: recommendation.longitude
                       },
                       {
                           latitude: latitude, 
                           longitude: longitude
                       }, 
                       1000
                   );
        });
    
        // if there are enough satisfying recommendations, use those; if not, generate new ones (while making sure there are no duplicates being added)

        if (recommendationsWithinRadius.length >= 5) {
            console.log("Found sufficient recommendations within radius. Using these recommendations.");
            return recommendationsWithinRadius;
        } else {
            console.log("Not enough recommendations within radius. Generating new recommendations...");
            try {
                // Trigger the process to make the nearby search requests to Google, then create the recommendations
                let res: any = await createRecommendations(prisma, lobby_id, latitude, longitude);
                console.log("createRecommendations response (postal code):", res);
        
                // Fetch and return the generated recommendations associated with the given lobby
                const recommendations = await prisma.recommendation.findMany({
                    where: {
                        generated_lobby_relation: {
                            some: { id: lobby_id }
                        }
                    },
                    select: { id: true }
                });
        
                return recommendations;
        
            } catch (err) {
                console.error("Error creating recommendations:", err);
                throw err;
            }
        }
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