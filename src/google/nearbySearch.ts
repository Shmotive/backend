/// <reference types="@types/google.maps" />
import categories from "./categories.js";
import { PrismaClient } from '@prisma/client';
import { RecommendationCategory } from "@prisma/client";
import fetch from "node-fetch";
  
function determineCategory(primaryType: string | null, types: string[]): 'DINING' | 'ACTIVITY' {
    if (primaryType) {
        if (categories.activityTypes.has(primaryType)) {
            return 'ACTIVITY';
        }
        if (categories.diningTypes.has(primaryType)) return 'DINING';
    }
    for (const type of types) {
        if (categories.activityTypes.has(type)) {
            return 'ACTIVITY';
        }
    }
    return 'DINING';
};

async function searchNearby(lobby_id: number, latitude: number, longitude: number): Promise<Array<any>> {
    const apiKey = process.env.GOOGLE_KEY;
    let places;
    const url = `https://places.googleapis.com/v1/places:searchNearby?key=${apiKey}`;

    const requestBody = {
        "excludedTypes": categories.requestTypes,
        "maxResultCount": 10,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "radius": 1000.0
            }
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "places.displayName,places.types,places.id,places.addressComponents,places.location,places.primaryType"
            } as HeadersInit,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`);
        }

        const data:any = await response.json();
        console.log(data);
        places = data.places;

        // process request
        if (places.length) {
            const placesObject = places.map((place: any) => ({
                name: place.displayName.text,
                category: determineCategory(place.primaryType, place.types) === 'DINING' ? RecommendationCategory.DINING : RecommendationCategory.ACTIVITY,
                id: place.id,
                postal_code: place.addressComponents?.filter((comp: any) => {return comp.types.includes("postal_code")})[0]?.longText || null,
                latitude: place.location.latitude,
                longitude: place.location.longitude,
            }))
            return placesObject;
        } else {
            throw new Error("Error: Empty response from nearbysearch request.")
        }

    } catch (error) {
        console.error('Error fetching nearby places:', error);
        throw error;
    }

};

export default async function createRecommendations(prisma: PrismaClient, lobby_id: number, latitude: number, longitude: number) {    
    // start transaction
    await prisma.$transaction(async (tx: any) => {
        // data from Google
        let placeResults = await searchNearby(lobby_id, latitude, longitude);
        console.log(placeResults);

        for (const rec of placeResults) {
            try {
                // Check if the recommendation already exists
                const existingRec = await tx.Recommendation.findUnique({
                    where: { id: rec.id },
                });

                if (!existingRec) {
                    // Create the recommendation if it doesn't exist
                    await tx.Recommendation.create({
                        data: rec
                    });
                } else {
                    console.log(`Recommendation with ID ${rec.id} already exists, connecting to lobby.`);
                }

                // Connect the recommendation to the lobby (whether newly created or already existing)
                await tx.Recommendation.update({
                    where: { id: rec.id },
                    data: {
                        generated_lobby_relation: {
                            connect: { id: lobby_id }
                        }
                    }
                });

            } catch (error) {
                console.error(`Error processing recommendation with ID ${rec.id} for lobby id: ${lobby_id}:`, error);
                throw error; // Rethrow error to trigger transaction rollback
            }
        }

        console.log(`Finished processing recommendations for lobby ID ${lobby_id}`);
    });
};