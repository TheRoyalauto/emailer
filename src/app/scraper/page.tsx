"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import LeadSearchAnimation from "@/components/LeadSearchAnimation";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

const INDUSTRY_SUGGESTIONS = [
    "Restaurants", "Dentists", "Lawyers", "Gyms", "Plumbers",
    "Real estate agents", "Hair salons", "Auto repair", "Contractors",
    "Accountants", "Coffee shops", "Chiropractors", "Pet groomers",
    "Roofers", "HVAC", "Body shops",
];

const EXAMPLE_PROMPTS = [
    "Find 20 dentists in Los Angeles, 90001",
    "Get 25 collision repair shops in Houston 77001",
    "Search for law firms in Miami, FL",
    "Find 50 restaurants in Chicago 60601",
];

// Locations that are too broad for Google Maps to anchor a useful search.
// State names alone return 0–1 results — Maps wants a city or ZIP.
const US_STATE_NAMES = new Set([
    "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
    "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
    "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana",
    "maine", "maryland", "massachusetts", "michigan", "minnesota",
    "mississippi", "missouri", "montana", "nebraska", "nevada",
    "new hampshire", "new jersey", "new mexico", "new york",
    "north carolina", "north dakota", "ohio", "oklahoma", "oregon",
    "pennsylvania", "rhode island", "south carolina", "south dakota",
    "tennessee", "texas", "utah", "vermont", "virginia", "washington",
    "west virginia", "wisconsin", "wyoming", "district of columbia",
]);

// 2-letter state codes used to expand bare codes ("CA") to a full state name.
const STATE_CODE_TO_NAME: Record<string, string> = {
    al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California",
    co: "Colorado", ct: "Connecticut", de: "Delaware", fl: "Florida", ga: "Georgia",
    hi: "Hawaii", id: "Idaho", il: "Illinois", in: "Indiana", ia: "Iowa",
    ks: "Kansas", ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland",
    ma: "Massachusetts", mi: "Michigan", mn: "Minnesota", ms: "Mississippi",
    mo: "Missouri", mt: "Montana", ne: "Nebraska", nv: "Nevada", nh: "New Hampshire",
    nj: "New Jersey", nm: "New Mexico", ny: "New York", nc: "North Carolina",
    nd: "North Dakota", oh: "Ohio", ok: "Oklahoma", or: "Oregon", pa: "Pennsylvania",
    ri: "Rhode Island", sc: "South Carolina", sd: "South Dakota", tn: "Tennessee",
    tx: "Texas", ut: "Utah", vt: "Vermont", va: "Virginia", wa: "Washington",
    wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming", dc: "District of Columbia",
};

// Top 4-5 cities by population for each state. Used to bulk-add when the user
// types a state name. Format matches our location chip ("City, ST").
const STATE_TOP_CITIES: Record<string, string[]> = {
    california: ["Los Angeles, CA", "San Francisco, CA", "San Diego, CA", "San Jose, CA", "Sacramento, CA"],
    texas: ["Houston, TX", "San Antonio, TX", "Dallas, TX", "Austin, TX", "Fort Worth, TX"],
    florida: ["Miami, FL", "Tampa, FL", "Orlando, FL", "Jacksonville, FL", "Fort Lauderdale, FL"],
    "new york": ["New York, NY", "Buffalo, NY", "Rochester, NY", "Yonkers, NY", "Syracuse, NY"],
    pennsylvania: ["Philadelphia, PA", "Pittsburgh, PA", "Allentown, PA", "Erie, PA", "Reading, PA"],
    illinois: ["Chicago, IL", "Aurora, IL", "Naperville, IL", "Joliet, IL", "Rockford, IL"],
    ohio: ["Columbus, OH", "Cleveland, OH", "Cincinnati, OH", "Toledo, OH", "Akron, OH"],
    georgia: ["Atlanta, GA", "Augusta, GA", "Columbus, GA", "Savannah, GA", "Athens, GA"],
    "north carolina": ["Charlotte, NC", "Raleigh, NC", "Greensboro, NC", "Durham, NC", "Winston-Salem, NC"],
    michigan: ["Detroit, MI", "Grand Rapids, MI", "Warren, MI", "Ann Arbor, MI", "Lansing, MI"],
    "new jersey": ["Newark, NJ", "Jersey City, NJ", "Paterson, NJ", "Elizabeth, NJ", "Edison, NJ"],
    virginia: ["Virginia Beach, VA", "Norfolk, VA", "Richmond, VA", "Arlington, VA", "Alexandria, VA"],
    washington: ["Seattle, WA", "Spokane, WA", "Tacoma, WA", "Bellevue, WA", "Vancouver, WA"],
    arizona: ["Phoenix, AZ", "Tucson, AZ", "Mesa, AZ", "Chandler, AZ", "Scottsdale, AZ"],
    massachusetts: ["Boston, MA", "Worcester, MA", "Springfield, MA", "Cambridge, MA", "Lowell, MA"],
    tennessee: ["Nashville, TN", "Memphis, TN", "Knoxville, TN", "Chattanooga, TN", "Clarksville, TN"],
    indiana: ["Indianapolis, IN", "Fort Wayne, IN", "Evansville, IN", "South Bend, IN", "Carmel, IN"],
    missouri: ["Kansas City, MO", "St. Louis, MO", "Springfield, MO", "Columbia, MO", "Independence, MO"],
    maryland: ["Baltimore, MD", "Frederick, MD", "Rockville, MD", "Gaithersburg, MD", "Bowie, MD"],
    wisconsin: ["Milwaukee, WI", "Madison, WI", "Green Bay, WI", "Kenosha, WI", "Racine, WI"],
    colorado: ["Denver, CO", "Colorado Springs, CO", "Aurora, CO", "Fort Collins, CO", "Boulder, CO"],
    minnesota: ["Minneapolis, MN", "Saint Paul, MN", "Rochester, MN", "Bloomington, MN", "Duluth, MN"],
    "south carolina": ["Charleston, SC", "Columbia, SC", "Greenville, SC", "Mount Pleasant, SC", "Rock Hill, SC"],
    alabama: ["Birmingham, AL", "Montgomery, AL", "Huntsville, AL", "Mobile, AL", "Tuscaloosa, AL"],
    louisiana: ["New Orleans, LA", "Baton Rouge, LA", "Shreveport, LA", "Lafayette, LA", "Lake Charles, LA"],
    kentucky: ["Louisville, KY", "Lexington, KY", "Bowling Green, KY", "Owensboro, KY", "Covington, KY"],
    oregon: ["Portland, OR", "Eugene, OR", "Salem, OR", "Gresham, OR", "Hillsboro, OR"],
    oklahoma: ["Oklahoma City, OK", "Tulsa, OK", "Norman, OK", "Broken Arrow, OK", "Edmond, OK"],
    connecticut: ["Bridgeport, CT", "New Haven, CT", "Stamford, CT", "Hartford, CT", "Waterbury, CT"],
    utah: ["Salt Lake City, UT", "West Valley City, UT", "Provo, UT", "West Jordan, UT", "Orem, UT"],
    iowa: ["Des Moines, IA", "Cedar Rapids, IA", "Davenport, IA", "Sioux City, IA", "Iowa City, IA"],
    nevada: ["Las Vegas, NV", "Henderson, NV", "Reno, NV", "North Las Vegas, NV", "Sparks, NV"],
    arkansas: ["Little Rock, AR", "Fort Smith, AR", "Fayetteville, AR", "Springdale, AR", "Jonesboro, AR"],
    mississippi: ["Jackson, MS", "Gulfport, MS", "Southaven, MS", "Hattiesburg, MS", "Biloxi, MS"],
    kansas: ["Wichita, KS", "Overland Park, KS", "Kansas City, KS", "Olathe, KS", "Topeka, KS"],
    "new mexico": ["Albuquerque, NM", "Las Cruces, NM", "Rio Rancho, NM", "Santa Fe, NM", "Roswell, NM"],
    nebraska: ["Omaha, NE", "Lincoln, NE", "Bellevue, NE", "Grand Island, NE", "Kearney, NE"],
    "west virginia": ["Charleston, WV", "Huntington, WV", "Morgantown, WV", "Parkersburg, WV", "Wheeling, WV"],
    idaho: ["Boise, ID", "Meridian, ID", "Nampa, ID", "Idaho Falls, ID", "Pocatello, ID"],
    hawaii: ["Honolulu, HI", "Pearl City, HI", "Hilo, HI", "Kailua, HI", "Waipahu, HI"],
    "new hampshire": ["Manchester, NH", "Nashua, NH", "Concord, NH", "Dover, NH", "Rochester, NH"],
    maine: ["Portland, ME", "Lewiston, ME", "Bangor, ME", "South Portland, ME", "Auburn, ME"],
    montana: ["Billings, MT", "Missoula, MT", "Great Falls, MT", "Bozeman, MT", "Butte, MT"],
    "rhode island": ["Providence, RI", "Warwick, RI", "Cranston, RI", "Pawtucket, RI", "East Providence, RI"],
    delaware: ["Wilmington, DE", "Dover, DE", "Newark, DE", "Middletown, DE", "Smyrna, DE"],
    "south dakota": ["Sioux Falls, SD", "Rapid City, SD", "Aberdeen, SD", "Brookings, SD", "Watertown, SD"],
    "north dakota": ["Fargo, ND", "Bismarck, ND", "Grand Forks, ND", "Minot, ND", "West Fargo, ND"],
    alaska: ["Anchorage, AK", "Fairbanks, AK", "Juneau, AK", "Sitka, AK", "Wasilla, AK"],
    vermont: ["Burlington, VT", "Essex, VT", "South Burlington, VT", "Colchester, VT", "Rutland, VT"],
    wyoming: ["Cheyenne, WY", "Casper, WY", "Laramie, WY", "Gillette, WY", "Rock Springs, WY"],
    "district of columbia": ["Washington, DC"],
};

