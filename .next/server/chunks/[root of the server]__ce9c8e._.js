module.exports = {

"[externals]/ [external] (next/dist/compiled/next-server/app-route.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("next/dist/compiled/next-server/app-route.runtime.dev.js");

module.exports = mod;
}}),
"[externals]/ [external] (@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("@opentelemetry/api");

module.exports = mod;
}}),
"[externals]/ [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("next/dist/compiled/next-server/app-page.runtime.dev.js");

module.exports = mod;
}}),
"[externals]/ [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("next/dist/server/app-render/work-unit-async-storage.external.js");

module.exports = mod;
}}),
"[externals]/ [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("next/dist/server/app-render/work-async-storage.external.js");

module.exports = mod;
}}),
"[project]/src/lib/scraper/crawler.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
/**
 * Web Crawler - Fetches web pages with proper headers and timeout
 */ __turbopack_esm__({
    "crawlPage": (()=>crawlPage),
    "crawlPages": (()=>crawlPages)
});
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];
async function crawlPage(url, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), timeoutMs);
    try {
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive'
            }
        });
        if (!response.ok) {
            return {
                url,
                html: '',
                success: false,
                error: `HTTP ${response.status}`
            };
        }
        const html = await response.text();
        return {
            url,
            html,
            success: true
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
            url,
            html: '',
            success: false,
            error: message
        };
    } finally{
        clearTimeout(timeout);
    }
}
async function crawlPages(urls, delayMs = 1000, maxConcurrent = 5) {
    const results = [];
    const queue = [
        ...urls
    ];
    const active = [];
    const processUrl = async (url)=>{
        const result = await crawlPage(url);
        results.push(result);
        await sleep(delayMs);
    };
    while(queue.length > 0 || active.length > 0){
        // Fill up to maxConcurrent
        while(active.length < maxConcurrent && queue.length > 0){
            const url = queue.shift();
            const promise = processUrl(url).then(()=>{
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
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
}}),
"[externals]/ [external] (node:stream, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:stream");

module.exports = mod;
}}),
"[externals]/ [external] (buffer, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("buffer");

module.exports = mod;
}}),
"[externals]/ [external] (string_decoder, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("string_decoder");

module.exports = mod;
}}),
"[externals]/ [external] (stream, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("stream");

module.exports = mod;
}}),
"[externals]/ [external] (node:assert, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:assert");

module.exports = mod;
}}),
"[externals]/ [external] (node:net, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:net");

module.exports = mod;
}}),
"[externals]/ [external] (node:http, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:http");

module.exports = mod;
}}),
"[externals]/ [external] (node:querystring, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:querystring");

module.exports = mod;
}}),
"[externals]/ [external] (node:events, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:events");

module.exports = mod;
}}),
"[externals]/ [external] (node:diagnostics_channel, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:diagnostics_channel");

module.exports = mod;
}}),
"[externals]/ [external] (node:util, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:util");

module.exports = mod;
}}),
"[externals]/ [external] (node:tls, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:tls");

module.exports = mod;
}}),
"[externals]/ [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:buffer");

module.exports = mod;
}}),
"[externals]/ [external] (node:zlib, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:zlib");

module.exports = mod;
}}),
"[externals]/ [external] (node:perf_hooks, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:perf_hooks");

module.exports = mod;
}}),
"[externals]/ [external] (node:util/types, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:util/types");

module.exports = mod;
}}),
"[externals]/ [external] (node:crypto, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:crypto");

module.exports = mod;
}}),
"[externals]/ [external] (node:worker_threads, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:worker_threads");

module.exports = mod;
}}),
"[externals]/ [external] (node:http2, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:http2");

module.exports = mod;
}}),
"[externals]/ [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:async_hooks");

module.exports = mod;
}}),
"[externals]/ [external] (node:console, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:console");

module.exports = mod;
}}),
"[externals]/ [external] (node:fs/promises, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:fs/promises");

module.exports = mod;
}}),
"[externals]/ [external] (node:path, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:path");

module.exports = mod;
}}),
"[externals]/ [external] (node:timers, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:timers");

module.exports = mod;
}}),
"[externals]/ [external] (node:dns, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("node:dns");

