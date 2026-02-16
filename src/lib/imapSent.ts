import { ImapFlow } from "imapflow";

interface ImapSentConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
}

/**
 * Append a sent email to the user's IMAP Sent folder.
 * This ensures sent emails show up in the provider's Sent folder
 * (e.g., PrivateEmail, Gmail, Outlook, etc.).
 *
 * Uses common Sent folder names and auto-detects via IMAP special-use flags.
 */
export async function appendToSentFolder(
    config: ImapSentConfig,
    rawMessage: string | Buffer
): Promise<{ success: boolean; error?: string }> {
    // IMAP typically uses port 993 for SSL or 143 for STARTTLS
    // Derive IMAP host from SMTP host (most providers use the same domain)
    const imapHost = config.host
        .replace(/^smtp\./i, "mail.")
        .replace(/^smtp-relay\./i, "mail.");

    const imapPort = 993; // Standard IMAP SSL port

    const client = new ImapFlow({
        host: imapHost,
        port: imapPort,
        secure: true,
        auth: {
            user: config.user,
            pass: config.pass,
        },
        logger: false,
    });

    try {
        await client.connect();

        // Try to find the Sent folder — different providers use different names
        const sentFolderNames = ["Sent", "INBOX.Sent", "Sent Messages", "Sent Items", "Sent Mail", "[Gmail]/Sent Mail"];

        let sentFolder: string | null = null;

        // First, try to find via IMAP special-use attribute
        const mailboxes = await client.list();
        for (const mailbox of mailboxes) {
            if (mailbox.specialUse === "\\Sent") {
                sentFolder = mailbox.path;
                break;
            }
        }

        // Fallback: try common folder names
        if (!sentFolder) {
            for (const name of sentFolderNames) {
                try {
                    const status = await client.status(name, { messages: true });
                    if (status) {
                        sentFolder = name;
                        break;
                    }
                } catch {
                    // Folder doesn't exist, try next
                }
            }
        }

        if (!sentFolder) {
            // Last resort: create "Sent" folder
            try {
                await client.mailboxCreate("Sent");
                sentFolder = "Sent";
            } catch {
                await client.logout();
                return { success: false, error: "Could not find or create Sent folder" };
            }
        }

        // Append the message to Sent folder with \Seen flag
        const messageBuffer = typeof rawMessage === "string" ? Buffer.from(rawMessage) : rawMessage;
        await client.append(sentFolder, messageBuffer, ["\\Seen"], new Date());

        await client.logout();
        return { success: true };
    } catch (err: any) {
        try { await client.logout(); } catch { /* ignore */ }
        // Don't fail the send — just log. The email was already delivered.
        console.warn("[IMAP Sent] Failed to append to Sent folder:", err.message);
        return { success: false, error: err.message || "IMAP append failed" };
    }
}
