// Add senders - run with: node addSenders.mjs
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const client = new ConvexHttpClient("https://avid-cuttlefish-641.convex.cloud");

async function addSenders() {
    try {
        const result = await client.mutation(api.seed.seedSenders, {
            userEmail: "itsakaswizzy@gmail.com"
        });
        console.log("Senders added!", result);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

addSenders();
