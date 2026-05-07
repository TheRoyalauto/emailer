/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as batches from "../batches.js";
import type * as campaigns from "../campaigns.js";
import type * as contacts from "../contacts.js";
import type * as crons from "../crons.js";
import type * as customAuth from "../customAuth.js";
import type * as emailVerification from "../emailVerification.js";
import type * as http from "../http.js";
import type * as leadSearches from "../leadSearches.js";
import type * as lists from "../lists.js";
import type * as replies from "../replies.js";
import type * as scrapeJobs from "../scrapeJobs.js";
import type * as scrapeJobsInternal from "../scrapeJobsInternal.js";
import type * as scrapedLeads from "../scrapedLeads.js";
import type * as scraperActions from "../scraperActions.js";
import type * as scraperWarmer from "../scraperWarmer.js";
import type * as scraper_crawler from "../scraper/crawler.js";
import type * as scraper_email_extractor from "../scraper/email_extractor.js";
import type * as scraper_email_validator from "../scraper/email_validator.js";
import type * as scraper_google_search from "../scraper/google_search.js";
import type * as scraper_index from "../scraper/index.js";
import type * as scraper_scrapling_search from "../scraper/scrapling_search.js";
import type * as seed from "../seed.js";
import type * as sendPolicies from "../sendPolicies.js";
import type * as sequenceScheduler from "../sequenceScheduler.js";
import type * as sequences from "../sequences.js";
import type * as setup from "../setup.js";
import type * as smtpConfigs from "../smtpConfigs.js";
import type * as superAdmin from "../superAdmin.js";
import type * as templates from "../templates.js";
import type * as trackedLinks from "../trackedLinks.js";
import type * as unsubscribes from "../unsubscribes.js";
import type * as userProfiles from "../userProfiles.js";
import type * as warmup from "../warmup.js";
import type * as warmupLogs from "../warmupLogs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  analytics: typeof analytics;
  auth: typeof auth;
  batches: typeof batches;
  campaigns: typeof campaigns;
  contacts: typeof contacts;
  crons: typeof crons;
  customAuth: typeof customAuth;
  emailVerification: typeof emailVerification;
  http: typeof http;
  leadSearches: typeof leadSearches;
  lists: typeof lists;
  replies: typeof replies;
  scrapeJobs: typeof scrapeJobs;
  scrapeJobsInternal: typeof scrapeJobsInternal;
  scrapedLeads: typeof scrapedLeads;
  scraperActions: typeof scraperActions;
  scraperWarmer: typeof scraperWarmer;
  "scraper/crawler": typeof scraper_crawler;
  "scraper/email_extractor": typeof scraper_email_extractor;
  "scraper/email_validator": typeof scraper_email_validator;
  "scraper/google_search": typeof scraper_google_search;
  "scraper/index": typeof scraper_index;
  "scraper/scrapling_search": typeof scraper_scrapling_search;
  seed: typeof seed;
  sendPolicies: typeof sendPolicies;
  sequenceScheduler: typeof sequenceScheduler;
  sequences: typeof sequences;
  setup: typeof setup;
  smtpConfigs: typeof smtpConfigs;
  superAdmin: typeof superAdmin;
  templates: typeof templates;
  trackedLinks: typeof trackedLinks;
  unsubscribes: typeof unsubscribes;
  userProfiles: typeof userProfiles;
  warmup: typeof warmup;
  warmupLogs: typeof warmupLogs;
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
