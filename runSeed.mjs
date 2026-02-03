// Quick script to seed data - run with: node runSeed.mjs
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://avid-cuttlefish-641.convex.cloud");

async function seed() {
    try {
        const result = await client.mutation(api.seed.seedUserData, {
            userEmail: "itsakaswizzy@gmail.com"
        });
        console.log("Seeding complete!", result);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

seed();
