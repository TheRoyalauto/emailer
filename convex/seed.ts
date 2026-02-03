import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed 3 senders for the user
export const seedSenders = mutation({
    args: { userEmail: v.string() },
    handler: async (ctx, args) => {
        const authAccount = await ctx.db
            .query("authAccounts")
            .filter((q) => q.eq(q.field("providerAccountId"), args.userEmail))
            .first();

        if (!authAccount) {
            throw new Error(`User with email ${args.userEmail} not found.`);
        }

        const userId = authAccount.userId;

        const senders = [
            {
                name: "Claimory Team",
                email: "team@claimory.io",
                replyTo: "team@claimory.io",
                isDefault: true,
            },
            {
                name: "Claimory Sales",
                email: "sales@claimory.io",
                replyTo: "sales@claimory.io",
                isDefault: false,
            },
            {
                name: "Claimory Support",
                email: "support@claimory.io",
                replyTo: "support@claimory.io",
                isDefault: false,
            },
        ];

        for (const sender of senders) {
            await ctx.db.insert("senders", {
                userId,
                name: sender.name,
                email: sender.email,
                replyTo: sender.replyTo,
                isDefault: sender.isDefault,
                verified: true,
            });
        }

        return { success: true, sendersAdded: 3 };
    },
});

// Seed data for itsakaswizzy@gmail.com account
export const seedUserData = mutation({
    args: { userEmail: v.string() },
    handler: async (ctx, args) => {
        // Find the user by email in auth tables
        const authAccount = await ctx.db
            .query("authAccounts")
            .filter((q) => q.eq(q.field("providerAccountId"), args.userEmail))
            .first();

        if (!authAccount) {
            throw new Error(`User with email ${args.userEmail} not found. Please register first.`);
        }

        const userId = authAccount.userId;

        // ============== CREATE 2 BATCHES ==============
        const batch1Id = await ctx.db.insert("batches", {
            userId,
            name: "California Body Shops",
            description: "50 collision repair shops across California",
            color: "#6366f1",
            contactCount: 50,
            createdAt: Date.now(),
        });

        const batch2Id = await ctx.db.insert("batches", {
            userId,
            name: "Texas Body Shops",
            description: "50 collision repair shops across Texas",
            color: "#10b981",
            contactCount: 50,
            createdAt: Date.now(),
        });

        // ============== CREATE 100 BODY SHOP CONTACTS ==============
        const californiaShops = [
            { name: "Pacific Coast Collision", city: "Los Angeles" },
            { name: "Golden Gate Auto Body", city: "San Francisco" },
            { name: "SoCal Collision Center", city: "San Diego" },
            { name: "Bay Area Body Works", city: "Oakland" },
            { name: "Sunset Auto Repair", city: "Santa Monica" },
            { name: "Valley Collision Experts", city: "Fresno" },
            { name: "Sacramento Auto Body", city: "Sacramento" },
            { name: "Napa Valley Collision", city: "Napa" },
            { name: "Orange County Collision", city: "Irvine" },
            { name: "Riverside Body Shop", city: "Riverside" },
            { name: "Silicon Valley Auto Body", city: "San Jose" },
            { name: "Palm Springs Collision", city: "Palm Springs" },
            { name: "Laguna Beach Auto Body", city: "Laguna Beach" },
            { name: "Pasadena Collision Center", city: "Pasadena" },
            { name: "Long Beach Body Works", city: "Long Beach" },
            { name: "Bakersfield Auto Collision", city: "Bakersfield" },
            { name: "Ventura Coast Collision", city: "Ventura" },
            { name: "Monterey Bay Auto Body", city: "Monterey" },
            { name: "Malibu Collision Repair", city: "Malibu" },
            { name: "Anaheim Auto Body Shop", city: "Anaheim" },
            { name: "Glendale Collision Center", city: "Glendale" },
            { name: "Burbank Body Works", city: "Burbank" },
            { name: "Santa Barbara Collision", city: "Santa Barbara" },
            { name: "Stockton Auto Body", city: "Stockton" },
            { name: "Modesto Collision Experts", city: "Modesto" },
            { name: "Oxnard Auto Repair", city: "Oxnard" },
            { name: "Thousand Oaks Body Shop", city: "Thousand Oaks" },
            { name: "Huntington Beach Collision", city: "Huntington Beach" },
            { name: "Newport Beach Auto Body", city: "Newport Beach" },
            { name: "Torrance Collision Center", city: "Torrance" },
            { name: "Redondo Beach Body Shop", city: "Redondo Beach" },
            { name: "El Monte Auto Collision", city: "El Monte" },
            { name: "Pomona Body Works", city: "Pomona" },
            { name: "Ontario Collision Experts", city: "Ontario" },
            { name: "San Bernardino Auto Body", city: "San Bernardino" },
            { name: "Fontana Collision Center", city: "Fontana" },
            { name: "Corona Auto Body Shop", city: "Corona" },
            { name: "Temecula Collision Repair", city: "Temecula" },
            { name: "Murrieta Body Works", city: "Murrieta" },
            { name: "Escondido Auto Collision", city: "Escondido" },
            { name: "Carlsbad Body Shop", city: "Carlsbad" },
            { name: "Oceanside Collision Center", city: "Oceanside" },
            { name: "Vista Auto Body", city: "Vista" },
            { name: "Chula Vista Collision", city: "Chula Vista" },
            { name: "National City Auto Body", city: "National City" },
            { name: "La Mesa Body Works", city: "La Mesa" },
            { name: "El Cajon Collision Experts", city: "El Cajon" },
            { name: "Santee Auto Collision", city: "Santee" },
            { name: "Poway Body Shop", city: "Poway" },
            { name: "Rancho Cucamonga Collision", city: "Rancho Cucamonga" },
        ];

        const texasShops = [
            { name: "Lone Star Collision", city: "Houston" },
            { name: "Dallas Auto Body", city: "Dallas" },
            { name: "Austin Collision Center", city: "Austin" },
            { name: "San Antonio Body Works", city: "San Antonio" },
            { name: "Fort Worth Collision", city: "Fort Worth" },
            { name: "El Paso Auto Body", city: "El Paso" },
            { name: "Plano Collision Experts", city: "Plano" },
            { name: "Arlington Body Shop", city: "Arlington" },
            { name: "Corpus Christi Collision", city: "Corpus Christi" },
            { name: "Lubbock Auto Body", city: "Lubbock" },
            { name: "Laredo Collision Center", city: "Laredo" },
            { name: "Irving Body Works", city: "Irving" },
            { name: "Garland Auto Collision", city: "Garland" },
            { name: "Amarillo Body Shop", city: "Amarillo" },
            { name: "Grand Prairie Collision", city: "Grand Prairie" },
            { name: "McKinney Auto Body", city: "McKinney" },
            { name: "Frisco Collision Experts", city: "Frisco" },
            { name: "Brownsville Body Works", city: "Brownsville" },
            { name: "Pasadena TX Collision", city: "Pasadena" },
            { name: "Mesquite Auto Body", city: "Mesquite" },
            { name: "Killeen Collision Center", city: "Killeen" },
            { name: "McAllen Body Shop", city: "McAllen" },
            { name: "Waco Auto Collision", city: "Waco" },
            { name: "Denton Collision Experts", city: "Denton" },
            { name: "Carrollton Body Works", city: "Carrollton" },
            { name: "Midland Auto Body", city: "Midland" },
            { name: "Odessa Collision Center", city: "Odessa" },
            { name: "Round Rock Body Shop", city: "Round Rock" },
            { name: "The Woodlands Collision", city: "The Woodlands" },
            { name: "Sugar Land Auto Body", city: "Sugar Land" },
            { name: "Pearland Collision Experts", city: "Pearland" },
            { name: "League City Body Works", city: "League City" },
            { name: "Tyler Auto Collision", city: "Tyler" },
            { name: "Longview Body Shop", city: "Longview" },
            { name: "Abilene Collision Center", city: "Abilene" },
            { name: "Beaumont Auto Body", city: "Beaumont" },
            { name: "Temple Collision Experts", city: "Temple" },
            { name: "New Braunfels Body Works", city: "New Braunfels" },
            { name: "Conroe Auto Collision", city: "Conroe" },
            { name: "Victoria Body Shop", city: "Victoria" },
            { name: "Georgetown Collision", city: "Georgetown" },
            { name: "Cedar Park Auto Body", city: "Cedar Park" },
            { name: "Pflugerville Collision", city: "Pflugerville" },
            { name: "Lewisville Body Works", city: "Lewisville" },
            { name: "Richardson Auto Collision", city: "Richardson" },
            { name: "Allen Body Shop", city: "Allen" },
            { name: "Flower Mound Collision", city: "Flower Mound" },
            { name: "Mansfield Auto Body", city: "Mansfield" },
            { name: "North Richland Hills Collision", city: "North Richland Hills" },
            { name: "Euless Body Works", city: "Euless" },
        ];

        // Insert California contacts
        for (let i = 0; i < californiaShops.length; i++) {
            const shop = californiaShops[i];
            const emailSlug = shop.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            await ctx.db.insert("contacts", {
                userId,
                email: `info@${emailSlug}.com`,
                name: shop.name,
                company: shop.name,
                location: `${shop.city}, CA`,
                phone: `(${310 + i % 90})-${100 + i}-${1000 + i * 11}`,
                status: "active",
                batchId: batch1Id,
            });
        }

        // Insert Texas contacts
        for (let i = 0; i < texasShops.length; i++) {
            const shop = texasShops[i];
            const emailSlug = shop.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            await ctx.db.insert("contacts", {
                userId,
                email: `contact@${emailSlug}.com`,
                name: shop.name,
                company: shop.name,
                location: `${shop.city}, TX`,
                phone: `(${512 + i % 90})-${200 + i}-${2000 + i * 11}`,
                status: "active",
                batchId: batch2Id,
            });
        }

        // ============== CREATE 10 COLD EMAILS ==============
        const coldEmails = [
            {
                name: "The Revenue Leak",
                subject: "{{company}} is leaving money on the table",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Most body shops lose <strong>$2,000-$5,000 per claim</strong> simply because they don't catch what insurers miss—or intentionally omit.</p>
<p>Claimory is an AI-powered platform that scans your estimates and finds the hidden revenue you're entitled to. No new hardware. No training. Just more money per job.</p>
<p>Would 15 minutes be worth potentially adding $50K+ to your annual revenue?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "The Supplement Problem",
                subject: "Stop chasing supplements manually",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Writing supplements is tedious. Waiting for insurer approval is worse. Most shops leave money behind because it's just not worth the fight.</p>
<p>Claimory automates supplement detection and generates insurer-ready documentation in seconds. Our shops see <strong>30% faster approvals</strong> and significantly higher capture rates.</p>
<p>Can I show you how it works in a 10-minute demo?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "The AI Advantage",
                subject: "Your competitors are using AI. Are you?",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>The collision industry is changing fast. Shops using AI-powered estimate review are capturing 15-25% more revenue per claim than those doing it manually.</p>
<p>Claimory brings that advantage to {{company}}—without replacing your team or your process. We just make sure no dollar is left behind.</p>
<p>Worth a quick conversation?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "The Time Saver",
                subject: "What if reviewing estimates took 2 minutes, not 20?",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Your estimators spend hours reviewing DRPs, hunting for missed items, and rewriting supplements. What if AI did that in under 2 minutes?</p>
<p>Claimory plugs into your workflow and instantly identifies missed labor, parts, and operations. Your team focuses on repairs—we handle the revenue capture.</p>
<p>Want to see it in action?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "The DRP Fighter",
                subject: "DRPs are squeezing your margins. Here's how to fight back.",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>DRP agreements promise volume. They rarely mention how much revenue you'll lose on every claim.</p>
<p>Claimory helps shops recover what insurers leave off—without damaging your relationships. It's not about fighting adjusters. It's about getting paid for the work you actually do.</p>
<p>15 minutes to show you how?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "The Proof Is In The Numbers",
                subject: "How one shop added $127K in recovered revenue",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>One of our partner shops—similar size to yours—added <strong>$127,000</strong> in recovered revenue last year using Claimory. That's money they were already owed but never captured.</p>
<p>Every estimate you write has hidden dollars. We find them.</p>
<p>Can I share how this could work for {{company}}?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "The Quick Win",
                subject: "Find $500 in 5 minutes (free)",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Send us your last 3 estimates. We'll run them through Claimory and show you exactly what was missed—at no cost.</p>
<p>Most shops are shocked by what they find. Average: <strong>$500+ per estimate</strong> in missed revenue.</p>
<p>Want to try it?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "The Insurance Game",
                subject: "Insurers have AI. Shouldn't you?",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Insurance companies use AI to minimize payouts. They review claims in seconds and auto-deny anything they can.</p>
<p>Claimory levels the playing field. Our AI reviews your estimates just as fast—and catches everything they leave out.</p>
<p>Ready to even the odds?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "The No-Brainer",
                subject: "We only win when you win",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Claimory's pricing is simple: you only pay when we find money you would have missed. No recovery, no fee.</p>
<p>There's literally no risk. Just upside.</p>
<p>Want to learn more?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "The Local Angle",
                subject: "Helping {{location}} shops get paid",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>We're working with body shops across your area to ensure they capture every dollar they're owed on insurance claims.</p>
<p>Claimory uses AI to scan estimates, find missed items, and generate ready-to-submit supplements. It takes minutes, not hours.</p>
<p>Would you be open to a quick call to see if it's a fit for {{company}}?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
        ];

        // ============== CREATE 10 FOLLOW-UP EMAILS ==============
        const followUpEmails = [
            {
                name: "Follow-Up 1: The Gentle Nudge",
                subject: "Re: Quick question for {{company}}",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Just circling back on my previous note. I know you're busy running a shop—that's exactly why tools like Claimory exist.</p>
<p>5 minutes to see if we're a fit?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "Follow-Up 2: The Value Reminder",
                subject: "Still leaving money on the table?",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Since my last email, the average body shop using Claimory has recovered an additional <strong>$3,200 per month</strong> in missed revenue.</p>
<p>That's money already owed to you—just not captured.</p>
<p>Worth a quick look?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "Follow-Up 3: The Free Audit",
                subject: "Free estimate audit for {{company}}",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>I'd love to prove Claimory's value to you—at no cost.</p>
<p>Send me your last 3 estimates, and I'll run a free revenue audit. You'll see exactly what's being missed, with zero obligation.</p>
<p>Interested?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "Follow-Up 4: The Timing Question",
                subject: "Bad timing?",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>I've reached out a couple of times—totally understand if the timing isn't right.</p>
<p>If you're not actively looking at estimate review tools, just let me know and I'll check back later. No hard feelings.</p>
<p>But if you ARE losing sleep over missed revenue, I'm here to help.</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "Follow-Up 5: The Social Proof",
                subject: "What other shops are saying",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Don't take my word for it. Here's what shop owners like you are saying:</p>
<p><em>"Claimory found $4,800 in our first week. We didn't change anything—just uploaded our estimates."</em> — Mike, Texas</p>
<p><em>"I was skeptical. Now I won't write an estimate without running it through Claimory first."</em> — Sarah, California</p>
<p>Want to see similar results at {{company}}?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "Follow-Up 6: The Direct Ask",
                subject: "10 minutes this week?",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>I'll keep this short: 10 minutes to show you how Claimory works and whether it makes sense for {{company}}.</p>
<p>If it's not a fit, I'll tell you. No sales pressure.</p>
<p>How does Thursday or Friday look?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "Follow-Up 7: The Competitor Angle",
                subject: "Your competitors are already using this",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>I probably shouldn't say this, but other shops in your area are already using AI to review their estimates.</p>
<p>They're capturing revenue you might be missing. The gap only grows over time.</p>
<p>Let me show you how to close it.</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "Follow-Up 8: The Simple Math",
                subject: "Quick math on {{company}}'s potential",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>Let's do some quick math:</p>
<ul>
<li>Average missed revenue per estimate: $400-$600</li>
<li>Claims per month at a typical shop: 40-80</li>
<li>Potential annual recovery: <strong>$192,000 - $576,000</strong></li>
</ul>
<p>Even if we capture just 20% of that, we're talking real money.</p>
<p>Worth exploring?</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "Follow-Up 9: The Last Call",
                subject: "Last note from me (for now)",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>I don't want to clog your inbox, so this will be my last email for a while.</p>
<p>If you ever want to explore how AI can help {{company}} capture more revenue per claim, just reply to this thread. I'll be here.</p>
<p>Wishing you a strong quarter.</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
            {
                name: "Follow-Up 10: The Breakup",
                subject: "Should I close your file?",
                html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
<p>Hi,</p>
<p>I've reached out a few times without hearing back, which usually means one of three things:</p>
<ol>
<li>You're not interested (totally fine—just let me know)</li>
<li>You're interested but buried (I get it)</li>
<li>You've been abducted by aliens (concerning)</li>
</ol>
<p>If it's #1, no worries at all. If it's #2, just reply "later" and I'll follow up in a few months. If it's #3... good luck up there.</p>
<p>— The Claimory Team</p>
</body></html>`,
            },
        ];

        // Insert cold emails as campaigns/templates
        for (const email of coldEmails) {
            await ctx.db.insert("campaigns", {
                userId,
                name: `[COLD] ${email.name}`,
                subject: email.subject,
                htmlContent: email.html,
                status: "draft",
            });
        }

        // Insert follow-up emails as campaigns/templates
        for (const email of followUpEmails) {
            await ctx.db.insert("campaigns", {
                userId,
                name: `[FOLLOW-UP] ${email.name}`,
                subject: email.subject,
                htmlContent: email.html,
                status: "draft",
            });
        }

        return {
            success: true,
            batches: 2,
            contacts: 100,
            coldEmails: 10,
            followUpEmails: 10,
        };
    },
});
