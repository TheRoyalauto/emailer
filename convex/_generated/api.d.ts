/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as abTests from "../abTests.js";
import type * as activities from "../activities.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as automations from "../automations.js";
import type * as batches from "../batches.js";
import type * as brandRules from "../brandRules.js";
import type * as campaigns from "../campaigns.js";
import type * as contacts from "../contacts.js";
import type * as deals from "../deals.js";
import type * as http from "../http.js";
import type * as leadSearches from "../leadSearches.js";
import type * as lists from "../lists.js";
import type * as replies from "../replies.js";
import type * as seed from "../seed.js";
import type * as sendPolicies from "../sendPolicies.js";
import type * as senders from "../senders.js";
import type * as sequenceScheduler from "../sequenceScheduler.js";
import type * as sequences from "../sequences.js";
import type * as smtpConfigs from "../smtpConfigs.js";
import type * as tasks from "../tasks.js";
import type * as templates from "../templates.js";
import type * as trackedLinks from "../trackedLinks.js";
import type * as unsubscribes from "../unsubscribes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  abTests: typeof abTests;
  activities: typeof activities;
  analytics: typeof analytics;
  auth: typeof auth;
  automations: typeof automations;
  batches: typeof batches;
  brandRules: typeof brandRules;
  campaigns: typeof campaigns;
  contacts: typeof contacts;
  deals: typeof deals;
  http: typeof http;
  leadSearches: typeof leadSearches;
  lists: typeof lists;
  replies: typeof replies;
  seed: typeof seed;
  sendPolicies: typeof sendPolicies;
  senders: typeof senders;
  sequenceScheduler: typeof sequenceScheduler;
  sequences: typeof sequences;
  smtpConfigs: typeof smtpConfigs;
  tasks: typeof tasks;
  templates: typeof templates;
  trackedLinks: typeof trackedLinks;
  unsubscribes: typeof unsubscribes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
