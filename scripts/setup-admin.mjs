// Run this script to set up super admin
// Usage: node scripts/setup-admin.mjs

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function main() {
    const email = "genswizz@gmail.com";
    console.log(`Setting up ${email} as super admin...`);

    try {
        const result = await client.mutation(api.setup.setupSuperAdmin, { email });
        console.log("✓ Success:", result);
    } catch (error) {
        console.error("✗ Error:", error.message);
    }
}

main();
