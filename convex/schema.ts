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
        leadScore: v.optional(v.number()), // 1-100 AI-generated score
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

    // Lead search history (user-scoped)
    leadSearches: defineTable({
        userId: v.id("users"),
        prompt: v.string(),
        resultsCount: v.number(),
        createdAt: v.number(),
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
        userId: v.id("users"),
        campaignId: v.optional(v.id("campaigns")),
        contactId: v.optional(v.id("contacts")),
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
        metadata: v.optional(v.any()),
        timestamp: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_campaign", ["campaignId"])
        .index("by_contact", ["contactId"])
        .index("by_event", ["event"]),

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

    // ═══════════════════════════════════════════════════════════════════════════
    // CRM AUTOMATION SYSTEM - Phase E/F/G/H
    // ═══════════════════════════════════════════════════════════════════════════

    // Deals (separate from contacts - represents active opportunities)
    deals: defineTable({
        userId: v.id("users"),
        contactId: v.id("contacts"),
        name: v.string(),
        value: v.number(),
        probability: v.number(), // 0-100
        stage: v.union(
            v.literal("lead"),
            v.literal("contacted"),
            v.literal("replied"),
            v.literal("qualified"),
            v.literal("demo_booked"),
            v.literal("proposal_sent"),
            v.literal("negotiation"),
            v.literal("closed_won"),
            v.literal("closed_lost")
        ),
        expectedCloseDate: v.optional(v.number()),
        lostReason: v.optional(v.string()),
        wonDate: v.optional(v.number()),
        bookingLink: v.optional(v.string()),
        notes: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_contact", ["contactId"])
        .index("by_stage", ["stage"])
        .index("by_user_stage", ["userId", "stage"]),

    // Automation Rules
    automationRules: defineTable({
        userId: v.id("users"),
        name: v.string(),
        description: v.optional(v.string()),
        isActive: v.boolean(),
        triggerType: v.union(
            v.literal("reply_positive"),
            v.literal("reply_objection"),
            v.literal("reply_not_now"),
            v.literal("reply_price"),
            v.literal("reply_competitor"),
            v.literal("reply_angry"),
            v.literal("no_reply_after"),
            v.literal("demo_no_show"),
            v.literal("proposal_sent"),
            v.literal("proposal_viewed"),
            v.literal("proposal_accepted"),
            v.literal("stage_change")
        ),
        triggerConfig: v.optional(v.any()), // { daysWithoutReply: 3, targetStage: "qualified" }
        actionType: v.union(
            v.literal("create_deal"),
            v.literal("send_sequence"),
            v.literal("update_stage"),
            v.literal("add_task"),
            v.literal("send_booking_link"),
            v.literal("send_email"),
            v.literal("notify_user")
        ),
        actionConfig: v.any(), // { sequenceId: "xxx", templateId: "yyy", message: "zzz" }
        priority: v.optional(v.number()), // execution order
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_trigger", ["triggerType"])
        .index("by_user_active", ["userId", "isActive"]),

    // Automation Execution Log
    automationLogs: defineTable({
        userId: v.id("users"),
        ruleId: v.id("automationRules"),
        contactId: v.id("contacts"),
        dealId: v.optional(v.id("deals")),
        replyId: v.optional(v.id("inboundReplies")),
        triggeredAt: v.number(),
        triggerType: v.string(),
        actionTaken: v.string(),
        success: v.boolean(),
        error: v.optional(v.string()),
        metadata: v.optional(v.any()),
    })
        .index("by_user", ["userId"])
        .index("by_rule", ["ruleId"])
        .index("by_contact", ["contactId"])
        .index("by_user_date", ["userId", "triggeredAt"]),

    // Inbound Replies (for AI triage)
    inboundReplies: defineTable({
        userId: v.id("users"),
        contactId: v.id("contacts"),
        dealId: v.optional(v.id("deals")),
        originalEmailId: v.optional(v.string()),
        campaignId: v.optional(v.id("campaigns")),
        sequenceId: v.optional(v.id("sequences")),
        subject: v.string(),
        body: v.string(),
        fromEmail: v.string(),
        receivedAt: v.number(),
        classification: v.optional(v.union(
            v.literal("positive"),
            v.literal("not_now"),
            v.literal("price_objection"),
            v.literal("competitor"),
            v.literal("angry"),
            v.literal("unsubscribe"),
            v.literal("out_of_office"),
            v.literal("question"),
            v.literal("unknown")
        )),
        sentiment: v.optional(v.number()), // -100 to 100
        buyingSignals: v.optional(v.object({
            budget: v.optional(v.string()),
            authority: v.optional(v.string()),
            need: v.optional(v.string()),
            timeline: v.optional(v.string()),
            score: v.optional(v.number()), // 0-100 BANT score
        })),
        suggestedResponses: v.optional(v.array(v.object({
            type: v.string(), // "best", "alternative1", "alternative2"
            subject: v.string(),
            body: v.string(),
        }))),
        isProcessed: v.boolean(),
        processedAt: v.optional(v.number()),
        responseStatus: v.optional(v.union(
            v.literal("pending"),
            v.literal("responded"),
            v.literal("ignored")
        )),
        respondedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_contact", ["contactId"])
        .index("by_classification", ["classification"])
        .index("by_user_processed", ["userId", "isProcessed"])
        .index("by_user_date", ["userId", "receivedAt"]),

    // Meetings
    meetings: defineTable({
        userId: v.id("users"),
        contactId: v.id("contacts"),
        dealId: v.optional(v.id("deals")),
        title: v.string(),
        description: v.optional(v.string()),
        scheduledAt: v.number(),
        duration: v.optional(v.number()), // minutes
        status: v.union(
            v.literal("scheduled"),
            v.literal("completed"),
            v.literal("no_show"),
            v.literal("cancelled"),
            v.literal("rescheduled")
        ),
        meetingType: v.optional(v.union(
            v.literal("discovery"),
            v.literal("demo"),
            v.literal("follow_up"),
            v.literal("closing"),
            v.literal("onboarding"),
            v.literal("other")
        )),
        location: v.optional(v.string()), // Zoom link, address, etc.
        transcript: v.optional(v.string()),
        rawNotes: v.optional(v.string()),
        isProcessed: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_contact", ["contactId"])
        .index("by_deal", ["dealId"])
        .index("by_status", ["status"])
        .index("by_user_date", ["userId", "scheduledAt"]),

    // Meeting Notes (AI-extracted insights)
    meetingNotes: defineTable({
        userId: v.id("users"),
        meetingId: v.id("meetings"),
        summary: v.string(),
        keyPoints: v.array(v.string()),
        objections: v.optional(v.array(v.object({
            objection: v.string(),
            suggestedResponse: v.string(),
            severity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
        }))),
        actionItems: v.array(v.object({
            task: v.string(),
            owner: v.optional(v.string()),
            dueDate: v.optional(v.number()),
            priority: v.optional(v.string()),
        })),
        nextSteps: v.optional(v.array(v.string())),
        followUpEmailDraft: v.optional(v.object({
            subject: v.string(),
            body: v.string(),
        })),
        recommendedStage: v.optional(v.string()),
        dealValue: v.optional(v.number()), // if mentioned
        timeline: v.optional(v.string()), // if discussed
        generatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_meeting", ["meetingId"]),

    // Tasks (action items, follow-ups, reminders)
    tasks: defineTable({
        userId: v.id("users"),
        contactId: v.optional(v.id("contacts")),
        dealId: v.optional(v.id("deals")),
        meetingId: v.optional(v.id("meetings")),
        replyId: v.optional(v.id("inboundReplies")),
        title: v.string(),
        description: v.optional(v.string()),
        dueAt: v.optional(v.number()),
        reminderAt: v.optional(v.number()),
        priority: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
            v.literal("urgent")
        ),
        status: v.union(
            v.literal("pending"),
            v.literal("in_progress"),
            v.literal("completed"),
            v.literal("cancelled")
        ),
        taskType: v.optional(v.union(
            v.literal("follow_up"),
            v.literal("call"),
            v.literal("email"),
            v.literal("meeting"),
            v.literal("proposal"),
            v.literal("other")
        )),
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_contact", ["contactId"])
        .index("by_deal", ["dealId"])
        .index("by_status", ["status"])
        .index("by_user_status", ["userId", "status"])
        .index("by_due_date", ["dueAt"]),

    // Proposals
    proposals: defineTable({
        userId: v.id("users"),
        contactId: v.id("contacts"),
        dealId: v.optional(v.id("deals")),
        templateId: v.optional(v.id("proposalTemplates")),
        title: v.string(),
        introduction: v.optional(v.string()),
        status: v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("viewed"),
            v.literal("accepted"),
            v.literal("rejected"),
            v.literal("expired")
        ),
        totalValue: v.number(),
        discount: v.optional(v.number()), // percentage
        finalValue: v.optional(v.number()),
        validUntil: v.optional(v.number()),
        termsAndConditions: v.optional(v.string()),
        sentAt: v.optional(v.number()),
        viewedAt: v.optional(v.number()),
        viewCount: v.optional(v.number()),
        signedAt: v.optional(v.number()),
        signatureData: v.optional(v.string()), // base64 signature image
        signerName: v.optional(v.string()),
        signerEmail: v.optional(v.string()),
        rejectionReason: v.optional(v.string()),
        paymentLink: v.optional(v.string()),
        publicToken: v.string(), // for client-facing URL
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_contact", ["contactId"])
        .index("by_deal", ["dealId"])
        .index("by_status", ["status"])
        .index("by_token", ["publicToken"])
        .index("by_user_status", ["userId", "status"]),

    // Proposal Items (line items)
    proposalItems: defineTable({
        proposalId: v.id("proposals"),
        name: v.string(),
        description: v.optional(v.string()),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
        order: v.number(),
    })
        .index("by_proposal", ["proposalId"]),

    // Proposal Templates (reusable proposal structures)
    proposalTemplates: defineTable({
        userId: v.id("users"),
        name: v.string(),
        description: v.optional(v.string()),
        introduction: v.optional(v.string()),
        defaultItems: v.array(v.object({
            name: v.string(),
            description: v.optional(v.string()),
            unitPrice: v.number(),
            quantity: v.optional(v.number()),
        })),
        termsAndConditions: v.optional(v.string()),
        validityDays: v.optional(v.number()), // default validity period
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"]),

    // Email Brand Rules - Voice & Tone Guidelines for AI
    emailBrandRules: defineTable({
        userId: v.id("users"),
        name: v.string(), // e.g., "Main Brand", "Enterprise Outreach"
        isDefault: v.optional(v.boolean()),

        // Voice & Tone
        voiceDescription: v.optional(v.string()), // Describe the brand voice
        voiceSamples: v.optional(v.array(v.string())), // Example emails that match the voice

        // Content Rules
        forbiddenPhrases: v.optional(v.array(v.string())), // Never use these
        requiredPhrases: v.optional(v.array(v.string())), // Must include one of these
        preferredPhrases: v.optional(v.array(v.string())), // Prefer these over alternatives

        // Product Facts (for AI accuracy)
        productFacts: v.optional(v.array(v.object({
            fact: v.string(),
            context: v.optional(v.string()),
        }))),

        // Formatting Rules
        maxParagraphs: v.optional(v.number()),
        maxSubjectLength: v.optional(v.number()),
        signatureTemplate: v.optional(v.string()),

        // Personalization
        companyName: v.optional(v.string()),
        senderPersona: v.optional(v.string()), // Role/title to write as

        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_user_default", ["userId", "isDefault"]),

    // Send Policies - Sending limits, business hours, warmup
    sendPolicies: defineTable({
        userId: v.id("users"),
        senderId: v.optional(v.id("senders")), // If null, applies globally
        name: v.string(),
        isActive: v.boolean(),

        // Daily Limits
        dailySendLimit: v.number(), // Max emails per day
        hourlySendLimit: v.optional(v.number()), // Max per hour
        cooldownMinutes: v.optional(v.number()), // Min gap between sends

        // Business Hours (UTC offset in minutes)
        timezone: v.string(), // e.g., "America/New_York"
        businessHoursStart: v.optional(v.number()), // Hour (0-23)
        businessHoursEnd: v.optional(v.number()), // Hour (0-23)
        businessDays: v.optional(v.array(v.number())), // 0=Sun, 1=Mon, etc.

        // Warmup Mode
        isWarmupMode: v.optional(v.boolean()),
        warmupDailyIncrement: v.optional(v.number()), // Increase limit by this each day
        warmupStartDate: v.optional(v.number()),
        warmupMaxDaily: v.optional(v.number()), // Target daily limit

        // Bounce/Reputation
        maxBounceRate: v.optional(v.number()), // Pause if exceeded (0-100)
        maxComplaintRate: v.optional(v.number()), // Pause if exceeded (0-100)
        autoPauseOnBounce: v.optional(v.boolean()),

        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_sender", ["senderId"])
        .index("by_user_active", ["userId", "isActive"]),

    // Invoices
    invoices: defineTable({
        userId: v.id("users"),
        proposalId: v.optional(v.id("proposals")),
        contactId: v.id("contacts"),
        dealId: v.optional(v.id("deals")),
        invoiceNumber: v.string(),
        status: v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("paid"),
            v.literal("partial"),
            v.literal("overdue"),
            v.literal("cancelled"),
            v.literal("refunded")
        ),
        items: v.array(v.object({
            name: v.string(),
            description: v.optional(v.string()),
            quantity: v.number(),
            unitPrice: v.number(),
            total: v.number(),
        })),
        subtotal: v.number(),
        tax: v.optional(v.number()),
        taxRate: v.optional(v.number()),
        discount: v.optional(v.number()),
        totalAmount: v.number(),
        amountPaid: v.optional(v.number()),
        dueDate: v.number(),
        sentAt: v.optional(v.number()),
        paidAt: v.optional(v.number()),
        paymentMethod: v.optional(v.string()),
        paymentReference: v.optional(v.string()),
        notes: v.optional(v.string()),
        publicToken: v.string(), // for client-facing URL
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_contact", ["contactId"])
        .index("by_proposal", ["proposalId"])
        .index("by_status", ["status"])
        .index("by_token", ["publicToken"])
        .index("by_user_status", ["userId", "status"]),
});

