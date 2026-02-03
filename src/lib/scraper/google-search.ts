/**
 * Google Custom Search API Integration
 * Falls back to DuckDuckGo scraping if no API key
 */

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

/**
 * Search using Google Custom Search API
 */
export async function googleSearch(
    query: string,
    numResults: number = 10
): Promise<SearchResult[]> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !engineId) {
        console.log('Google Search API not configured, using fallback...');
        return fallbackSearch(query, numResults);
    }

    try {
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', apiKey);
        url.searchParams.set('cx', engineId);
        url.searchParams.set('q', query);
        url.searchParams.set('num', String(Math.min(numResults, 10)));

        const response = await fetch(url.toString());

        if (!response.ok) {
            console.error('Google Search API error:', response.status);
            return fallbackSearch(query, numResults);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return [];
        }

        return data.items.map((item: any) => ({
            title: item.title || '',
            url: item.link || '',
            snippet: item.snippet || '',
        }));
    } catch (error) {
        console.error('Google Search error:', error);
        return fallbackSearch(query, numResults);
    }
}

/**
 * Fallback: Use DuckDuckGo HTML (no API key needed)
 * Note: For personal/educational use only
 */
async function fallbackSearch(query: string, numResults: number): Promise<SearchResult[]> {
    try {
        // DuckDuckGo instant answers API (limited but free)
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            return generateDirectoryUrls(query);
        }

        const data = await response.json();
        const results: SearchResult[] = [];

        // Get related topics
        if (data.RelatedTopics) {
            for (const topic of data.RelatedTopics.slice(0, numResults)) {
                if (topic.FirstURL) {
                    results.push({
                        title: topic.Text || '',
                        url: topic.FirstURL,
                        snippet: topic.Text || '',
                    });
                }
            }
        }

        // If not enough results, generate directory URLs
        if (results.length < 3) {
            return generateDirectoryUrls(query);
        }

        return results;
    } catch {
        return generateDirectoryUrls(query);
    }
}

/**
 * Generate URLs for business directories based on query
 */
function generateDirectoryUrls(query: string): SearchResult[] {
    // Parse location from query
    const locationMatch = query.match(/in\s+([^,]+(?:,\s*[A-Z]{2})?)/i);
    const location = locationMatch ? locationMatch[1].trim().replace(/\s+/g, '-').toLowerCase() : '';

    // Parse business type
    const businessTypes = query.replace(/find\s+(me\s+)?/i, '').replace(/in\s+.*/i, '').trim();
    const searchTerms = businessTypes.replace(/\s+/g, '-').toLowerCase();

    const results: SearchResult[] = [];

    // Yelp
    if (location) {
        results.push({
            title: `${businessTypes} on Yelp`,
            url: `https://www.yelp.com/search?find_desc=${encodeURIComponent(businessTypes)}&find_loc=${encodeURIComponent(location)}`,
            snippet: `Find ${businessTypes} in ${location} on Yelp`,
        });
    }

    // Yellow Pages
    results.push({
        title: `${businessTypes} on Yellow Pages`,
        url: `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(businessTypes)}&geo_location_terms=${encodeURIComponent(location)}`,
        snippet: `Yellow Pages listing for ${businessTypes}`,
    });

    // Google Maps (will be scraped for business websites)
    results.push({
        title: `${businessTypes} on Google Maps`,
        url: `https://www.google.com/maps/search/${encodeURIComponent(businessTypes + ' ' + location)}`,
        snippet: `Google Maps results for ${businessTypes}`,
    });

    return results;
}

/**
 * Build search query from user prompt
 */
export function buildSearchQuery(prompt: string): string {
    // Enhance the prompt for better search results
    let query = prompt.trim();

    // Add "contact" or "email" to help find pages with contact info
    if (!query.includes('email') && !query.includes('contact')) {
        query += ' contact email';
    }

    return query;
}
