/**
 * Convert HTML message to JSON format
 * Extracts plain text and keeps formatted HTML
 */
export interface MessageJSON {
    text: string;
    html: string;
}

export function convertMessageToJSON(html: string): MessageJSON {
    if (!html || typeof html !== 'string') {
        return { text: '', html: '' };
    }

    // Extract plain text from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = (tempDiv.textContent || tempDiv.innerText || '').trim();

    return {
        text: plainText,
        html: html.trim(),
    };
}

/**
 * Convert JSON message back to HTML for display
 */
export function convertJSONToHTML(messageJSON: string | MessageJSON): string {
    try {
        let data: MessageJSON;

        if (typeof messageJSON === 'string') {
            data = JSON.parse(messageJSON);
        } else {
            data = messageJSON;
        }

        return data.html || data.text || '';
    } catch (error) {
        // If parsing fails, treat as plain text
        return typeof messageJSON === 'string' ? messageJSON : '';
    }
}

/**
 * Extract plain text from JSON message
 */
export function getPlainTextFromJSON(messageJSON: string | MessageJSON): string {
    try {
        let data: MessageJSON;

        if (typeof messageJSON === 'string') {
            data = JSON.parse(messageJSON);
        } else {
            data = messageJSON;
        }

        return data.text || '';
    } catch (error) {
        return typeof messageJSON === 'string' ? messageJSON : '';
    }
}