function locationIsTooBroad(loc: string): boolean {
    const l = loc.trim().toLowerCase();
    if (US_STATE_NAMES.has(l)) return true;
    if (/^(usa|us|united states|america)$/.test(l)) return true;
    if (/^[a-z]{2}$/.test(l)) return true; // bare 2-letter state code
    return false;
}

/** If `draft` is a state name or 2-letter code, return the canonical state name (lowercase key into STATE_TOP_CITIES). */
function detectState(draft: string): string | null {
    const l = draft.trim().toLowerCase();
    if (US_STATE_NAMES.has(l)) return l;
    if (/^[a-z]{2}$/.test(l) && STATE_CODE_TO_NAME[l]) {
        return STATE_CODE_TO_NAME[l].toLowerCase();
    }
    return null;
}

/**
 * Map of narrow / niche industry terms → broader alternatives that perform
 * better on Google Maps. Smoke-test data: "law firm" returns 1 result,
 * "lawyer" returns 20. Surfaced as a soft tip below the industry input when
 * the user types one of these terms, and as "Try instead" chips when a
 * search returns 0 results.
 */
const INDUSTRY_SYNONYMS: Record<string, string[]> = {
    "law firm": ["lawyer", "attorney", "legal services"],
    "law firms": ["lawyer", "attorney", "legal services"],
    "rose wholesaler": ["florist", "flower shop", "flower wholesaler"],
    "rose wholesalers": ["florist", "flower shop", "flower wholesaler"],
    "flower wholesaler": ["florist", "flower shop"],
    "flower wholesalers": ["florist", "flower shop"],
    "real estate": ["real estate agent", "realtor", "real estate broker"],
    "tax preparer": ["accountant", "tax service", "CPA"],
    "tax preparers": ["accountant", "tax service", "CPA"],
    "doctor": ["medical clinic", "physician", "primary care"],
    "doctors": ["medical clinic", "physician", "primary care"],
    "psychologist": ["therapist", "counselor", "mental health"],
    "psychologists": ["therapist", "counselor", "mental health"],
    "general contractor": ["contractor", "construction company", "builder"],
    "general contractors": ["contractor", "construction company", "builder"],
    "barber": ["barbershop", "hair salon"],
    "stylist": ["hair salon", "barbershop", "beauty salon"],
    "vet": ["veterinarian", "animal hospital", "pet clinic"],
    "vets": ["veterinarian", "animal hospital", "pet clinic"],
    "music teacher": ["music school", "music lessons"],
    "music teachers": ["music school", "music lessons"],
    "tutor": ["tutoring service", "tutoring center", "learning center"],
    "tutors": ["tutoring service", "tutoring center", "learning center"],
    "wedding planner": ["wedding venue", "event planner", "wedding services"],
    "wedding planners": ["wedding venue", "event planner", "wedding services"],
};

function suggestIndustrySynonyms(industry: string): string[] {
    const key = industry.trim().toLowerCase();
    return INDUSTRY_SYNONYMS[key] ?? [];
}

const FIELD_OPTIONS = [
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "name", label: "Business name" },
    { id: "address", label: "Address" },
    { id: "website", label: "Website" },
    { id: "rating", label: "Rating / reviews" },
] as const;

type FieldId = typeof FIELD_OPTIONS[number]["id"];

interface ScrapedContact {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
    leadScore?: number;
    isDuplicate?: boolean;   // already in user's contacts table
    alreadySeen?: boolean;   // returned by a previous scrape (in scrapedLeads history)
    verified?: boolean;
}

type DataSource = 'real_scraper' | 'ai_generated' | 'error' | 'unknown';
type SearchMode = 'structured' | 'typed';

