/**
 * Web Crawler - Fetches web pages with proper headers and timeout
 */

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

export interface CrawlResult {
    url: string;
    html: string;
    success: boolean;
    error?: string;
}

/**
 * Fetch a web page with timeout and proper headers
 */
export async function crawlPage(url: string, timeoutMs: number = 10000): Promise<CrawlResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            },
        });

        if (!response.ok) {
            return { url, html: '', success: false, error: `HTTP ${response.status}` };
        }

        const html = await response.text();
        return { url, html, success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { url, html: '', success: false, error: message };
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Crawl multiple pages with rate limiting
 */
export async function crawlPages(
    urls: string[],
    delayMs: number = 1000,
    maxConcurrent: number = 5
): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const queue = [...urls];
    const active: Promise<void>[] = [];

    const processUrl = async (url: string) => {
        const result = await crawlPage(url);
        results.push(result);
        await sleep(delayMs);
    };

    while (queue.length > 0 || active.length > 0) {
        // Fill up to maxConcurrent
        while (active.length < maxConcurrent && queue.length > 0) {
            const url = queue.shift()!;
            const promise = processUrl(url).then(() => {
                const idx = active.indexOf(promise);
                if (idx > -1) active.splice(idx, 1);
            });
            active.push(promise);
        }

        // Wait for at least one to complete
        if (active.length > 0) {
            await Promise.race(active);
        }
    }

    return results;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