module.exports = mod;
}}),
"[project]/src/lib/scraper/email-extractor.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
/**
 * Email Extractor - Extracts email addresses from HTML content
 */ __turbopack_esm__({
    "extractAddress": (()=>extractAddress),
    "extractBusinessName": (()=>extractBusinessName),
    "extractContactInfo": (()=>extractContactInfo),
    "extractEmailsFromHtml": (()=>extractEmailsFromHtml),
    "extractPhonesFromHtml": (()=>extractPhonesFromHtml),
    "getContactPageUrls": (()=>getContactPageUrls)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/cheerio/dist/esm/index.js [app-route] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/cheerio/dist/esm/index.js [app-route] (ecmascript)");
;
// Email regex pattern - matches most valid emails
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Common contact page paths to check
const CONTACT_PATHS = [
    '/contact',
    '/contact-us',
    '/about',
    '/about-us',
    '/team',
    '/staff'
];
// Blacklisted email patterns (not real contacts)
const EMAIL_BLACKLIST = [
    'example.com',
    'domain.com',
    'email.com',
    'yourcompany.com',
    'sentry.io',
    'wixpress.com',
    'wordpress.com',
    'squarespace.com',
    '.png',
    '.jpg',
    '.gif',
    '.svg',
    'noreply',
    'no-reply',
    'donotreply',
    'unsubscribe'
];
function extractEmailsFromHtml(html, sourceUrl) {
    const emails = new Set();
    // Method 1: Regex on raw HTML (catches obfuscated emails too)
    const rawMatches = html.match(EMAIL_REGEX) || [];
    rawMatches.forEach((email)=>emails.add(email.toLowerCase()));
    // Method 2: Parse mailto: links
    const $ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__.load(html);
    $('a[href^="mailto:"]').each((_, el)=>{
        const href = $(el).attr('href') || '';
        const email = href.replace('mailto:', '').split('?')[0].toLowerCase();
        if (email.includes('@')) {
            emails.add(email);
        }
    });
    // Filter out blacklisted emails
    const filtered = Array.from(emails).filter((email)=>{
        return !EMAIL_BLACKLIST.some((blacklisted)=>email.includes(blacklisted));
    });
    return filtered;
}
function extractPhonesFromHtml(html) {
    const phones = new Set();
    // US phone patterns
    const phonePatterns = [
        /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g,
        /\+1[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g
    ];
    phonePatterns.forEach((pattern)=>{
        const matches = html.match(pattern) || [];
        matches.forEach((phone)=>{
            // Normalize phone format
            const normalized = phone.replace(/\D/g, '');
            if (normalized.length >= 10 && normalized.length <= 11) {
                phones.add(normalized.slice(-10)); // Last 10 digits
            }
        });
    });
    return Array.from(phones);
}
function extractBusinessName(html, url) {
    const $ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__.load(html);
    // Try various meta tags and elements
    const sources = [
        $('meta[property="og:site_name"]').attr('content'),
        $('meta[name="application-name"]').attr('content'),
        $('meta[property="og:title"]').attr('content'),
        $('title').first().text(),
        $('h1').first().text()
    ];
    for (const source of sources){
        if (source && source.trim().length > 1 && source.length < 100) {
            // Clean up the name
            let name = source.trim().replace(/\s*[-|–—]\s*.*/g, '') // Remove anything after dash
            .replace(/\s*\|\s*.*/g, '') // Remove anything after pipe
            .trim();
            if (name.length > 1) {
                return name;
            }
        }
    }
    // Fallback: extract from domain
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        const name = domain.split('.')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    } catch  {
        return undefined;
    }
}
function extractAddress(html) {
    const $ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__.load(html);
    // Look for common address patterns
    const addressPatterns = [
        /\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)[\s,]+[\w\s]+,?\s*[A-Z]{2}\s+\d{5}/gi
    ];
    for (const pattern of addressPatterns){
        const match = html.match(pattern);
        if (match && match[0]) {
            return match[0].trim();
        }
    }
    // Try schema.org markup
    const streetAddress = $('[itemprop="streetAddress"]').first().text();
    const locality = $('[itemprop="addressLocality"]').first().text();
    const region = $('[itemprop="addressRegion"]').first().text();
    const postalCode = $('[itemprop="postalCode"]').first().text();
    if (streetAddress && locality) {
        return `${streetAddress}, ${locality}${region ? ', ' + region : ''}${postalCode ? ' ' + postalCode : ''}`.trim();
    }
    return undefined;
}
function getContactPageUrls(baseUrl) {
    try {
        const url = new URL(baseUrl);
        const origin = url.origin;
        return CONTACT_PATHS.map((path)=>origin + path);
    } catch  {
        return [];
    }
}
function extractContactInfo(html, sourceUrl) {
    const emails = extractEmailsFromHtml(html, sourceUrl);
    const phones = extractPhonesFromHtml(html);
    const company = extractBusinessName(html, sourceUrl);
    const address = extractAddress(html);
    return {
        email: emails[0],
        company,
        phone: phones[0] ? formatPhone(phones[0]) : undefined,
        address,
        website: new URL(sourceUrl).origin,
        source: sourceUrl
    };
}
function formatPhone(digits) {
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return digits;
}
}}),
"[externals]/ [external] (dns, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("dns");

