import { v } from "convex/values";
import { mutation, query, internalMutation, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Get all enrollments that need to be processed
export const getPendingEnrollments = query({
    handler: async (ctx) => {
        const now = Date.now();
        return await ctx.db
            .query("sequenceEnrollments")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .filter((q) =>
                q.and(
                    q.neq(q.field("nextSendAt"), undefined),
                    q.lte(q.field("nextSendAt"), now)
                )
            )
            .take(50); // Process in batches
    },
});

// Internal mutation to process a single enrollment
export const processEnrollment = internalMutation({
    args: {
        enrollmentId: v.id("sequenceEnrollments"),
    },
    handler: async (ctx, args) => {
        const enrollment = await ctx.db.get(args.enrollmentId);
        if (!enrollment || enrollment.status !== "active") {
            return { skipped: true, reason: "Enrollment not active" };
        }

        // Get sequence and steps
        const sequence = await ctx.db.get(enrollment.sequenceId);
        if (!sequence || sequence.status !== "active") {
            // Pause enrollment if sequence is not active
            await ctx.db.patch(args.enrollmentId, { status: "paused" });
            return { skipped: true, reason: "Sequence not active" };
        }

        // Get all steps for this sequence
        const steps = await ctx.db
            .query("sequenceSteps")
            .withIndex("by_sequence", (q) => q.eq("sequenceId", enrollment.sequenceId))
            .collect();

        const sortedSteps = steps.sort((a, b) => a.order - b.order);
        const currentStepIndex = enrollment.currentStep;

        if (currentStepIndex >= sortedSteps.length) {
            // All steps completed
            await ctx.db.patch(args.enrollmentId, {
                status: "completed",
                nextSendAt: undefined,
            });
            return { completed: true };
        }

        const step = sortedSteps[currentStepIndex];

        // Get contact
        const contact = await ctx.db.get(enrollment.contactId);
        if (!contact || contact.status === "unsubscribed") {
            await ctx.db.patch(args.enrollmentId, { status: "unsubscribed" });
            return { skipped: true, reason: "Contact unsubscribed" };
        }

        // Check condition if specified
        if (step.condition && step.condition !== "always") {
            // Get recent activities for this contact
            const recentActivities = await ctx.db
                .query("contactActivities")
                .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
                .order("desc")
                .take(10);

            const hasOpened = recentActivities.some(a => a.type === "email_opened");
            const hasClicked = recentActivities.some(a => a.type === "email_clicked");
            // Note: email_replied would need to be tracked separately

            if (step.condition === "if_not_opened" && hasOpened) {
                // Skip this step, move to next
                return await advanceToNextStep(ctx, enrollment, sortedSteps, currentStepIndex);
            }
            if (step.condition === "if_not_clicked" && hasClicked) {
                return await advanceToNextStep(ctx, enrollment, sortedSteps, currentStepIndex);
            }
        }

        // Get template
        const template = await ctx.db.get(step.templateId);
        if (!template) {
            return { error: "Template not found" };
        }

        // Return data needed to send email
        return {
            shouldSend: true,
            enrollmentId: args.enrollmentId,
            contactId: contact._id,
            email: contact.email,
            name: contact.name,
            company: contact.company,
            subject: template.subject,
            body: template.htmlBody,
            sequenceId: sequence._id,
            stepIndex: currentStepIndex,
            totalSteps: sortedSteps.length,
            nextStepDelay: sortedSteps[currentStepIndex + 1]?.delayDays,
            nextStepDelayHours: sortedSteps[currentStepIndex + 1]?.delayHours,
        };
    },
});

// Helper to advance to next step
async function advanceToNextStep(
    ctx: any,
    enrollment: any,
    steps: any[],
    currentIndex: number
) {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= steps.length) {
        await ctx.db.patch(enrollment._id, {
            status: "completed",
            currentStep: nextIndex,
            nextSendAt: undefined,
        });
        return { completed: true };
    }

    const nextStep = steps[nextIndex];
    const delayMs = ((nextStep.delayDays || 0) * 24 * 60 * 60 * 1000) +
        ((nextStep.delayHours || 0) * 60 * 60 * 1000);

    await ctx.db.patch(enrollment._id, {
        currentStep: nextIndex,
        nextSendAt: Date.now() + delayMs,
    });

    return { advanced: true, nextStep: nextIndex };
}

