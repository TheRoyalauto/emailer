import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    // Auth tables (required by Convex Auth)
    ...authTables,

    // Email campaigns/templates (user-scoped)
    campaigns: defineTable({
        userId: v.optional(v.id("users")), // Optional for migration
        name: v.string(),
        subject: v.string(),
        htmlContent: v.string(),
        textContent: v.optional(v.string()),
        listId: v.optional(v.id("lists")),
        senderId: v.optional(v.id("senders")),
        status: v.union(
            v.literal("draft"),
            v.literal("scheduled"),
            v.literal("sending"),
            v.literal("sent"),
            v.literal("paused")
        ),
        scheduledAt: v.optional(v.number()),
        sentAt: v.optional(v.number()),
        stats: v.optional(
            v.object({
                sent: v.number(),
                delivered: v.number(),
                opened: v.number(),
                clicked: v.number(),
                bounced: v.number(),
                unsubscribed: v.number(),
            })
        ),
    })
        .index("by_status", ["status"])
        .index("by_user", ["userId"]),

    // Contacts (user-scoped)
    contacts: defineTable({
        userId: v.optional(v.id("users")), // Optional for migration
        email: v.string(),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        location: v.optional(v.string()),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        address: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        batchId: v.optional(v.id("batches")),
        status: v.union(
            v.literal("active"),
            v.literal("unsubscribed"),
            v.literal("bounced")
        ),
        // Sales pipeline
        salesStage: v.optional(v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("follow_up"),
            v.literal("qualified"),
            v.literal("closed_won"),
            v.literal("closed_lost")
        )),
        // Activity tracking
        lastEmailAt: v.optional(v.number()),
        lastCallAt: v.optional(v.number()),
        emailCount: v.optional(v.number()),
        callCount: v.optional(v.number()),
        nextFollowUpAt: v.optional(v.number()),
        metadata: v.optional(v.any()),
    })
        .index("by_email", ["email"])
        .index("by_status", ["status"])
        .index("by_batch", ["batchId"])
        .index("by_sales_stage", ["salesStage"])
        .index("by_user", ["userId"])
        .index("by_user_email", ["userId", "email"]),

    // Contact batches (user-scoped, supports hierarchy with parentBatchId)
    batches: defineTable({
        userId: v.optional(v.id("users")), // Optional for migration
        parentBatchId: v.optional(v.id("batches")), // For nested batches (e.g., Arizona > Zone 1)
        name: v.string(),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
        contactCount: v.number(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_parent", ["parentBatchId"]),

    // Mailing lists (user-scoped)
    lists: defineTable({
        userId: v.optional(v.id("users")), // Optional for migration
        name: v.string(),
        description: v.optional(v.string()),
        contactCount: v.number(),
    }).index("by_user", ["userId"]),

    // List memberships (many-to-many)
    listMembers: defineTable({
        listId: v.id("lists"),
        contactId: v.id("contacts"),
    })
        .index("by_list", ["listId"])
        .index("by_contact", ["contactId"])
        .index("by_list_and_contact", ["listId", "contactId"]),

    // Sender identities (user-scoped)
    senders: defineTable({
        userId: v.optional(v.id("users")), // Optional for migration
        name: v.string(),
        email: v.string(),
        replyTo: v.optional(v.string()),
        isDefault: v.boolean(),
        verified: v.boolean(),
    })
        .index("by_email", ["email"])
        .index("by_user", ["userId"]),

    // Email templates (user-scoped)
    templates: defineTable({
        userId: v.optional(v.id("users")), // Optional for migration
        name: v.string(),
        subject: v.string(),
        htmlBody: v.string(),
        textBody: v.optional(v.string()),
        category: v.optional(v.string()),
        thumbnail: v.optional(v.string()),
        footerEnabled: v.optional(v.boolean()),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
    })
        .index("by_category", ["category"])
        .index("by_user", ["userId"]),

    // Send queue for batch processing
    sendQueue: defineTable({
        campaignId: v.id("campaigns"),
        contactId: v.id("contacts"),
        status: v.union(
            v.literal("pending"),
            v.literal("sent"),
            v.literal("failed"),
            v.literal("bounced")
        ),
        sentAt: v.optional(v.number()),
        error: v.optional(v.string()),
    })
        .index("by_campaign", ["campaignId"])
        .index("by_status", ["status"])
        .index("by_campaign_status", ["campaignId", "status"]),

    // Email events (opens, clicks, etc.)
    emailEvents: defineTable({
        campaignId: v.id("campaigns"),
        contactId: v.id("contacts"),
        eventType: v.union(
            v.literal("sent"),
            v.literal("delivered"),
            v.literal("opened"),
            v.literal("clicked"),
            v.literal("bounced"),
            v.literal("unsubscribed")
        ),
        metadata: v.optional(v.any()),
    })
        .index("by_campaign", ["campaignId"])
        .index("by_contact", ["contactId"])
        .index("by_type", ["eventType"]),

    // Contact activity log (calls, emails, notes)
    contactActivities: defineTable({
        userId: v.id("users"),
        contactId: v.id("contacts"),
        type: v.union(
            v.literal("email_sent"),
            v.literal("email_opened"),
            v.literal("email_clicked"),
            v.literal("call_made"),
            v.literal("call_received"),
            v.literal("voicemail_left"),
            v.literal("note_added"),
            v.literal("status_changed"),
            v.literal("follow_up_scheduled")
        ),
        // Call-specific fields
        callOutcome: v.optional(v.union(
            v.literal("answered"),
            v.literal("voicemail"),
            v.literal("no_answer"),
            v.literal("busy"),
            v.literal("wrong_number"),
            v.literal("callback_requested")
        )),
        callDuration: v.optional(v.number()), // seconds
        // Common fields
        notes: v.optional(v.string()),
        campaignId: v.optional(v.id("campaigns")),
        followUpAt: v.optional(v.number()), // scheduled follow-up timestamp
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_contact", ["contactId"])
        .index("by_type", ["type"])
        .index("by_user_date", ["userId", "createdAt"]),

    // A/B Test variants
    abTests: defineTable({
        userId: v.id("users"),
        name: v.string(),
        templateAId: v.id("templates"),
        templateBId: v.id("templates"),
        status: v.union(
            v.literal("draft"),
            v.literal("running"),
            v.literal("completed")
        ),
        splitPercentage: v.number(), // % sent to variant A (rest to B)
        winningVariant: v.optional(v.union(v.literal("A"), v.literal("B"))),
        // Stats
        variantAStats: v.optional(v.object({
            sent: v.number(),
            opened: v.number(),
            clicked: v.number(),
        })),
        variantBStats: v.optional(v.object({
            sent: v.number(),
            opened: v.number(),
            clicked: v.number(),
        })),
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),

    // Email sequences (multi-step drip campaigns)
    sequences: defineTable({
        userId: v.id("users"),
        name: v.string(),
        description: v.optional(v.string()),
        status: v.union(
            v.literal("draft"),
            v.literal("active"),
            v.literal("paused")
        ),
        triggerType: v.union(
            v.literal("manual"),
            v.literal("on_contact_create"),
            v.literal("on_stage_change")
        ),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),

    // Sequence steps
    sequenceSteps: defineTable({
        sequenceId: v.id("sequences"),
        order: v.number(),
        templateId: v.id("templates"),
        delayDays: v.number(), // days to wait before sending
        delayHours: v.optional(v.number()),
        condition: v.optional(v.union(
            v.literal("always"),
            v.literal("if_not_opened"),
            v.literal("if_not_clicked"),
            v.literal("if_not_replied")
        )),
    })
        .index("by_sequence", ["sequenceId"]),

    // Sequence enrollments (contacts in sequences)
    sequenceEnrollments: defineTable({
        sequenceId: v.id("sequences"),
        contactId: v.id("contacts"),
        currentStep: v.number(),
        status: v.union(
            v.literal("active"),
            v.literal("completed"),
            v.literal("paused"),
            v.literal("unsubscribed")
        ),
        nextSendAt: v.optional(v.number()),
        enrolledAt: v.number(),
    })
        .index("by_sequence", ["sequenceId"])
        .index("by_contact", ["contactId"])
        .index("by_status", ["status"])
        .index("by_next_send", ["nextSendAt"]),

    // Unsubscribes (global across all campaigns)
    unsubscribes: defineTable({
        userId: v.id("users"),
        email: v.string(),
        contactId: v.optional(v.id("contacts")),
        reason: v.optional(v.string()),
        campaignId: v.optional(v.id("campaigns")),
        unsubscribedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_email", ["email"])
        .index("by_user_email", ["userId", "email"]),

    // SMTP Configurations (stored credentials for seamless sending)
    smtpConfigs: defineTable({
        userId: v.id("users"),
        name: v.string(), // e.g., "Gmail", "Outlook", "Custom"
        provider: v.optional(v.union(
            v.literal("smtp"),
            v.literal("resend"),
            v.literal("sendgrid"),
            v.literal("mailgun")
        )), // API provider or SMTP
        host: v.optional(v.string()), // For SMTP
        port: v.optional(v.number()), // For SMTP
        secure: v.optional(v.boolean()), // For SMTP
        username: v.optional(v.string()), // For SMTP
        password: v.optional(v.string()), // For SMTP or API key
        apiKey: v.optional(v.string()), // For API providers
        fromEmail: v.string(),
        fromName: v.optional(v.string()),
        isDefault: v.boolean(),
        isVerified: v.optional(v.boolean()),
        lastUsedAt: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_default", ["userId", "isDefault"]),

    // AI Copy Generation History
    aiCopyHistory: defineTable({
        userId: v.id("users"),
        prompt: v.string(),
        generatedSubject: v.optional(v.string()),
        generatedBody: v.string(),
        tone: v.optional(v.string()),
        templateId: v.optional(v.id("templates")),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"]),

    // Email Stats for Domain Reputation Monitoring
    emailStats: defineTable({
        userId: v.id("users"),
        date: v.string(), // YYYY-MM-DD
        sent: v.number(),
        delivered: v.number(),
        opened: v.number(),
        clicked: v.number(),
        bounced: v.number(),
        complained: v.number(), // Spam complaints
        unsubscribed: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_date", ["userId", "date"]),

    // Email Events Log (for debugging and detailed tracking)
    emailEvents: defineTable({
        userId: v.id("users"),
        contactId: v.optional(v.id("contacts")),
        campaignId: v.optional(v.id("campaigns")),
        sequenceId: v.optional(v.id("sequences")),
        event: v.union(
            v.literal("sent"),
            v.literal("delivered"),
            v.literal("opened"),
            v.literal("clicked"),
            v.literal("bounced"),
            v.literal("complained"),
            v.literal("unsubscribed")
        ),
        email: v.string(),
        metadata: v.optional(v.string()), // JSON for extra data like click URL
        timestamp: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_contact", ["contactId"])
        .index("by_campaign", ["campaignId"])
        .index("by_event", ["event"]),
});