module.exports = mod;
}}),
"[project]/src/lib/scraper/email-validator.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
/**
 * Email Validator - Validates email addresses via syntax and MX records
 */ __turbopack_esm__({
    "calculateLeadScore": (()=>calculateLeadScore),
    "hasMxRecords": (()=>hasMxRecords),
    "isDisposableEmail": (()=>isDisposableEmail),
    "isValidEmailSyntax": (()=>isValidEmailSyntax),
    "validateEmail": (()=>validateEmail),
    "validateEmails": (()=>validateEmails)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$dns$2c$__cjs$29$__ = __turbopack_import__("[externals]/ [external] (dns, cjs)");
;
function isValidEmailSyntax(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
async function hasMxRecords(domain) {
    try {
        const records = await __TURBOPACK__imported__module__$5b$externals$5d2f$__$5b$external$5d$__$28$dns$2c$__cjs$29$__["promises"].resolveMx(domain);
        return records && records.length > 0;
    } catch  {
        return false;
    }
}
/**
 * Check if email domain is a disposable/temp email service
 */ const DISPOSABLE_DOMAINS = new Set([
    'tempmail.com',
    'throwaway.email',
    'guerrillamail.com',
    'mailinator.com',
    '10minutemail.com',
    'temp-mail.org',
    'fakeinbox.com',
    'tempail.com',
    'getnada.com',
    'maildrop.cc',
    'yopmail.com',
    'trashmail.com'
]);
function isDisposableEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return DISPOSABLE_DOMAINS.has(domain);
}
async function validateEmail(email) {
    const normalized = email.toLowerCase().trim();
    // Syntax check
    if (!isValidEmailSyntax(normalized)) {
        return {
            email: normalized,
            valid: false,
            reason: 'Invalid syntax'
        };
    }
    // Disposable check
    if (isDisposableEmail(normalized)) {
        return {
            email: normalized,
            valid: false,
            reason: 'Disposable email'
        };
    }
    // MX record check
    const domain = normalized.split('@')[1];
    const hasMx = await hasMxRecords(domain);
    if (!hasMx) {
        return {
            email: normalized,
            valid: false,
            reason: 'No MX records'
        };
    }
    return {
        email: normalized,
        valid: true
    };
}
async function validateEmails(emails) {
    return Promise.all(emails.map(validateEmail));
}
function calculateLeadScore(contact) {
    let score = 0;
    // Email quality
    if (contact.email) {
        score += 30;
        // Business email domains score higher
        const domain = contact.email.split('@')[1];
        if (![
            'gmail.com',
            'yahoo.com',
            'hotmail.com',
            'outlook.com',
            'aol.com'
        ].includes(domain)) {
            score += 15; // Business domain bonus
        }
    }
    // Phone number
    if (contact.phone) {
        score += 20;
    }
    // Company name
    if (contact.company && contact.company.length > 2) {
        score += 15;
    }
    // Website
    if (contact.website) {
        score += 10;
    }
    // Physical address
    if (contact.address) {
        score += 10;
    }
    return Math.min(score, 100);
}
}}),
"[project]/src/lib/scraper/index.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
/**
 * Real Lead Scraper - Direct Website Scraping
 * Searches Google, extracts actual business websites, and scrapes contact info
 */ __turbopack_esm__({
    "scrapeLeads": (()=>scrapeLeads)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$crawler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/scraper/crawler.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/scraper/email-extractor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$validator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/scraper/email-validator.ts [app-route] (ecmascript)");
;
;
;
async function scrapeLeads(prompt, maxResults = 20) {
    const errors = [];
    const leads = [];
    const seenEmails = new Set();
    console.log(`[Scraper] Searching for: ${prompt}`);
    // Parse the search query
    const { businessType, location } = parseQuery(prompt);
    if (!businessType) {
        errors.push('Could not determine business type from query');
        return {
            leads: [],
            totalScraped: 0,
            errors
        };
    }
    // Try Google Custom Search API first
    const searchResults = await googleCustomSearch(businessType, location, maxResults);
    if (searchResults.length === 0) {
        errors.push('No search results found. Try a different search term or location.');
        return {
            leads: [],
            totalScraped: 0,
            errors
        };
    }
    console.log(`[Scraper] Found ${searchResults.length} search results`);
    // Crawl each result and extract contact info
    let scraped = 0;
    for (const result of searchResults){
        if (leads.length >= maxResults) break;
        try {
            // Skip non-business URLs
            if (isDirectoryUrl(result.url)) {
                console.log(`[Scraper] Skipping directory: ${result.url}`);
                continue;
            }
            console.log(`[Scraper] Crawling: ${result.url}`);
            const crawlResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$crawler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["crawlPage"])(result.url);
            scraped++;
            if (!crawlResult.success || !crawlResult.html) {
                console.log(`[Scraper] No HTML from: ${result.url} - ${crawlResult.error}`);
                continue;
            }
            const html = crawlResult.html;
            // Extract emails and contact info
            let emails = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractEmailsFromHtml"])(html, result.url);
            const phones = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPhonesFromHtml"])(html);
            const company = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractBusinessName"])(html, result.url);
            const contactInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractContactInfo"])(html, result.url);
            // If no emails found on main page, try contact page
            if (emails.length === 0) {
                const contactUrls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getContactPageUrls"])(result.url);
                for (const contactUrl of contactUrls.slice(0, 2)){
                    try {
                        const contactCrawl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$crawler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["crawlPage"])(contactUrl);
                        if (contactCrawl.success && contactCrawl.html) {
                            const moreEmails = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractEmailsFromHtml"])(contactCrawl.html, contactUrl);
                            emails.push(...moreEmails);
                            scraped++;
                        }
                    } catch  {
                    // Ignore contact page errors
                    }
                }
            }
            // Process found emails
            for (const email of emails){
                if (seenEmails.has(email.toLowerCase())) continue;
                if (leads.length >= maxResults) break;
                // Validate email
                const validation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$validator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateEmail"])(email);
                if (!validation.valid) {
                    console.log(`[Scraper] Invalid email: ${email} - ${validation.reason}`);
                    continue;
                }
                seenEmails.add(email.toLowerCase());
                // Calculate lead score
                const leadScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$email$2d$validator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateLeadScore"])({
                    email,
                    phone: phones[0],
                    company,
                    website: result.url,
                    address: contactInfo.address
                });
                leads.push({
                    email,
                    name: undefined,
                    company: company || extractCompanyFromUrl(result.url),
                    phone: phones[0] ? formatPhone(phones[0]) : undefined,
                    location: location || undefined,
                    website: result.url,
                    address: contactInfo.address,
                    leadScore,
                    verified: validation.valid,
                    source: result.url
                });
                console.log(`[Scraper] Found lead: ${email} from ${result.url}`);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.log(`[Scraper] Error crawling ${result.url}: ${msg}`);
            errors.push(`Failed to crawl ${result.url}: ${msg}`);
        }
    }
    console.log(`[Scraper] Completed: ${leads.length} leads from ${scraped} pages`);
    return {
        leads,
        totalScraped: scraped,
        errors
    };
}
/**
 * Parse user query into business type and location
 */ function parseQuery(prompt) {
    const lower = prompt.toLowerCase();
    // Extract location
    const locationMatch = lower.match(/in\s+([^,]+(?:,\s*[a-z]{2,})?)/i);
    const location = locationMatch ? locationMatch[1].trim() : '';
    // Extract business type (everything before "in location")
    let businessType = lower.replace(/find\s+(me\s+)?/i, '').replace(/search\s+(for\s+)?/i, '').replace(/get\s+(me\s+)?/i, '').replace(/\d+\s*/g, '').replace(/in\s+.*/i, '').trim();
    return {
        businessType,
        location
    };
}
/**
 * Google Custom Search API
 */ async function googleCustomSearch(businessType, location, numResults) {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    if (!apiKey || !engineId) {
        console.log('[Scraper] Google Search API not configured');
        return [];
    }
    const query = `${businessType} ${location} contact email`.trim();
    try {
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', apiKey);
        url.searchParams.set('cx', engineId);
        url.searchParams.set('q', query);
        url.searchParams.set('num', String(Math.min(numResults, 10)));
        const response = await fetch(url.toString());
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Scraper] Google Search API error: ${response.status}`, errorText);
            return [];
        }
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            console.log('[Scraper] No search results from Google');
            return [];
        }
        return data.items.map((item)=>({
                title: item.title || '',
                url: item.link || ''
            }));
    } catch (error) {
        console.error('[Scraper] Google Search error:', error);
        return [];
    }
}
/**
 * Check if URL is a directory (not a business website)
 */ function isDirectoryUrl(url) {
    const directories = [
        'yelp.com',
        'yellowpages.com',
        'google.com/maps',
        'facebook.com',
        'linkedin.com',
        'bing.com',
        'mapquest.com',
        'manta.com',
        'bbb.org',
        'angi.com',
        'thumbtack.com',
        'nextdoor.com'
    ];
    return directories.some((dir)=>url.includes(dir));
}
/**
 * Extract company name from URL
 */ function extractCompanyFromUrl(url) {
    try {
        const hostname = new URL(url).hostname;
        // Remove www. and common TLDs
        return hostname.replace(/^www\./, '').replace(/\.(com|net|org|biz|info|co)$/i, '').split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, (c)=>c.toUpperCase());
    } catch  {
        return undefined;
    }
}
/**
 * Format phone number
 */ function formatPhone(digits) {
    const clean = digits.replace(/\D/g, '');
    if (clean.length === 10) {
        return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
    }
    return digits;
}
}}),
"[project]/src/app/api/scrape-leads/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "POST": (()=>POST)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/scraper/index.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const { prompt } = await request.json();
        if (!prompt) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Prompt is required"
            }, {
                status: 400
            });
        }
        console.log('[API] Lead scraping request:', prompt);
        // Check if Google Search API is configured
        if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                contacts: [],
                count: 0,
                source: 'error',
                message: 'Google Custom Search API not configured. Please add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID to your environment variables.'
            });
        }
        // REAL SCRAPING ONLY - NO AI FALLBACK
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scraper$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scrapeLeads"])(prompt, 25);
        console.log(`[API] Real scraper found ${result.leads.length} leads`);
        if (result.leads.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                contacts: [],
                count: 0,
                source: 'real_scraper',
                message: result.errors.length > 0 ? `No leads found. Errors: ${result.errors.slice(0, 3).join('; ')}` : 'No leads found matching your search. Try a different location or business type.',
                errors: result.errors
            });
        }
        // Only return contacts that have verified real data
        const contacts = result.leads.filter((lead)=>lead.verified !== false) // Only verified or unverified (not explicitly false)
        .map((lead)=>({
                email: lead.email,
                name: lead.name || undefined,
                company: lead.company || undefined,
                phone: lead.phone || undefined,
                location: lead.location || undefined,
                website: lead.website || undefined,
                address: lead.address || undefined,
                leadScore: lead.leadScore,
                verified: lead.verified
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            contacts,
            count: contacts.length,
            source: 'real_scraper',
            totalScraped: result.totalScraped,
            errors: result.errors.length > 0 ? result.errors.slice(0, 5) : undefined
        });
    } catch (error) {
        console.error("Scrape leads error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            contacts: [],
            count: 0,
            source: 'error',
            error: `Failed to scrape leads: ${errorMessage}`
        }, {
            status: 500
        });
    }
}
}}),
"[project]/ (server-utils)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: require } = __turbopack_context__;
{
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__ce9c8e._.js.map