import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// List all sequences
export const list = query({
    args: { sessionToken: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) return [];

        const sequences = await ctx.db
            .query("sequences")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        // Fetch step counts
        const sequencesWithCounts = await Promise.all(
            sequences.map(async (seq) => {
                const steps = await ctx.db
                    .query("sequenceSteps")
                    .withIndex("by_sequence", (q) => q.eq("sequenceId", seq._id))
                    .collect();
                const enrollments = await ctx.db
                    .query("sequenceEnrollments")
                    .withIndex("by_sequence", (q) => q.eq("sequenceId", seq._id))
                    .filter((q) => q.eq(q.field("status"), "active"))
                    .collect();
                return {
                    ...seq,
                    stepCount: steps.length,
                    activeEnrollments: enrollments.length,
                };
            })
        );

        return sequencesWithCounts;
    },
});

// Get sequence with steps
export const get = query({
    args: {
        sessionToken: v.optional(v.string()),
        id: v.id("sequences") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const sequence = await ctx.db.get(args.id);
        if (!sequence || sequence.userId !== userId) return null;

        const steps = await ctx.db
            .query("sequenceSteps")
            .withIndex("by_sequence", (q) => q.eq("sequenceId", args.id))
            .collect();

        // Sort by order
        steps.sort((a, b) => a.order - b.order);

        // Fetch template details for each step
        const stepsWithTemplates = await Promise.all(
            steps.map(async (step) => {
                const template = await ctx.db.get(step.templateId);
                return { ...step, template };
            })
        );

        const enrollments = await ctx.db
            .query("sequenceEnrollments")
            .withIndex("by_sequence", (q) => q.eq("sequenceId", args.id))
            .collect();

        return { ...sequence, steps: stepsWithTemplates, enrollments };
    },
});

// Create a new sequence
export const create = mutation({
    args: {
        sessionToken: v.optional(v.string()),
       
        name: v.string(),
        description: v.optional(v.string()),
        triggerType: v.union(
            v.literal("manual"),
            v.literal("on_contact_create"),
            v.literal("on_stage_change")
        ),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        if (!userId) throw new Error("Not authenticated");

        return await ctx.db.insert("sequences", {
            userId,
            name: args.name,
            description: args.description,
            triggerType: args.triggerType,
            status: "draft",
            createdAt: Date.now(),
        });
    },
});

// Add a step to a sequence
export const addStep = mutation({
    args: {
        sessionToken: v.optional(v.string()),
       
        sequenceId: v.id("sequences"),
        templateId: v.id("templates"),
        delayDays: v.number(),
        delayHours: v.optional(v.number()),
        condition: v.optional(v.union(
            v.literal("always"),
            v.literal("if_not_opened"),
            v.literal("if_not_clicked"),
            v.literal("if_not_replied")
        )),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const sequence = await ctx.db.get(args.sequenceId);
        if (!sequence || sequence.userId !== userId) {
            throw new Error("Sequence not found");
        }

        // Get current max order
        const steps = await ctx.db
            .query("sequenceSteps")
            .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
            .collect();
        const maxOrder = steps.reduce((max, s) => Math.max(max, s.order), 0);

        return await ctx.db.insert("sequenceSteps", {
            sequenceId: args.sequenceId,
            templateId: args.templateId,
            order: maxOrder + 1,
            delayDays: args.delayDays,
            delayHours: args.delayHours,
            condition: args.condition || "always",
        });
    },
});

// Remove a step
export const removeStep = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        stepId: v.id("sequenceSteps") },
    handler: async (ctx, args) => {
        const step = await ctx.db.get(args.stepId);
        if (!step) throw new Error("Step not found");

        const sequence = await ctx.db.get(step.sequenceId);
        const userId = await getAuthUserId(ctx, args);
        if (!sequence || sequence.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.stepId);
        return { success: true };
    },
});

// Activate a sequence
export const activate = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        id: v.id("sequences") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const sequence = await ctx.db.get(args.id);
        if (!sequence || sequence.userId !== userId) {
            throw new Error("Sequence not found");
        }

        await ctx.db.patch(args.id, { status: "active", updatedAt: Date.now() });
        return { success: true };
    },
});

// Pause a sequence
export const pause = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        id: v.id("sequences") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const sequence = await ctx.db.get(args.id);
        if (!sequence || sequence.userId !== userId) {
            throw new Error("Sequence not found");
        }

        await ctx.db.patch(args.id, { status: "paused", updatedAt: Date.now() });
        return { success: true };
    },
});

// Enroll a contact in a sequence
export const enrollContact = mutation({
    args: {
        sessionToken: v.optional(v.string()),
       
        sequenceId: v.id("sequences"),
        contactId: v.id("contacts"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const sequence = await ctx.db.get(args.sequenceId);
        if (!sequence || sequence.userId !== userId) {
            throw new Error("Sequence not found");
        }

        // Check if already enrolled
        const existing = await ctx.db
            .query("sequenceEnrollments")
            .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
            .filter((q) => q.eq(q.field("sequenceId"), args.sequenceId))
            .first();

        if (existing && existing.status === "active") {
            throw new Error("Contact already enrolled in this sequence");
        }

        // Get first step to calculate next send time
        const steps = await ctx.db
            .query("sequenceSteps")
            .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
            .collect();
        steps.sort((a, b) => a.order - b.order);

        const firstStep = steps[0];
        const delayMs = firstStep
            ? (firstStep.delayDays * 24 + (firstStep.delayHours || 0)) * 60 * 60 * 1000
            : 0;

        return await ctx.db.insert("sequenceEnrollments", {
            sequenceId: args.sequenceId,
            contactId: args.contactId,
            currentStep: 1,
            status: "active",
            nextSendAt: Date.now() + delayMs,
            enrolledAt: Date.now(),
        });
    },
});

// Unenroll a contact
export const unenrollContact = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        enrollmentId: v.id("sequenceEnrollments") },
    handler: async (ctx, args) => {
        const enrollment = await ctx.db.get(args.enrollmentId);
        if (!enrollment) throw new Error("Enrollment not found");

        await ctx.db.patch(args.enrollmentId, { status: "paused" });
        return { success: true };
    },
});

// Delete a sequence
export const remove = mutation({
    args: {
        sessionToken: v.optional(v.string()),
        id: v.id("sequences") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx, args);
        const sequence = await ctx.db.get(args.id);
        if (!sequence || sequence.userId !== userId) {
            throw new Error("Sequence not found");
        }

        // Delete all steps
        const steps = await ctx.db
            .query("sequenceSteps")
            .withIndex("by_sequence", (q) => q.eq("sequenceId", args.id))
            .collect();
        for (const step of steps) {
            await ctx.db.delete(step._id);
        }

        // Delete all enrollments
        const enrollments = await ctx.db
            .query("sequenceEnrollments")
            .withIndex("by_sequence", (q) => q.eq("sequenceId", args.id))
            .collect();
        for (const enrollment of enrollments) {
            await ctx.db.delete(enrollment._id);
        }

        await ctx.db.delete(args.id);
        return { success: true };
    },
});
