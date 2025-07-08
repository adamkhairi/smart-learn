// Types for content rendering
export interface LexicalNode {
    type: string;
    children?: LexicalNode[];
    text?: string;
    format?: number | string;
    tag?: string;
    listType?: string;
    url?: string;
}

export interface LexicalEditorState {
    root?: {
        children?: LexicalNode[];
    };
}

// Cache for expensive conversions
const conversionCache = new Map<string, string>();
const CACHE_SIZE_LIMIT = 100; // Limit cache size to prevent memory leaks

/**
 * Convert Lexical JSON to HTML with error handling and caching
 */
export function convertLexicalToHTML(editorState: unknown): string {
    try {
        // Create cache key from stringified editor state
        const cacheKey = JSON.stringify(editorState);

        // Check cache first
        if (conversionCache.has(cacheKey)) {
            return conversionCache.get(cacheKey)!;
        }

        const state = editorState as LexicalEditorState;
        const root = state?.root;

        if (!root?.children) {
            return '';
        }

        const html = root.children.map(convertNodeToHTML).join('');

        // Cache the result (with size limit)
        if (conversionCache.size >= CACHE_SIZE_LIMIT) {
            // Remove oldest entry
            const firstKey = conversionCache.keys().next().value;
            if (firstKey !== undefined) {
                conversionCache.delete(firstKey);
            }
        }
        conversionCache.set(cacheKey, html);

        return html;
    } catch (error) {
        console.warn('Lexical to HTML conversion failed:', error);
        return '';
    }
}

/**
 * Convert a single Lexical node to HTML
 */
function convertNodeToHTML(node: LexicalNode): string {
    try {
        switch (node.type) {
            case 'text':
                return formatTextNode(node);
            case 'paragraph':
                return formatParagraphNode(node);
            case 'heading':
                return formatHeadingNode(node);
            case 'list':
                return formatListNode(node);
            case 'listitem':
                return formatListItemNode(node);
            case 'link':
                return formatLinkNode(node);
            case 'linebreak':
                return '<br>';
            default:
                // Handle unknown nodes gracefully
                if (node.children && Array.isArray(node.children)) {
                    return node.children.map(convertNodeToHTML).join('');
                }
                return '';
        }
    } catch (error) {
        console.warn('Node conversion failed:', error);
        return '';
    }
}

function formatTextNode(node: LexicalNode): string {
    let text = node.text || '';

    if (typeof node.format === 'number') {
        // Bitwise format flags
        if (node.format & 1) text = `<strong>${text}</strong>`;
        if (node.format & 2) text = `<em>${text}</em>`;
        if (node.format & 8) text = `<u>${text}</u>`;
        if (node.format & 16) text = `<code>${text}</code>`;
    }

    return text;
}

function formatParagraphNode(node: LexicalNode): string {
    const children = node.children || [];
    const content = children.map(convertNodeToHTML).join('');

    if (!content.trim()) {
        return '<p><br></p>';
    }

    const alignment = node.format as string;
    const style = alignment && alignment !== 'left'
        ? ` style="text-align: ${alignment}"`
        : '';

    return `<p${style}>${content}</p>`;
}

function formatHeadingNode(node: LexicalNode): string {
    const children = node.children || [];
    const content = children.map(convertNodeToHTML).join('');

    if (!content.trim()) {
        return '';
    }

    const tag = node.tag || 'h1';
    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const safeTag = validHeadings.includes(tag) ? tag : 'h1';

    const alignment = node.format as string;
    const style = alignment && alignment !== 'left'
        ? ` style="text-align: ${alignment}"`
        : '';

    return `<${safeTag}${style}>${content}</${safeTag}>`;
}

function formatListNode(node: LexicalNode): string {
    const children = node.children || [];
    const content = children.map(convertNodeToHTML).join('');

    if (!content.trim()) {
        return '';
    }

    const tag = node.listType === 'number' ? 'ol' : 'ul';
    return `<${tag}>${content}</${tag}>`;
}

function formatListItemNode(node: LexicalNode): string {
    const children = node.children || [];
    const content = children.map(convertNodeToHTML).join('');
    return `<li>${content}</li>`;
}

function formatLinkNode(node: LexicalNode): string {
    const children = node.children || [];
    const content = children.map(convertNodeToHTML).join('');
    const url = node.url || '#';

    // Basic URL validation
    const isValidUrl = /^https?:\/\//.test(url) || url.startsWith('/');
    const safeUrl = isValidUrl ? url : '#';

    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${content}</a>`;
}

/**
 * Extract plain text from HTML for previews
 */
export function extractTextFromHTML(html: string, maxLength: number = 150): string {
    try {
        // Remove HTML tags
        const text = html.replace(/<[^>]*>/g, '');
        // Decode HTML entities
        const div = document.createElement('div');
        div.innerHTML = text;
        const plainText = div.textContent || div.innerText || '';

        if (plainText.length <= maxLength) {
            return plainText;
        }

        return plainText.substring(0, maxLength).trim() + '...';
    } catch (error) {
        console.warn('Text extraction failed:', error);
        return '';
    }
}

/**
 * Get displayable content from various content formats
 */
export function getDisplayableContent(contentData: {
    content_html?: string;
    content_json?: string | object;
    content?: string;
}): string {
    // Priority: HTML > JSON > Legacy content
    if (contentData.content_html) {
        return contentData.content_html;
    }

    if (contentData.content_json) {
        try {
            const jsonContent = typeof contentData.content_json === 'string'
                ? JSON.parse(contentData.content_json)
                : contentData.content_json;

            const html = convertLexicalToHTML(jsonContent);
            if (html) return html;
        } catch (error) {
            console.warn('JSON content processing failed:', error);
        }
    }

    // Fallback to legacy content only if it's not JSON-like
    if (contentData.content) {
        const trimmed = contentData.content.trim();
        if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
            return contentData.content;
        }
    }

    return '';
}

/**
 * Get content preview for listings
 */
export function getContentPreview(contentData: {
    content_html?: string;
    content_json?: string | object;
    content?: string;
}, maxLength: number = 150): string {
    const content = getDisplayableContent(contentData);
    return extractTextFromHTML(content, maxLength);
}

/**
 * Check if content exists and is not empty
 */
export function hasContent(contentData: {
    content_html?: string;
    content_json?: string | object;
    content?: string;
}): boolean {
    const content = getDisplayableContent(contentData);
    return content.trim().length > 0;
}
