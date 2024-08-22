/// <reference types="@types/google.maps" />
import categories from "./categories.js";
import { PrismaClient } from '@prisma/client';
import { RecommendationCategory } from "@prisma/client";
import fetch from "node-fetch";
  
function determineCategory(types: string[]): 'DINING' | 'ACTIVITY' {
    for (const type of types) {
        if (categories.activityTypes.has(type)) {
            return 'ACTIVITY'
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
                "X-Goog-FieldMask": "places.displayName,places.types,places.id,places.addressComponents,places.location"
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
                category: determineCategory(place.types) === 'DINING' ? RecommendationCategory.DINING : RecommendationCategory.ACTIVITY,
                id: place.id,
                postal_code: place.addressComponents?.filter((comp: any) => {return comp.types.includes("postal_code")})[0]?.longText || null,
                latitude: place.location.latitude,
                longitude: place.location.longitude
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
    // data from google
    let placeResults = await searchNearby(lobby_id, latitude, longitude);
    console.log(placeResults)

    // create recommendations 
    try {
        var res = await prisma.recommendation.createMany({
            data: placeResults
        });
        console.log(res);
        
        for (const rec of placeResults) {
            await prisma.recommendation.update({
                where: { id: rec.id },
                data: {
                    generated_lobby_relation: {
                        connect: { id: lobby_id }
                    }
                }
            });
        }

        console.log(`Linked recommendations to lobby with ID ${lobby_id}`);
    } catch (error) {
        console.error(`Error generating recommendations for lobby id: ${lobby_id}:`, error)
    }
    
};