function ScraperPage() {
    // Structured form state
    const [industry, setIndustry] = useState("");
    const [locationDraft, setLocationDraft] = useState("");
    const [locations, setLocations] = useState<string[]>([]);
    const [leadCount, setLeadCount] = useState<10 | 25 | 50 | 100>(25);
    const [selectedFields, setSelectedFields] = useState<Set<FieldId>>(
        new Set(["email", "phone", "name", "address", "website"])
    );
    const [verifyEmails, setVerifyEmails] = useState(true);

    // Typed (legacy) mode
    const [prompt, setPrompt] = useState("");
    const [searchMode, setSearchMode] = useState<SearchMode>('structured');

    // Shared state
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<ScrapedContact[]>([]);
    const [dataSource, setDataSource] = useState<DataSource>('unknown');
    const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
    const [importing, setImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSearchHistory, setShowSearchHistory] = useState(false);

    // For batch assignment
    const batches = useAuthQuery(api.batches.list);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [showNewBatchInput, setShowNewBatchInput] = useState(false);
    const [newBatchName, setNewBatchName] = useState("");
    const createContacts = useAuthMutation(api.contacts.bulkCreate);
    const createBatch = useAuthMutation(api.batches.create);

    // Search history
    const searchHistory = useAuthQuery(api.leadSearches.list);
    const saveSearch = useAuthMutation(api.leadSearches.create);
    const clearSearchHistory = useAuthMutation(api.leadSearches.clearAll);

    // Persistent scrape history (server-side dedup + history table source).
    const seenEmailsList = useAuthQuery(api.scrapedLeads.getSeenEmails);
    const seenEmails = useMemo(() => new Set(seenEmailsList ?? []), [seenEmailsList]);
    const upsertScraped = useAuthMutation(api.scrapedLeads.bulkUpsert);
    const markScrapedImported = useAuthMutation(api.scrapedLeads.markImported);

    // Durable scrape jobs — every search creates a Convex job that runs in
    // an action and writes progress reactively. Surviving page refresh +
    // multi-job concurrency + cancellation all fall out of this design.
    const createScrapeJob = useAuthMutation(api.scrapeJobs.create);
    const cancelScrapeJob = useAuthMutation(api.scrapeJobs.cancel);
    const [currentJobId, setCurrentJobId] = useState<Id<"scrapeJobs"> | null>(null);
    const currentJob = useAuthQuery(
        api.scrapeJobs.get,
        currentJobId ? { jobId: currentJobId } : "skip"
    );
    const recentJobs = useAuthQuery(api.scrapeJobs.listRecent);

    // Existing contacts for duplicate detection + scraper-side skipping.
    const existingContacts = useAuthQuery(api.contacts.list, {});
    const existingEmails = useMemo(() => {
        return new Set(existingContacts?.map(c => c.email.toLowerCase()) || []);
    }, [existingContacts]);
    /**
     * Domains derived from the user's contacts. Sent to /api/scrape-leads so
     * the backend can skip these businesses BEFORE the per-website crawl —
     * saves real time and means the user never sees leads they already have.
     * Combines email-domain + website-hostname so we cover both.
     */
    const existingDomains = useMemo(() => {
        const set = new Set<string>();
        for (const c of existingContacts ?? []) {
            // Domain from email
            const emailDomain = c.email?.split("@")[1]?.toLowerCase().trim();
            if (emailDomain && emailDomain !== "gmail.com" && emailDomain !== "yahoo.com" && emailDomain !== "hotmail.com" && emailDomain !== "outlook.com" && emailDomain !== "aol.com") {
                set.add(emailDomain);
            }
            // Domain from website (if contact has one)
            const website = (c as { website?: string }).website?.trim();
            if (website) {
                try {
                    const host = new URL(website.startsWith("http") ? website : `https://${website}`).hostname;
                    set.add(host.replace(/^www\./, "").toLowerCase());
                } catch { /* skip malformed URLs */ }
            }
        }
        return Array.from(set);
    }, [existingContacts]);

    // Toggle: hide leads the user has already seen in any past scrape.
    // Default ON — most users want only fresh leads.
    const [hideAlreadySeen, setHideAlreadySeen] = useState(true);

    // Live SSE state — populated as the scraper streams progress events.
    interface LiveLog { id: string; elapsedMs: number; level: string; text: string }
    const [liveLogs, setLiveLogs] = useState<LiveLog[]>([]);
    const [liveLeadsFound, setLiveLeadsFound] = useState(0);
    const [livePhase, setLivePhase] = useState<{ idx: number; label: string } | null>(null);
    // Mute toggle for sound effects, persisted across visits.
    const [soundMuted, setSoundMuted] = useState<boolean>(true);
    useEffect(() => {
        try {
            const saved = localStorage.getItem("scraper:soundMuted");
            if (saved !== null) setSoundMuted(saved === "true");
        } catch { /* localStorage unavailable */ }
    }, []);
    useEffect(() => {
        try { localStorage.setItem("scraper:soundMuted", String(soundMuted)); } catch { /* */ }
    }, [soundMuted]);

    // Sortable + filterable table state (industry-standard scraper UX).
    type SortKey = 'score' | 'name' | 'state' | 'reviews';
    type FilterChip = 'all' | 'verified' | 'has-email' | 'high-score' | 'new-only';
    const [sortKey, setSortKey] = useState<SortKey>('score');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [filterChip, setFilterChip] = useState<FilterChip>('all');
    const [detailContact, setDetailContact] = useState<ScrapedContact | null>(null);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    // Check for duplicates in results
    const duplicateCount = useMemo(() => {
        return results.filter(r => existingEmails.has(r.email.toLowerCase())).length;
    }, [results, existingEmails]);

    const alreadySeenCount = useMemo(() => {
        return results.filter(r => r.alreadySeen).length;
    }, [results]);

    /**
     * Apply hideAlreadySeen + filter chip + sort, preserving the original
     * index from `results` so selection-set membership stays stable across
     * filter/sort changes.
     */
    const visibleRows = useMemo(() => {
        let rows = results.map((c, i) => ({ c, i }));
        if (hideAlreadySeen) rows = rows.filter(({ c }) => !c.alreadySeen);
        if (filterChip === 'verified') rows = rows.filter(({ c }) => c.verified);
        if (filterChip === 'has-email') rows = rows.filter(({ c }) => !!c.email && !c.email.startsWith('unknown@'));
        if (filterChip === 'high-score') rows = rows.filter(({ c }) => (c.leadScore ?? 0) >= 7);
        if (filterChip === 'new-only') rows = rows.filter(({ c }) => !c.alreadySeen && !c.isDuplicate);

        rows.sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'score') cmp = (a.c.leadScore ?? 0) - (b.c.leadScore ?? 0);
            else if (sortKey === 'name') cmp = (a.c.name || a.c.company || a.c.email).localeCompare(b.c.name || b.c.company || b.c.email);
            else if (sortKey === 'state') cmp = (a.c.location || '').localeCompare(b.c.location || '');
            else if (sortKey === 'reviews') cmp = (a.c.leadScore ?? 0) - (b.c.leadScore ?? 0);
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return rows;
    }, [results, hideAlreadySeen, filterChip, sortKey, sortDir]);

    const canSearchStructured = industry.trim().length > 0 && locations.length > 0 && selectedFields.size > 0;
    const canSearchTyped = prompt.trim().length > 0;
    const canSearch = searchMode === 'structured' ? canSearchStructured : canSearchTyped;

    const addLocation = (raw: string) => {
        const cleaned = raw.trim().replace(/,$/, "").trim();
        if (!cleaned) return;
        if (locations.includes(cleaned)) return;
        setLocations(prev => [...prev, cleaned]);
        setLocationDraft("");
    };

    const removeLocation = (loc: string) => {
        setLocations(prev => prev.filter(l => l !== loc));
    };

    /**
     * Bulk-add up to 5 top cities for a state, replacing the state chip if it
     * was already added. Powers the "Use top cities" auto-suggest.
     */
    const expandStateToCities = (stateKey: string) => {
        const cities = STATE_TOP_CITIES[stateKey] ?? [];
        if (cities.length === 0) return;
        setLocations(prev => {
            const filtered = prev.filter(l => detectState(l) !== stateKey);
            const existing = new Set(filtered);
            const added = cities.filter(c => !existing.has(c));
            return [...filtered, ...added];
        });
        setLocationDraft("");
    };

    /** State key (lowercase) detected in either the current draft or any chip — used to render the auto-suggest panel. */
    const detectedStateKey =
        detectState(locationDraft) ??
        locations.map(detectState).find(s => s !== null) ??
        null;
    const detectedStateLabel = detectedStateKey
        ? detectedStateKey.replace(/\b\w/g, c => c.toUpperCase())
        : null;
    const detectedStateCities = detectedStateKey ? STATE_TOP_CITIES[detectedStateKey] ?? [] : [];

    const toggleField = (id: FieldId) => {
        setSelectedFields(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const buildSearchSummary = (): string => {
        if (searchMode === 'typed') return prompt.trim();
        return `${leadCount} ${industry.trim()} in ${locations.join(", ")}`;
    };

    /**
     * Soft Web Audio synth — short envelopes, no external assets.
     * Different cue per event so the user can tell phase changes apart from
     * new leads landing. Lazily instantiates an AudioContext (browsers
     * require a user-gesture before audio works; the search button counts).
     */
    const audioCtxRef = useRef<AudioContext | null>(null);
    const playSound = (kind: "phase" | "lead") => {
        if (soundMuted || typeof window === "undefined") return;
        try {
            if (!audioCtxRef.current) {
                const Ctx = (window.AudioContext ||
                    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
                if (!Ctx) return;
                audioCtxRef.current = new Ctx();
            }
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startFreq = kind === "phase" ? 660 : 980;
            const endFreq = kind === "phase" ? 880 : 1320;
            const now = ctx.currentTime;
            osc.type = "sine";
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.06);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(kind === "phase" ? 0.06 : 0.04, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch { /* silent */ }
    };

    const handleSearch = async () => {
        if (!canSearch) return;
        setIsSearching(true);
        setError(null);
        setResults([]);
        setImportSuccess(null);
        setLiveLogs([]);
        setLiveLeadsFound(0);
        setLivePhase(null);

        try {
            const jobArgs = searchMode === 'structured'
                ? {
                    industry: industry.trim(),
                    locations,
                    count: leadCount,
                    fields: Array.from(selectedFields),
                    verifyEmails,
                    excludeDomains: existingDomains,
                    excludeEmails: Array.from(existingEmails),
                }
                : {
                    prompt: prompt.trim(),
                    count: leadCount,
                    excludeDomains: existingDomains,
                    excludeEmails: Array.from(existingEmails),
                };

            // Create a durable scrape job. The `create` mutation inserts a
            // queued row and schedules the runScrape action — we then watch
            // the job via the reactive query hook (currentJob below) and
            // render its state. Surviving page refresh comes for free since
            // the job lives in Convex.
            const newJobId = await createScrapeJob(jobArgs);
            setCurrentJobId(newJobId);
            // Note: NOT awaiting completion here. The reactive useEffect
            // below picks up status transitions and finalizes the search.
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to start scrape");
            setIsSearching(false);
        }
    };

    /**
     * React to currentJob status transitions. Drives the live UI from the
     * reactive Convex subscription, finalizes results when the job completes,
     * surfaces error/cancelled states.
     */
    useEffect(() => {
        if (!currentJob) return;
        // Mirror live progress from the job into the animation state.
        setLiveLeadsFound(currentJob.leadsCount);
        if (currentJob.phaseIdx !== undefined && currentJob.phaseLabel) {
            setLivePhase({ idx: currentJob.phaseIdx, label: currentJob.phaseLabel });
        }
        if (currentJob.logs) {
            setLiveLogs(
                currentJob.logs.map((l, i) => ({
                    id: `${currentJob._id}-${i}`,
                    elapsedMs: l.elapsedMs,
                    level: l.level,
                    text: l.text,
                }))
            );
        }
        // Live leads in table — populate results as they accumulate so the
        // table is already filled when the overlay clears. Annotate against
        // contacts/seen on the fly so badges are correct from the start.
        if (currentJob.status === "running" && currentJob.leads && currentJob.leads.length > 0) {
            const liveAnnotated: ScrapedContact[] = currentJob.leads.map((l) => ({
                email: l.email,
                name: l.name,
                company: l.company,
                phone: l.phone,
                location: l.location,
                website: l.website,
                address: l.address,
                leadScore: l.leadScore,
                verified: l.verified,
                isDuplicate: existingEmails.has(l.email.toLowerCase()),
                alreadySeen: seenEmails.has(l.email.toLowerCase()),
            }));
            setResults(liveAnnotated);
        }
        if (currentJob.status === "running") {
            playSound("phase"); // soft cue when phase changes — playSound is debounced internally
        }

        if (currentJob.status === "complete") {
            const finalContacts: ScrapedContact[] = (currentJob.leads ?? []).map((l) => ({
                email: l.email,
                name: l.name,
                company: l.company,
                phone: l.phone,
                location: l.location,
                website: l.website,
                address: l.address,
                leadScore: l.leadScore,
                verified: l.verified,
            }));
            void finalizeJob({
                contacts: finalContacts,
                source: currentJob.source ?? "real_scraper",
                totalScraped: currentJob.totalScraped,
                jobIndustry: currentJob.industry,
                jobLocations: currentJob.locations ?? [],
            });
        } else if (currentJob.status === "failed") {
            setError(currentJob.errorMessage || "Scrape failed.");
            setIsSearching(false);
            setCurrentJobId(null);
        } else if (currentJob.status === "cancelled") {
            setError("Scrape cancelled.");
            setIsSearching(false);
            setCurrentJobId(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentJob?._id, currentJob?.status, currentJob?.leadsCount, currentJob?.phaseIdx, currentJob?.logs?.length]);

    /** Materialize a completed job into the results table + run dedup + history writes. */
    const finalizeJob = async (args: {
        contacts: ScrapedContact[];
        source: string;
        totalScraped?: number;
        jobIndustry?: string;
        jobLocations: string[];
    }) => {
        const { contacts, source, jobIndustry, jobLocations } = args;
        setDataSource(source as DataSource);
        setIsSearching(false);
        setCurrentJobId(null);

        if (contacts.length === 0) {
            const reason = source === "error"
                ? "Scraper returned no leads. The Railway scraper may need a restart, or no businesses matched your criteria."
                : "No leads found for this query. Try a broader location or a different industry.";
            setError(reason);
            setResults([]);
            setSelectedContacts(new Set());
            try {
                await saveSearch({
                    prompt: buildSearchSummary(),
                    resultsCount: 0,
                    failureReason: reason.slice(0, 500),
                    industry: jobIndustry || undefined,
                    locations: jobLocations.length > 0 ? jobLocations : undefined,
                });
            } catch { /* */ }
            return;
        }
        const contactsAnnotated: ScrapedContact[] = contacts.map((c) => ({
            ...c,
            isDuplicate: existingEmails.has(c.email.toLowerCase()),
            alreadySeen: seenEmails.has(c.email.toLowerCase()),
        }));

        setResults(contactsAnnotated);

        // Auto-select only leads that are BOTH new (not seen before) AND
        // not already in contacts. The user can override per-row.
        const autoSelectIndices = contactsAnnotated
            .map((c, i) => (c.isDuplicate || c.alreadySeen ? -1 : i))
            .filter((i) => i >= 0);
        setSelectedContacts(new Set(autoSelectIndices));

        // Persist to scrape history. Refreshes existing rows; inserts new
        // ones. This is the source of truth for the /scraper/history page
        // and the dedup check on subsequent searches.
        try {
            await upsertScraped({
                leads: contactsAnnotated.map((c) => ({
                    email: c.email,
                    name: c.name,
                    company: c.company,
                    phone: c.phone,
                    address: c.address,
                    state: c.location,
                    website: c.website,
                    leadScore: c.leadScore,
                    verified: c.verified,
                })),
                industry: jobIndustry || undefined,
                searchLocation: jobLocations.join(", ") || undefined,
            });
        } catch (e) {
            console.error("[scraper] failed to persist scrape history:", e);
        }

        if (contacts.length > 0) {
            await saveSearch({
                prompt: buildSearchSummary(),
                resultsCount: contacts.length,
                industry: jobIndustry || undefined,
                locations: jobLocations.length > 0 ? jobLocations : undefined,
            });
        }
    };

    const toggleContact = (index: number) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedContacts(newSelected);
    };

    const toggleAll = () => {
        if (selectedContacts.size === results.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(results.map((_, i) => i)));
        }
    };

    const handleImport = async () => {
        if (selectedContacts.size === 0) return;
        setImporting(true);
        setError(null);

        try {
            // Create new batch if needed
            let batchId: Id<"batches"> | undefined = undefined;
            if (showNewBatchInput && newBatchName.trim()) {
                batchId = await createBatch({ name: newBatchName.trim() });
            } else if (selectedBatchId) {
                batchId = selectedBatchId as Id<"batches">;
            }

            const contactsToImport = results
                .filter((_, i) => selectedContacts.has(i))
                .map(c => ({
                    email: c.email,
                    name: c.name,
                    company: c.company,
                    phone: c.phone,
                    location: c.location,
                    website: c.website,
                    address: c.address,
                }));

            await createContacts({
                contacts: contactsToImport,
                batchId,
            });

            // Flag imported leads in scrape history so the history view shows
            // which ones graduated into the contacts table.
            try {
                await markScrapedImported({
                    emails: contactsToImport.map((c) => c.email),
                });
            } catch (e) {
                console.error("[scraper] failed to mark imported in history:", e);
            }

            setImportSuccess(contactsToImport.length);
            setResults([]);
            setSelectedContacts(new Set());
            setPrompt("");
            setNewBatchName("");
            setShowNewBatchInput(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to import contacts");
        } finally {
            setImporting(false);
        }
    };

    return (
        <>
            {results.length > 0 && selectedContacts.size > 0 && (
                <PrintableLeads
                    rows={results.filter((_, i) => selectedContacts.has(i))}
                    fields={selectedFields}
                    industry={industry || prompt}
                    locations={locations}
                />
            )}
            <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 md:pb-0 print:hidden">
            {/* Robot Animation Overlay — wrapped in AnimatePresence so the
                exit fade actually plays when isSearching flips false. */}
            <AnimatePresence>
                {isSearching && (
                    <LeadSearchAnimation
                        isActive={isSearching}
                        prompt={buildSearchSummary()}
                        industry={industry}
                        locations={locations}
                        liveLogs={liveLogs}
                        liveLeadsFound={liveLeadsFound}
                        livePhase={livePhase}
                        liveLeads={(currentJob?.leads ?? []).map((l) => ({ state: l.location }))}
                        soundMuted={soundMuted}
                        onToggleSound={() => setSoundMuted(m => !m)}
                        onPing={() => playSound("lead")}
                        canCancel={!!currentJobId}
                        onCancel={async () => {
                            if (!currentJobId) return;
                            try {
                                await cancelScrapeJob({ jobId: currentJobId });
                            } catch (e) {
                                console.error("[scraper] cancel failed:", e);
                            }
                        }}
                    />
                )}
            </AnimatePresence>

            <AppHeader />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8 relative">
                    {/* Live status pill — top-left */}
                    <div className="absolute top-1 left-0 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                        <span className="relative flex w-2 h-2">
                            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                            <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                        </span>
                        <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">
                            Scraper online
                        </span>
                    </div>

                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] mb-4 shadow-lg shadow-[#8B5CF6]/25 relative overflow-hidden">
                        <span className="text-3xl relative z-10">🤖</span>
                        {/* Subtle animated shimmer behind the icon */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/30 to-white/0 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#0f172a] dark:text-white mb-2">
                        AI Lead Scraper
                    </h1>
                    <p className="text-[#9CA3AF]">
                        Pick the leads you want — industry, location, fields — and we&apos;ll find them.
                    </p>
                    <a
                        href="/scraper/history"
                        className="absolute top-0 right-0 px-3 py-1.5 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 hover:border-[#8B5CF6]/40 rounded-lg text-sm font-medium text-[#4B5563] dark:text-slate-300 hover:text-[#8B5CF6] transition-colors hover:shadow-md hover:shadow-[#8B5CF6]/10"
                    >
                        📚 History
                    </a>
                </div>

                {/* Recent jobs panel — surfaces in-flight + recently completed
                    scrapes so the user can re-attach to one or jump back to a
                    completed run's results without re-running. */}
                {recentJobs && recentJobs.length > 0 && (
                    <div className="mb-6">
                        <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Recent Searches</span>
                            {recentJobs.some((j) => j.status === "running" || j.status === "queued") && (
                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 normal-case tracking-normal">
                                    <span className="relative flex w-1.5 h-1.5">
                                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                                        <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    </span>
                                    {recentJobs.filter((j) => j.status === "running" || j.status === "queued").length} in flight
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {recentJobs.slice(0, 6).map((job) => {
                                const isInFlight = job.status === "running" || job.status === "queued";
                                const isComplete = job.status === "complete";
                                const isFailed = job.status === "failed" || job.status === "cancelled";
                                const summary = job.industry
                                    ? `${job.count} ${job.industry}`
                                    : (job.prompt?.slice(0, 40) ?? "Search");
                                const locsLabel = job.locations?.slice(0, 2).join(", ") || "";
                                return (
                                    <button
                                        key={job._id}
                                        onClick={() => {
                                            if (isInFlight) {
                                                setCurrentJobId(job._id);
                                                setIsSearching(true);
                                            } else if (isComplete) {
                                                // Reload its leads into the results table.
                                                const liveAnnotated: ScrapedContact[] = (job.leads ?? []).map((l) => ({
                                                    email: l.email,
                                                    name: l.name,
                                                    company: l.company,
                                                    phone: l.phone,
                                                    location: l.location,
                                                    website: l.website,
                                                    address: l.address,
                                                    leadScore: l.leadScore,
                                                    verified: l.verified,
                                                    isDuplicate: existingEmails.has(l.email.toLowerCase()),
                                                    alreadySeen: seenEmails.has(l.email.toLowerCase()),
                                                }));
                                                setResults(liveAnnotated);
                                                setSelectedContacts(new Set(liveAnnotated.map((c, i) => (c.isDuplicate || c.alreadySeen) ? -1 : i).filter(i => i >= 0)));
                                                setDataSource((job.source as DataSource) ?? "unknown");
                                            }
                                        }}
                                        className={`flex-shrink-0 px-3 py-2 rounded-lg border text-left transition-all ${
                                            isInFlight
                                                ? "bg-violet-500/10 border-violet-500/40 hover:bg-violet-500/15"
                                                : isFailed
                                                    ? "bg-rose-500/5 border-rose-500/30 hover:bg-rose-500/10"
                                                    : "bg-white dark:bg-slate-900 border-[#E5E7EB] dark:border-slate-700 hover:border-[#8B5CF6]/40"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                                                isInFlight ? "text-violet-500" :
                                                isComplete ? "text-emerald-600 dark:text-emerald-400" :
                                                "text-rose-500"
                                            }`}>
                                                {isInFlight && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <span className="relative flex w-1.5 h-1.5">
                                                            <span className="absolute inset-0 rounded-full bg-violet-400 animate-ping opacity-75" />
                                                            <span className="relative w-1.5 h-1.5 rounded-full bg-violet-400" />
                                                        </span>
                                                        {job.status}
                                                    </span>
                                                )}
                                                {isComplete && `✓ ${job.leadsCount}`}
                                                {isFailed && `✕ ${job.status}`}
                                            </span>
                                        </div>
                                        <div className="text-xs font-medium text-[#0f172a] dark:text-white truncate max-w-[180px]">
                                            {summary}
                                        </div>
                                        {locsLabel && (
                                            <div className="text-[10px] text-[#9CA3AF] truncate max-w-[180px]">
                                                {locsLabel}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Structured Search Form */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm p-6 mb-6 space-y-6">
                    {/* Industry */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0f172a] dark:text-white mb-2">
                            Industry <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                            type="text"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="e.g. dentists, restaurants, plumbers…"
                            className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-[#0891b2]/20 text-[#0f172a] dark:text-white placeholder:text-[#9CA3AF] transition-all"
                        />
                        {suggestIndustrySynonyms(industry).length > 0 && (
                            <div className="mt-2 p-3 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-xl text-xs text-[#92400E]">
                                <div className="mb-1.5">
                                    💡 <strong>&ldquo;{industry}&rdquo;</strong> is a narrow term — Google Maps returns few results for it. Try one of these instead:
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {suggestIndustrySynonyms(industry).map((alt) => (
                                        <button
                                            key={alt}
                                            onClick={() => setIndustry(alt)}
                                            className="px-2.5 py-1 bg-white border border-[#F59E0B]/40 hover:bg-[#FEF3C7] hover:border-[#F59E0B] rounded-md text-xs font-medium text-[#92400E] transition-all"
                                        >
                                            {alt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {INDUSTRY_SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setIndustry(s.toLowerCase())}
                                    className="px-2.5 py-1 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/5 rounded-md text-xs text-[#4B5563] dark:text-slate-300 hover:text-[#8B5CF6] transition-all"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Locations */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0f172a] dark:text-white mb-2">
                            Locations <span className="text-[#EF4444]">*</span>
                            <span className="ml-2 text-xs font-normal text-[#9CA3AF]">ZIP code or &ldquo;City, ST&rdquo; — press Enter to add</span>
                        </label>
                        <input
                            type="text"
                            value={locationDraft}
                            onChange={(e) => setLocationDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
                                    if (locationDraft.trim()) {
                                        e.preventDefault();
                                        addLocation(locationDraft);
                                    }
                                }
                            }}
                            onBlur={() => locationDraft.trim() && addLocation(locationDraft)}
                            placeholder='e.g. 90001, Houston, TX, "Chicago, IL"'
                            className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-[#0891b2]/20 text-[#0f172a] dark:text-white placeholder:text-[#9CA3AF] transition-all"
                        />
                        {locations.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {locations.map((loc) => {
                                    const broad = locationIsTooBroad(loc);
                                    return (
                                        <span
                                            key={loc}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-sm font-medium ${
                                                broad
                                                    ? "bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#92400E]"
                                                    : "bg-[#0891b2]/10 border-[#0891b2]/30 text-[#0891b2]"
                                            }`}
                                            title={broad ? "This location is too broad — Google Maps needs a city or ZIP" : undefined}
                                        >
                                            {broad ? "⚠️" : "📍"} {loc}
                                            <button
                                                onClick={() => removeLocation(loc)}
                                                className={broad ? "ml-0.5 text-[#92400E]/60 hover:text-[#92400E]" : "ml-0.5 text-[#0891b2]/60 hover:text-[#0891b2]"}
                                                aria-label={`Remove ${loc}`}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        {locations.some(locationIsTooBroad) && (
                            <div className="mt-2 text-xs text-[#92400E] bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-lg px-3 py-2">
                                <strong>Heads up:</strong> entire states or country names rarely return results. Use a city (&ldquo;Los Angeles, CA&rdquo;) or ZIP (&ldquo;90001&rdquo;) to anchor the search.
                            </div>
                        )}

                        {/* State auto-suggest — fires when draft or an existing chip looks like a state */}
                        {detectedStateKey && detectedStateCities.length > 0 && (
                            <div className="mt-2 p-3 bg-gradient-to-r from-[#8B5CF6]/5 to-[#A855F7]/5 border border-[#8B5CF6]/30 rounded-xl">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="text-sm text-[#0f172a] dark:text-white">
                                        ✨ <strong>{detectedStateLabel}</strong> is a state — Maps needs cities. Want the top {detectedStateCities.length}?
                                    </div>
                                    <button
                                        onClick={() => expandStateToCities(detectedStateKey)}
                                        className="px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#A855F7] rounded-lg text-xs font-semibold text-white transition-colors flex-shrink-0"
                                    >
                                        Add all {detectedStateCities.length}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {detectedStateCities.map((city) => {
                                        const already = locations.includes(city);
                                        return (
                                            <button
                                                key={city}
                                                onClick={() => already ? removeLocation(city) : addLocation(city)}
                                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                                                    already
                                                        ? "bg-[#0891b2]/10 border-[#0891b2]/30 text-[#0891b2]"
                                                        : "bg-white dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-700 text-[#4B5563] dark:text-slate-300 hover:border-[#8B5CF6]/40"
                                                }`}
                                            >
                                                {already ? "✓ " : "+ "}{city}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lead count */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0f172a] dark:text-white mb-2">
                            How many leads?
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {([10, 25, 50, 100] as const).map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setLeadCount(n)}
                                    className={`py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                                        leadCount === n
                                            ? "bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white border-transparent shadow-md shadow-[#8B5CF6]/20"
                                            : "bg-[#f8fafc] dark:bg-slate-800 text-[#4B5563] dark:text-slate-300 border-[#E5E7EB] dark:border-slate-700 hover:border-[#8B5CF6]/40"
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        {leadCount > 60 * Math.max(locations.length, 1) && (
                            <div className="mt-2 text-xs text-[#92400E] bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-lg px-3 py-2">
                                <strong>Heads up:</strong> Google Maps caps results at ~60 per location. To get {leadCount} leads, add {Math.ceil(leadCount / 60) - Math.max(locations.length, 1)} more location{Math.ceil(leadCount / 60) - Math.max(locations.length, 1) > 1 ? "s" : ""} (or accept fewer than {leadCount} returned).
                            </div>
                        )}
                    </div>

                    {/* Fields */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0f172a] dark:text-white mb-2">
                            What to scrape
                            <span className="ml-2 text-xs font-normal text-[#9CA3AF]">at least one</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {FIELD_OPTIONS.map((f) => {
                                const checked = selectedFields.has(f.id);
                                return (
                                    <button
                                        key={f.id}
                                        onClick={() => toggleField(f.id)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                            checked
                                                ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/40 text-[#8B5CF6]"
                                                : "bg-[#f8fafc] dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-700 text-[#4B5563] dark:text-slate-300 hover:border-[#8B5CF6]/30"
                                        }`}
                                    >
                                        <span className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                                            checked ? "bg-[#8B5CF6] text-white" : "border border-[#E5E7EB] dark:border-slate-600"
                                        }`}>
                                            {checked && "✓"}
                                        </span>
                                        {f.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Email verification toggle (only relevant when email field is selected) */}
                    {selectedFields.has("email") && (
                        <div className="flex items-center justify-between p-3 bg-[#f8fafc] dark:bg-slate-800 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
                            <div>
                                <div className="text-sm font-semibold text-[#0f172a] dark:text-white">Verify emails</div>
                                <div className="text-xs text-[#9CA3AF]">MX-record check. Slower but filters dead inboxes.</div>
                            </div>
                            <button
                                onClick={() => setVerifyEmails(!verifyEmails)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                    verifyEmails ? "bg-[#10B981]" : "bg-[#E5E7EB] dark:bg-slate-700"
                                }`}
                                aria-label="Toggle email verification"
                            >
                                <span
                                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                        verifyEmails ? "translate-x-6" : "translate-x-0.5"
                                    }`}
                                />
                            </button>
                        </div>
                    )}

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !canSearch}
                        className="w-full py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:shadow-lg hover:shadow-[#8B5CF6]/25 rounded-xl font-semibold text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSearching ? "Searching…" : `🚀 Find ${leadCount} ${industry ? industry : "leads"}`}
                    </button>

                    {/* Bottom utility bar: typed mode + history */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F1F3F8] dark:border-slate-800">
                        <button
                            onClick={() => setSearchMode('typed')}
                            className="text-sm text-[#8B5CF6] hover:text-[#A855F7] font-medium flex items-center gap-1"
                        >
                            ✏️ Prefer to type your request? →
                        </button>
                        {searchHistory && searchHistory.length > 0 && (
                            <button
                                onClick={() => setShowSearchHistory(!showSearchHistory)}
                                className="px-3 py-1.5 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 rounded-lg text-sm text-[#8B5CF6] font-medium transition-colors"
                            >
                                🕐 History ({searchHistory.length})
                            </button>
                        )}
                    </div>

                    {/* Search History Panel */}
                    {showSearchHistory && searchHistory && searchHistory.length > 0 && (
                        <div className="p-4 bg-[#f8fafc] dark:bg-slate-800 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-[#0f172a] dark:text-white">Recent Searches</span>
                                <button
                                    onClick={async () => {
                                        await clearSearchHistory({});
                                        setShowSearchHistory(false);
                                    }}
                                    className="text-xs text-[#EF4444] hover:text-[#DC2626] font-medium"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {searchHistory.map((search) => (
                                    <button
                                        key={search._id}
                                        onClick={() => {
                                            setPrompt(search.prompt);
                                            setSearchMode('typed');
                                            setShowSearchHistory(false);
                                        }}
                                        className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 hover:border-[#0891b2]/30 hover:shadow-sm transition-all"
                                    >
                                        <div className="text-sm font-medium text-[#0f172a] dark:text-white truncate">{search.prompt}</div>
                                        <div className="text-xs text-[#9CA3AF] flex items-center gap-2 mt-1">
                                            <span>{search.resultsCount} leads found</span>
                                            <span>•</span>
                                            <span>{new Date(search.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Typed-mode slide-over */}
                {searchMode === 'typed' && (
                    <div className="fixed inset-0 z-50 flex">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setSearchMode('structured')}
                        />
                        {/* Panel */}
                        <div className="ml-auto h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto relative animate-in slide-in-from-right duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">Type Your Request</h2>
                                <button
                                    onClick={() => setSearchMode('structured')}
                                    className="text-[#9CA3AF] hover:text-[#0f172a] dark:hover:text-white text-2xl leading-none"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                            <p className="text-sm text-[#9CA3AF] mb-4">
                                Describe what you want in your own words. Include a location (ZIP or city) for best results.
                            </p>
                            <div className="relative mb-4">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. Find me 25 dentists in Houston 77001"
                                    className="w-full h-40 px-4 py-3 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0891b2] focus:ring-2 focus:ring-[#0891b2]/20 resize-none text-[#0f172a] dark:text-white placeholder:text-[#9CA3AF] transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                            handleSearch();
                                        }
                                    }}
                                    autoFocus
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-[#9CA3AF]">⌘ + Enter</div>
                            </div>
                            <div className="mb-4">
                                <div className="text-xs text-[#9CA3AF] mb-2 font-medium">Examples:</div>
                                <div className="flex flex-col gap-2">
                                    {EXAMPLE_PROMPTS.map((ex, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPrompt(ex)}
                                            className="text-left px-3 py-2 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 hover:border-[#0891b2]/30 rounded-lg text-sm text-[#4B5563] dark:text-slate-300 transition-all"
                                        >
                                            {ex}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isSearching || !canSearchTyped}
                                className="w-full py-3 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:shadow-lg hover:shadow-[#8B5CF6]/25 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSearching ? "Searching…" : "🚀 Find Leads"}
                            </button>
                            <button
                                onClick={() => setSearchMode('structured')}
                                className="mt-3 w-full py-2 text-sm text-[#9CA3AF] hover:text-[#0f172a] dark:hover:text-white"
                            >
                                ← Back to structured search
                            </button>
                        </div>
                    </div>
                )}

                {/* Duplicate Warning */}
                {results.length > 0 && duplicateCount > 0 && (
                    <div className="mb-6 p-4 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-xl text-[#92400E] flex items-center gap-2">
                        <span>⚠️</span>
                        <span>
                            <strong>{duplicateCount}</strong> of {results.length} leads already exist in your contacts.
                            Duplicates are deselected by default.
                        </span>
                    </div>
                )}

                {/* Error — actionable, with retry */}
                {error && (
                    <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#EF4444]/30 rounded-xl text-[#DC2626]">
                        <div className="flex items-start gap-2 mb-2">
                            <span className="flex-shrink-0">⚠️</span>
                            <div className="text-sm font-medium">{error}</div>
                        </div>
                        <div className="ml-6 text-xs text-[#DC2626]/80 mb-3">
                            {error.toLowerCase().includes("timeout") || error.toLowerCase().includes("page crash") ? (
                                <>The scraper container may be cold-started. Wait 30 seconds and retry — it warms up after the first request.</>
                            ) : error.toLowerCase().includes("no businesses") || error.toLowerCase().includes("no leads") ? (
                                <>Try a broader location (city instead of ZIP), a more common industry term, or add a second location.</>
                            ) : (
                                <>If this keeps happening, check the Railway scraper status or use the &ldquo;Type&rdquo; mode for a free-text query.</>
                            )}
                        </div>
                        <div className="ml-6 flex items-center gap-2">
                            <button
                                onClick={() => { setError(null); handleSearch(); }}
                                className="px-3 py-1.5 bg-white hover:bg-[#FEF2F2] border border-[#EF4444]/40 rounded-lg text-xs font-medium text-[#DC2626] transition-colors"
                            >
                                ↻ Retry
                            </button>
                            <button
                                onClick={() => setError(null)}
                                className="px-3 py-1.5 text-xs font-medium text-[#DC2626]/70 hover:text-[#DC2626]"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* AI-generated warning — these are simulated leads, not real */}
                {results.length > 0 && dataSource === 'ai_generated' && (
                    <div className="mb-6 p-4 bg-[#FEF3C7] border border-[#F59E0B]/40 rounded-xl text-[#92400E] flex items-start gap-2">
                        <span className="flex-shrink-0">⚡</span>
                        <div className="text-sm">
                            <strong>These leads are AI-generated, not real businesses.</strong> The Scrapling service either failed or wasn&apos;t configured. Don&apos;t import these — fix the scraper first.
                        </div>
                    </div>
                )}

                {/* Success */}
                {importSuccess && (
                    <div className="mb-6 p-4 bg-[#ECFDF5] border border-[#10B981]/30 rounded-xl text-[#047857] flex items-center gap-2">
                        <span>✅</span>
                        Successfully imported {importSuccess} contacts!
                    </div>
                )}

                {/* Results — slide-in transition when results land after a scrape */}
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm overflow-hidden"
                    >
                        {/* Results Header */}
                        <div className="p-4 border-b border-[#E5E7EB] dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggleAll}
                                    className="p-1"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.size === results.length}
                                        onChange={toggleAll}
                                        className="w-4 h-4 rounded bg-[#F1F3F8] border-[#E5E7EB] text-[#0891b2] focus:ring-[#0891b2]"
                                    />
                                </button>
                                <span className="font-semibold text-[#0f172a] dark:text-white">
                                    Found {results.length}
                                    {searchMode === 'structured' && results.length < leadCount && (
                                        <span className="text-[#9CA3AF] font-normal"> of {leadCount} requested</span>
                                    )}
                                </span>
                                <span className="text-[#9CA3AF] text-sm">
                                    ({selectedContacts.size} selected)
                                </span>
                                {alreadySeenCount > 0 && (
                                    <button
                                        onClick={() => setHideAlreadySeen(v => !v)}
                                        className={`text-xs font-medium px-2 py-1 rounded-md border transition-colors ${
                                            hideAlreadySeen
                                                ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/40 text-[#8B5CF6]"
                                                : "bg-[#f8fafc] dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-700 text-[#9CA3AF] hover:text-[#0f172a]"
                                        }`}
                                        title="Toggle already-seen filter"
                                    >
                                        {hideAlreadySeen ? "👁️ Hidden" : "👁️ Showing"} {alreadySeenCount} seen
                                    </button>
                                )}
                                {/* Source Badge */}
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${dataSource === 'real_scraper'
                                    ? 'bg-[#10B981]/10 text-[#10B981]'
                                    : dataSource === 'ai_generated'
                                        ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                                        : 'bg-[#9CA3AF]/10 text-[#9CA3AF]'}`}>
                                    {dataSource === 'real_scraper' ? '✓ Real Data' : dataSource === 'ai_generated' ? '⚡ AI Generated' : 'Unknown'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Batch Selector */}
                                {showNewBatchInput ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newBatchName}
                                            onChange={(e) => setNewBatchName(e.target.value)}
                                            placeholder="New batch name..."
                                            className="px-3 py-1.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm w-40 focus:border-[#0891b2] focus:outline-none dark:text-white"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => {
                                                setShowNewBatchInput(false);
                                                setNewBatchName("");
                                            }}
                                            className="text-[#9CA3AF] hover:text-[#0f172a] text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedBatchId}
                                        onChange={(e) => {
                                            if (e.target.value === "__new__") {
                                                setShowNewBatchInput(true);
                                                setSelectedBatchId("");
                                            } else {
                                                setSelectedBatchId(e.target.value);
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm text-[#0f172a] dark:text-white focus:border-[#0891b2] focus:outline-none"
                                    >
                                        <option value="">No batch</option>
                                        <option value="__new__">➕ Create New Batch</option>
                                        {batches?.map((batch) => (
                                            <option key={batch._id} value={batch._id}>
                                                {batch.name}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {/* Export CSV — only includes ticked field columns */}
                                <button
                                    onClick={() => exportSelectedAsCsv(results, selectedContacts, selectedFields, industry, locations)}
                                    disabled={selectedContacts.size === 0}
                                    className="px-3 py-1.5 bg-[#F1F3F8] dark:bg-slate-800 hover:bg-[#E5E7EB] dark:hover:bg-slate-700 border border-[#E5E7EB] dark:border-slate-700 rounded-lg font-medium text-sm text-[#4B5563] dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    📥 CSV
                                </button>

                                {/* Print — uses an in-page print-only DOM (PrintableLeads below) */}
                                <button
                                    onClick={() => { if (typeof window !== "undefined") window.print(); }}
                                    disabled={selectedContacts.size === 0}
                                    className="px-3 py-1.5 bg-[#F1F3F8] dark:bg-slate-800 hover:bg-[#E5E7EB] dark:hover:bg-slate-700 border border-[#E5E7EB] dark:border-slate-700 rounded-lg font-medium text-sm text-[#4B5563] dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    🖨️ Print
                                </button>

                                {/* Import Button */}
                                <button
                                    onClick={handleImport}
                                    disabled={selectedContacts.size === 0 || importing || (showNewBatchInput && !newBatchName.trim())}
                                    className="px-4 py-1.5 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#10B981]/25"
                                >
                                    {importing ? "Importing..." : `Import ${selectedContacts.size}`}
                                </button>
                            </div>
                        </div>

                        {/* Filter chips bar */}
                        <div className="px-4 py-2.5 border-b border-[#E5E7EB] dark:border-slate-700 bg-[#fafbfc] dark:bg-slate-900 flex items-center gap-2 overflow-x-auto">
                            <span className="text-xs font-medium text-[#9CA3AF] flex-shrink-0">Filter:</span>
                            {([
                                { id: 'all', label: 'All', count: results.length },
                                { id: 'new-only', label: 'New only', count: results.filter(c => !c.alreadySeen && !c.isDuplicate).length },
                                { id: 'verified', label: 'Verified email', count: results.filter(c => c.verified).length },
                                { id: 'has-email', label: 'Has email', count: results.filter(c => !!c.email && !c.email.startsWith('unknown@')).length },
                                { id: 'high-score', label: 'Score ≥ 7', count: results.filter(c => (c.leadScore ?? 0) >= 7).length },
                            ] as const).map((chip) => (
                                <button
                                    key={chip.id}
                                    onClick={() => setFilterChip(chip.id as FilterChip)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex-shrink-0 ${
                                        filterChip === chip.id
                                            ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/40 text-[#8B5CF6]"
                                            : "bg-white dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-700 text-[#4B5563] dark:text-slate-300 hover:border-[#8B5CF6]/30"
                                    }`}
                                >
                                    {chip.label}
                                    <span className="ml-1 text-[10px] text-[#9CA3AF]">{chip.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Sortable table — industry-standard layout */}
                        <div className="max-h-[480px] overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-[#f8fafc] dark:bg-slate-800/95 backdrop-blur z-10 border-b border-[#E5E7EB] dark:border-slate-700">
                                    <tr>
                                        <th className="w-8 px-3 py-2.5"></th>
                                        {selectedFields.has("name") && (
                                            <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 min-w-[180px]">
                                                <SortHeader label="Business" active={sortKey === 'name'} dir={sortDir} onClick={() => toggleSort('name')} />
                                            </th>
                                        )}
                                        {selectedFields.has("email") && (
                                            <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 min-w-[180px]">Email</th>
                                        )}
                                        {selectedFields.has("phone") && (
                                            <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 min-w-[140px]">Phone</th>
                                        )}
                                        {selectedFields.has("address") && (
                                            <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 min-w-[100px]">
                                                <SortHeader label="State" active={sortKey === 'state'} dir={sortDir} onClick={() => toggleSort('state')} />
                                            </th>
                                        )}
                                        {selectedFields.has("website") && (
                                            <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 w-20">Site</th>
                                        )}
                                        {selectedFields.has("rating") && (
                                            <th className="text-center px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 w-20">
                                                <SortHeader label="Score" active={sortKey === 'score'} dir={sortDir} onClick={() => toggleSort('score')} />
                                            </th>
                                        )}
                                        <th className="text-left px-3 py-2.5 font-semibold text-[#4B5563] dark:text-slate-300 w-32">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1F3F8] dark:divide-slate-800">
                                    {visibleRows.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="text-center py-12 text-sm text-[#9CA3AF]">
                                                No leads match the current filter. Reset filters or adjust the search.
                                            </td>
                                        </tr>
                                    )}
                                    {visibleRows.map(({ c: contact, i }) => (
                                        <tr
                                            key={i}
                                            onClick={() => setDetailContact(contact)}
                                            className={`cursor-pointer hover:bg-[#f8fafc] dark:hover:bg-slate-800/60 transition-colors ${
                                                selectedContacts.has(i) ? "bg-[#0891b2]/5" : ""
                                            }`}
                                        >
                                            <td className="px-3 py-3" onClick={(e) => { e.stopPropagation(); toggleContact(i); }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContacts.has(i)}
                                                    onChange={() => toggleContact(i)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 rounded bg-[#F1F3F8] border-[#E5E7EB] text-[#0891b2] focus:ring-[#0891b2]"
                                                />
                                            </td>
                                            {selectedFields.has("name") && (
                                                <td className="px-3 py-3 max-w-[200px]">
                                                    <div className={`font-medium truncate ${!contact.name && !contact.company ? "italic text-[#9CA3AF]" : "text-[#0f172a] dark:text-white"}`}>
                                                        {contact.name || contact.company || "Name not found"}
                                                    </div>
                                                    {contact.company && contact.name && (
                                                        <div className="text-xs text-[#9CA3AF] truncate">{contact.company}</div>
                                                    )}
                                                </td>
                                            )}
                                            {selectedFields.has("email") && (
                                                <td className="px-3 py-3 max-w-[200px]">
                                                    <div className={`truncate text-xs ${
                                                        contact.email.startsWith("unknown@") ? "italic text-[#9CA3AF]" : "text-[#4B5563] dark:text-slate-300"
                                                    }`}>
                                                        {contact.email.startsWith("unknown@") ? "no email" : contact.email}
                                                    </div>
                                                </td>
                                            )}
                                            {selectedFields.has("phone") && (
                                                <td className="px-3 py-3 text-xs text-[#4B5563] dark:text-slate-300 whitespace-nowrap">
                                                    {contact.phone || <span className="text-[#CBD5E1] italic">—</span>}
                                                </td>
                                            )}
                                            {selectedFields.has("address") && (
                                                <td className="px-3 py-3 text-xs text-[#4B5563] dark:text-slate-300">
                                                    {contact.location || <span className="text-[#CBD5E1] italic">—</span>}
                                                </td>
                                            )}
                                            {selectedFields.has("website") && (
                                                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                                                    {contact.website ? (
                                                        <a
                                                            href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-[#0891b2] hover:underline whitespace-nowrap"
                                                        >
                                                            ↗ Visit
                                                        </a>
                                                    ) : (
                                                        <span className="text-[#CBD5E1] italic text-xs">—</span>
                                                    )}
                                                </td>
                                            )}
                                            {selectedFields.has("rating") && (
                                                <td className="px-3 py-3 text-center">
                                                    {contact.leadScore !== undefined ? (
                                                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                            contact.leadScore >= 7
                                                                ? "bg-[#10B981]/10 text-[#10B981]"
                                                                : contact.leadScore >= 4
                                                                    ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                                                    : "bg-[#EF4444]/10 text-[#EF4444]"
                                                        }`}>
                                                            {contact.leadScore}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#CBD5E1] italic text-xs">—</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {contact.verified && (
                                                        <span className="px-1.5 py-0.5 bg-[#10B981]/10 text-[#10B981] text-[10px] font-medium rounded" title="Verified email">
                                                            ✓
                                                        </span>
                                                    )}
                                                    {contact.isDuplicate && (
                                                        <span className="px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-medium rounded">
                                                            in contacts
                                                        </span>
                                                    )}
                                                    {contact.alreadySeen && !contact.isDuplicate && (
                                                        <span className="px-1.5 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] font-medium rounded" title="Returned by a previous search">
                                                            seen
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Lead detail side-panel */}
                {detailContact && (
                    <LeadDetailPanel
                        contact={detailContact}
                        onClose={() => setDetailContact(null)}
                    />
                )}

                {/* Empty State (no error, no results, no import success) */}
                {!isSearching && !error && results.length === 0 && !importSuccess && (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/10 to-[#A855F7]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-4xl">
                            🎯
                        </div>
                        <h2 className="text-xl font-semibold text-[#0f172a] dark:text-white mb-2">Ready to Find Leads</h2>
                        <p className="text-[#9CA3AF] max-w-md mx-auto">
                            Pick an industry, add one or more locations, choose how many leads you want, and we&apos;ll pull real businesses from Google Maps + verify their contact info.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-xs text-[#9CA3AF] bg-[#f8fafc] dark:bg-slate-800 px-3 py-1.5 rounded-full border border-[#E5E7EB] dark:border-slate-700">
                            <span>💡</span>
                            <span>Tip: ZIP codes give the most accurate results</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
        </>
    );
}

/**
 * Sortable table header — click to toggle direction. Used for Name/State/Score columns.
 */
function SortHeader({
    label,
    active,
    dir,
    onClick,
}: {
    label: string;
    active: boolean;
    dir: 'asc' | 'desc';
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1 hover:text-[#0f172a] dark:hover:text-white transition-colors ${
                active ? "text-[#0f172a] dark:text-white" : ""
            }`}
        >
            <span>{label}</span>
            <span className={`text-[10px] ${active ? "opacity-100" : "opacity-30"}`}>
                {active ? (dir === 'asc' ? '▲' : '▼') : '▼'}
            </span>
        </button>
    );
}

/**
 * Slide-over detail panel showing the full lead profile + quick-action links
 * (Maps, LinkedIn search, mailto, tel). Click outside or Esc to close.
 */
function LeadDetailPanel({
    contact,
    onClose,
}: {
    contact: ScrapedContact;
    onClose: () => void;
}) {
    const mapsQuery = encodeURIComponent(
        [contact.name || contact.company, contact.address, contact.location].filter(Boolean).join(" ")
    );
    const linkedinQuery = encodeURIComponent(contact.company || contact.name || "");
    const hasRealEmail = !!contact.email && !contact.email.startsWith("unknown@");

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="ml-auto h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto relative animate-in slide-in-from-right duration-200">
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-[#E5E7EB] dark:border-slate-700 p-4 flex items-center justify-between">
                    <div className="font-semibold text-[#0f172a] dark:text-white truncate pr-4">
                        {contact.name || contact.company || "Lead detail"}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#9CA3AF] hover:text-[#0f172a] dark:hover:text-white text-2xl leading-none"
                        aria-label="Close"
                    >×</button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2">
                        {contact.verified && (
                            <span className="px-2 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-medium rounded-md">✓ Verified email</span>
                        )}
                        {contact.isDuplicate && (
                            <span className="px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium rounded-md">⚠ Already in contacts</span>
                        )}
                        {contact.alreadySeen && !contact.isDuplicate && (
                            <span className="px-2 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium rounded-md">Returned in a previous search</span>
                        )}
                        {contact.leadScore !== undefined && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                                contact.leadScore >= 7
                                    ? "bg-[#10B981]/10 text-[#10B981]"
                                    : contact.leadScore >= 4
                                        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                        : "bg-[#EF4444]/10 text-[#EF4444]"
                            }`}>
                                Lead score: {contact.leadScore}/10
                            </span>
                        )}
                    </div>

                    {/* Field grid */}
                    <div className="space-y-3 text-sm">
                        <DetailRow label="Business" value={contact.name || contact.company} />
                        {contact.company && contact.name && (
                            <DetailRow label="Company" value={contact.company} />
                        )}
                        <DetailRow
                            label="Email"
                            value={hasRealEmail ? contact.email : null}
                            placeholder="Not extracted from website"
                            href={hasRealEmail ? `mailto:${contact.email}` : undefined}
                        />
                        <DetailRow
                            label="Phone"
                            value={contact.phone}
                            href={contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : undefined}
                        />
                        <DetailRow label="Address" value={contact.address} />
                        <DetailRow label="State" value={contact.location} />
                        <DetailRow
                            label="Website"
                            value={contact.website}
                            href={contact.website ? (contact.website.startsWith("http") ? contact.website : `https://${contact.website}`) : undefined}
                            external
                        />
                    </div>

                    {/* Quick action links */}
                    <div className="space-y-2 pt-2 border-t border-[#E5E7EB] dark:border-slate-700">
                        <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Quick actions</div>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-[#f8fafc] dark:bg-slate-800 hover:bg-[#F1F3F8] dark:hover:bg-slate-700 rounded-lg text-sm text-[#0f172a] dark:text-white transition-colors"
                        >
                            <span>📍 Open in Google Maps</span>
                            <span className="text-[#9CA3AF]">↗</span>
                        </a>
                        {linkedinQuery && (
                            <a
                                href={`https://www.linkedin.com/search/results/companies/?keywords=${linkedinQuery}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-[#f8fafc] dark:bg-slate-800 hover:bg-[#F1F3F8] dark:hover:bg-slate-700 rounded-lg text-sm text-[#0f172a] dark:text-white transition-colors"
                            >
                                <span>💼 Search on LinkedIn</span>
                                <span className="text-[#9CA3AF]">↗</span>
                            </a>
                        )}
                        {contact.website && (
                            <a
                                href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-[#f8fafc] dark:bg-slate-800 hover:bg-[#F1F3F8] dark:hover:bg-slate-700 rounded-lg text-sm text-[#0f172a] dark:text-white transition-colors"
                            >
                                <span>🌐 Visit website</span>
                                <span className="text-[#9CA3AF]">↗</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({
    label,
    value,
    placeholder,
    href,
    external,
}: {
    label: string;
    value?: string | null;
    placeholder?: string;
    href?: string;
    external?: boolean;
}) {
    return (
        <div>
            <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">{label}</div>
            {value ? (
                href ? (
                    <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="text-[#0891b2] hover:underline break-words"
                    >
                        {value}
                    </a>
                ) : (
                    <div className="text-[#0f172a] dark:text-white break-words">{value}</div>
                )
            ) : (
                <div className="text-[#CBD5E1] italic">{placeholder ?? "—"}</div>
            )}
        </div>
    );
}

/**
 * Build CSV columns from the user's ticked fields. Order matches FIELD_OPTIONS.
 * Only the columns the user asked for appear in the export.
 */
function csvColumnsFor(fields: Set<FieldId>): { id: FieldId; label: string; pick: (c: ScrapedContact) => string }[] {
    const all: { id: FieldId; label: string; pick: (c: ScrapedContact) => string }[] = [
        { id: "name", label: "Business name", pick: c => c.name || c.company || "" },
        { id: "email", label: "Email", pick: c => c.email || "" },
        { id: "phone", label: "Phone", pick: c => c.phone || "" },
        { id: "address", label: "Address", pick: c => [c.address, c.location].filter(Boolean).join(", ") },
        { id: "website", label: "Website", pick: c => c.website || "" },
        { id: "rating", label: "Lead score", pick: c => c.leadScore?.toString() ?? "" },
    ];
    return all.filter(col => fields.has(col.id));
}

function exportSelectedAsCsv(
    results: ScrapedContact[],
    selected: Set<number>,
    fields: Set<FieldId>,
    industry: string,
    locations: string[],
) {
    const columns = csvColumnsFor(fields);
    if (columns.length === 0) return;
    const header = columns.map(c => c.label).join(",");
    const rows = results
        .filter((_, i) => selected.has(i))
        .map(r =>
            columns
                .map(c => `"${c.pick(r).replace(/"/g, '""')}"`)
                .join(",")
        );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeIndustry = (industry || "leads").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "leads";
    a.href = url;
    a.download = `${safeIndustry}-${locations.join("_") || "search"}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * In-page print-only view. Hidden in normal flow; only `@media print` reveals
 * it (via Tailwind `print:block` / `print:hidden`). Uses React rendering — no
 * document.write, no popup window.
 */
function PrintableLeads({
    rows,
    fields,
    industry,
    locations,
}: {
    rows: ScrapedContact[];
    fields: Set<FieldId>;
    industry: string;
    locations: string[];
}) {
    const columns = csvColumnsFor(fields);
    const subtitle = [industry, locations.join(", ")].filter(Boolean).join(" — ");
    return (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 overflow-visible z-[1000]">
            <h1 className="text-xl font-bold mb-1">Leads — {industry || "search"}</h1>
            {subtitle && <div className="text-xs text-slate-600 mb-1">{subtitle}</div>}
            <div className="text-[10px] text-slate-400 mb-4">
                {rows.length} leads • Generated {new Date().toLocaleString()}
            </div>
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr>
                        {columns.map(c => (
                            <th key={c.id} className="text-left p-2 border-b-2 border-black font-semibold">
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className={i % 2 === 1 ? "bg-slate-50" : ""}>
                            {columns.map(c => {
                                const v = c.pick(r);
                                return (
                                    <td key={c.id} className="p-2 border-b border-slate-200 align-top">
                                        {v || <span className="text-slate-300 italic">—</span>}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ScraperPageWrapper() {
    return (
        <AuthGuard>
            <style>{`
                @media print {
                    @page { size: letter portrait; margin: 0.5in; }
                }
            `}</style>
            <ScraperPage />
        </AuthGuard>
    );
}
