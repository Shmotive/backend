import { RecommendationCategory } from "@prisma/client";

export default {
    recommendations: [
        {name: "McDonalds", category: RecommendationCategory.DINING},
        {name: "Wendys", category: RecommendationCategory.DINING},
        {name: "Subway", category: RecommendationCategory.DINING},
        {name: "Edomae Kiyomi", category: RecommendationCategory.DINING},
        {name: "Pho Le 錦麗", category: RecommendationCategory.DINING},
        {name: "Baretto Caffe", category: RecommendationCategory.DINING},
        {name: "Zen Kyoto", category: RecommendationCategory.DINING},
        {name: "Ichiban Asian All You Can Eat North York", category: RecommendationCategory.DINING},
        {name: "Ren Sushi Richmond Hill", category: RecommendationCategory.DINING},
        {name: "Good Catch Bar & Cafe", category: RecommendationCategory.DINING},
        {name: "Island Spice Flava Inc", category: RecommendationCategory.DINING},
        
        {name: "Pingle's Farm Market", category: RecommendationCategory.ACTIVITY},
        {name: "Go Place", category: RecommendationCategory.ACTIVITY},
        {name: "Crack Pot Studio", category: RecommendationCategory.ACTIVITY},
        {name: "Roll This Way Sushi Making Classes and Catering", category: RecommendationCategory.ACTIVITY},

        {name: "Theo Von: Return Of The Rat", category: RecommendationCategory.EVENT},

    ],
    users: [

    ]
}