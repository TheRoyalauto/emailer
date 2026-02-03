/**
 * Email Validator - Validates email addresses via syntax and MX records
 */

import { promises as dns } from 'dns';

/**
 * Validate email syntax
 */
export function isValidEmailSyntax(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Check if domain has MX records (can receive email)
 */
export async function hasMxRecords(domain: string): Promise<boolean> {
    try {
        const records = await dns.resolveMx(domain);
        return records && records.length > 0;
    } catch {
        return false;
    }
}

/**
 * Check if email domain is a disposable/temp email service
 */
const DISPOSABLE_DOMAINS = new Set([
    'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
    '10minutemail.com', 'temp-mail.org', 'fakeinbox.com', 'tempail.com',
    'getnada.com', 'maildrop.cc', 'yopmail.com', 'trashmail.com',
]);

export function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Full email validation
 */
export interface ValidationResult {
    email: string;
    valid: boolean;
    reason?: string;
}

export async function validateEmail(email: string): Promise<ValidationResult> {
    const normalized = email.toLowerCase().trim();

    // Syntax check
    if (!isValidEmailSyntax(normalized)) {
        return { email: normalized, valid: false, reason: 'Invalid syntax' };
    }

    // Disposable check
    if (isDisposableEmail(normalized)) {
        return { email: normalized, valid: false, reason: 'Disposable email' };
    }

    // MX record check
    const domain = normalized.split('@')[1];
    const hasMx = await hasMxRecords(domain);
    if (!hasMx) {
        return { email: normalized, valid: false, reason: 'No MX records' };
    }

    return { email: normalized, valid: true };
}

/**
 * Validate multiple emails concurrently
 */
export async function validateEmails(emails: string[]): Promise<ValidationResult[]> {
    return Promise.all(emails.map(validateEmail));
}

/**
 * Calculate lead score based on available information
 */
export function calculateLeadScore(contact: {
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    address?: string;
}): number {
    let score = 0;

    // Email quality
    if (contact.email) {
        score += 30;
        // Business email domains score higher
        const domain = contact.email.split('@')[1];
        if (!['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'].includes(domain)) {
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