// Mark enrollment as sent and schedule next step
export const markEnrollmentSent = internalMutation({
    args: {
        enrollmentId: v.id("sequenceEnrollments"),
        nextStepDelayDays: v.optional(v.number()),
        nextStepDelayHours: v.optional(v.number()),
        totalSteps: v.number(),
    },
    handler: async (ctx, args) => {
        const enrollment = await ctx.db.get(args.enrollmentId);
        if (!enrollment) return;

        const nextStep = enrollment.currentStep + 1;

        if (nextStep >= args.totalSteps) {
            // Completed all steps
            await ctx.db.patch(args.enrollmentId, {
                status: "completed",
                currentStep: nextStep,
                nextSendAt: undefined,
            });
        } else {
            // Schedule next step
            const delayMs = ((args.nextStepDelayDays || 1) * 24 * 60 * 60 * 1000) +
                ((args.nextStepDelayHours || 0) * 60 * 60 * 1000);

            await ctx.db.patch(args.enrollmentId, {
                currentStep: nextStep,
                nextSendAt: Date.now() + delayMs,
            });
        }
    },
});

// Log email event for stats
export const logEmailEvent = internalMutation({
    args: {
        userId: v.id("users"),
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
        contactId: v.optional(v.id("contacts")),
        campaignId: v.optional(v.id("campaigns")),
        sequenceId: v.optional(v.id("sequences")),
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Log the event
        await ctx.db.insert("emailEvents", {
            userId: args.userId,
            contactId: args.contactId,
            campaignId: args.campaignId,
            sequenceId: args.sequenceId,
            event: args.event,
            email: args.email,
            metadata: args.metadata,
            timestamp: Date.now(),
        });

        // Update daily stats
        const today = new Date().toISOString().split("T")[0];
        const existingStats = await ctx.db
            .query("emailStats")
            .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", today))
            .first();

        if (existingStats) {
            const field = args.event as keyof typeof existingStats;
            if (typeof existingStats[field] === "number") {
                await ctx.db.patch(existingStats._id, {
                    [field]: (existingStats[field] as number) + 1,
                });
            }
        } else {
            await ctx.db.insert("emailStats", {
                userId: args.userId,
                date: today,
                sent: args.event === "sent" ? 1 : 0,
                delivered: args.event === "delivered" ? 1 : 0,
                opened: args.event === "opened" ? 1 : 0,
                clicked: args.event === "clicked" ? 1 : 0,
                bounced: args.event === "bounced" ? 1 : 0,
                complained: args.event === "complained" ? 1 : 0,
                unsubscribed: args.event === "unsubscribed" ? 1 : 0,
            });
        }
    },
});

// Get domain reputation stats
export const getReputationStats = query({
    args: {
        days: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const daysBack = args.days || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        const startDateStr = startDate.toISOString().split("T")[0];

        const stats = await ctx.db
            .query("emailStats")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.gte(q.field("date"), startDateStr))
            .collect();

        // Aggregate stats
        const totals = stats.reduce(
            (acc, stat) => ({
                sent: acc.sent + stat.sent,
                delivered: acc.delivered + stat.delivered,
                opened: acc.opened + stat.opened,
                clicked: acc.clicked + stat.clicked,
                bounced: acc.bounced + stat.bounced,
                complained: acc.complained + stat.complained,
                unsubscribed: acc.unsubscribed + stat.unsubscribed,
            }),
            { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0, unsubscribed: 0 }
        );

        // Calculate rates
        const deliveryRate = totals.sent > 0 ? ((totals.delivered / totals.sent) * 100).toFixed(1) : "0";
        const openRate = totals.delivered > 0 ? ((totals.opened / totals.delivered) * 100).toFixed(1) : "0";
        const clickRate = totals.opened > 0 ? ((totals.clicked / totals.opened) * 100).toFixed(1) : "0";
        const bounceRate = totals.sent > 0 ? ((totals.bounced / totals.sent) * 100).toFixed(1) : "0";
        const complaintRate = totals.delivered > 0 ? ((totals.complained / totals.delivered) * 100).toFixed(2) : "0";

        // Reputation score (simplified)
        // Good: <0.1% complaints, <2% bounces
        // Warning: 0.1-0.3% complaints, 2-5% bounces
        // Bad: >0.3% complaints, >5% bounces
        let reputationScore = 100;
        if (parseFloat(complaintRate) > 0.3) reputationScore -= 40;
        else if (parseFloat(complaintRate) > 0.1) reputationScore -= 20;
        if (parseFloat(bounceRate) > 5) reputationScore -= 30;
        else if (parseFloat(bounceRate) > 2) reputationScore -= 15;

        return {
            totals,
            rates: {
                deliveryRate,
                openRate,
                clickRate,
                bounceRate,
                complaintRate,
            },
            reputationScore: Math.max(0, reputationScore),
            dailyStats: stats.slice(-7), // Last 7 days
        };
    },
});
