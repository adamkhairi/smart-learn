import React, { useState, useEffect, useMemo } from 'react';
import { SerializedEditorState } from 'lexical';
import { Editor } from '@/components/blocks/editor-00/editor';
import { Label } from './label';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface RichTextEditorProps {
    id?: string;
    label?: string;
    value: string | SerializedEditorState | null;
    onChange: (jsonContent: string, htmlContent: string) => void;
    error?: string;
    className?: string;
    required?: boolean;
    height?: number;
    minLength?: number;
    maxLength?: number;
    showWordCount?: boolean;
    showContentQuality?: boolean;
    placeholder?: string;
}

// Content quality metrics
interface ContentQuality {
    score: number;
    level: 'poor' | 'fair' | 'good' | 'excellent';
    issues: string[];
    suggestions: string[];
}

// Create initial empty state
const createEmptyEditorState = (): SerializedEditorState => ({
    root: {
        children: [
            {
                children: [],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
            },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
} as unknown as SerializedEditorState);

// Parse the value (could be JSON string or already parsed object)
const parseEditorValue = (value: string | SerializedEditorState | null): SerializedEditorState => {
    if (!value) return createEmptyEditorState();

    // If it's already a parsed object, return it
    if (typeof value === 'object' && value.root) {
        return value;
    }

    // If it's a string, try to parse as JSON
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (parsed && parsed.root) {
                return parsed;
            }
        } catch {
            // If JSON parsing fails, it might be HTML or plain text
            // For now, create empty state and let user re-enter content
            console.warn('Could not parse editor content, creating empty state');
        }
    }

    return createEmptyEditorState();
};

// Extract text content from editor state for validation
const extractTextContent = (editorState: SerializedEditorState): string => {
    try {
        const root = editorState?.root;
        if (!root?.children) return '';

        const extractFromNode = (node: Record<string, unknown>): string => {
            if (node.type === 'text') {
                return (node.text as string) || '';
            }
            if (node.children && Array.isArray(node.children)) {
                return node.children.map(extractFromNode).join('');
            }
            return '';
        };

        return root.children.map(extractFromNode).join(' ').trim();
    } catch {
        return '';
    }
};

// Analyze content quality
const analyzeContentQuality = (text: string, htmlContent: string): ContentQuality => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check length
    if (text.length < 10) {
        issues.push('Content is very short');
        suggestions.push('Add more detailed information');
        score -= 30;
    } else if (text.length < 50) {
        issues.push('Content is quite short');
        suggestions.push('Consider adding more explanation');
        score -= 15;
    }

    // Check for basic formatting
    if (!htmlContent.includes('<h') && text.length > 100) {
        issues.push('No headings found');
        suggestions.push('Use headings to structure your content');
        score -= 10;
    }

    // Check for lists when content is long
    if (text.length > 200 && !htmlContent.includes('<ul>') && !htmlContent.includes('<ol>')) {
        suggestions.push('Consider using lists to improve readability');
        score -= 5;
    }

    // Check sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 1 && text.length > 100) {
        issues.push('Very long sentences detected');
        suggestions.push('Break content into shorter sentences');
        score -= 10;
    }

    // Determine quality level
    let level: ContentQuality['level'];
    if (score >= 90) level = 'excellent';
    else if (score >= 75) level = 'good';
    else if (score >= 60) level = 'fair';
    else level = 'poor';

    return { score: Math.max(0, score), level, issues, suggestions };
};

export function RichTextEditor({
    id,
    label,
    value,
    onChange,
    error,
    className,
    required = false,
    minLength,
    maxLength,
    showWordCount = true,
    showContentQuality = false,
    placeholder = "Type your content here...",
}: RichTextEditorProps) {
    const [editorState, setEditorState] = useState<SerializedEditorState>(() => {
        return parseEditorValue(value);
    });

    // Update editor state when value prop changes
    useEffect(() => {
        setEditorState(parseEditorValue(value));
    }, [value]);

    // Memoize content analysis to avoid expensive recalculations
    const contentAnalysis = useMemo(() => {
        const textContent = extractTextContent(editorState);
        const htmlContent = convertLexicalToHTML(editorState);

        const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
        const charCount = textContent.length;

        const validation: {
            isValid: boolean;
            lengthError?: string;
            lengthWarning?: string;
        } = { isValid: true };

        // Length validation
        if (required && charCount === 0) {
            validation.isValid = false;
            validation.lengthError = 'Content is required';
        } else if (minLength && charCount < minLength && charCount > 0) {
            validation.isValid = false;
            validation.lengthError = `Content must be at least ${minLength} characters (currently ${charCount})`;
        } else if (maxLength && charCount > maxLength) {
            validation.isValid = false;
            validation.lengthError = `Content must not exceed ${maxLength} characters (currently ${charCount})`;
        } else if (maxLength && charCount > maxLength * 0.9) {
            validation.lengthWarning = `Approaching character limit (${charCount}/${maxLength})`;
        }

        const quality = showContentQuality ? analyzeContentQuality(textContent, htmlContent) : null;

        return {
            textContent,
            htmlContent,
            wordCount,
            charCount,
            validation,
            quality
        };
    }, [editorState, required, minLength, maxLength, showContentQuality]);

    const handleChange = (newEditorState: SerializedEditorState) => {
        setEditorState(newEditorState);

        // Convert editor state to HTML for display purposes
        const htmlContent = convertLexicalToHTML(newEditorState);

        // Store both JSON (for editor) and HTML (for display)
        onChange(JSON.stringify(newEditorState), htmlContent);
    };

    // Get quality indicator color
    const getQualityColor = (level: string) => {
        switch (level) {
            case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
            case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'poor': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label htmlFor={id}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
            )}

            <div className="relative">
                <Editor
                    editorSerializedState={editorState}
                    onSerializedChange={handleChange}
                />
            </div>

            {/* Content Statistics */}
            {showWordCount && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>{contentAnalysis.wordCount} words</span>
                        <span>{contentAnalysis.charCount} characters</span>
                        {maxLength && (
                            <span className={cn(
                                contentAnalysis.charCount > maxLength * 0.9 ? 'text-amber-600' : '',
                                contentAnalysis.charCount > maxLength ? 'text-red-600' : ''
                            )}>
                                {contentAnalysis.charCount}/{maxLength}
                            </span>
                        )}
                    </div>

                    {/* Content Quality Indicator */}
                    {showContentQuality && contentAnalysis.quality && contentAnalysis.charCount > 0 && (
                        <Badge
                            variant="outline"
                            className={cn('text-xs', getQualityColor(contentAnalysis.quality.level))}
                        >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {contentAnalysis.quality.level} ({contentAnalysis.quality.score}%)
                        </Badge>
                    )}
                </div>
            )}

            {/* Validation Messages */}
            {(error || contentAnalysis.validation.lengthError) && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || contentAnalysis.validation.lengthError}
                    </AlertDescription>
                </Alert>
            )}

            {/* Warning Messages */}
            {contentAnalysis.validation.lengthWarning && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        {contentAnalysis.validation.lengthWarning}
                    </AlertDescription>
                </Alert>
            )}

            {/* Content Quality Feedback */}
            {showContentQuality && contentAnalysis.quality && contentAnalysis.charCount > 0 && (
                contentAnalysis.quality.issues.length > 0 || contentAnalysis.quality.suggestions.length > 0
            ) && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-1">
                            {contentAnalysis.quality.issues.length > 0 && (
                                <div>
                                    <p className="font-medium text-amber-800">Issues:</p>
                                    <ul className="list-disc list-inside text-sm">
                                        {contentAnalysis.quality.issues.map((issue, index) => (
                                            <li key={index}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {contentAnalysis.quality.suggestions.length > 0 && (
                                <div>
                                    <p className="font-medium text-blue-800">Suggestions:</p>
                                    <ul className="list-disc list-inside text-sm">
                                        {contentAnalysis.quality.suggestions.map((suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}

// Convert Lexical editor state to HTML for display
function convertLexicalToHTML(editorState: SerializedEditorState): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = editorState?.root as any;
    if (!root?.children) {
        return '';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const convertNodeToHTML = (node: any): string => {
        if (node.type === 'text') {
            let text = node.text || '';

            // This is a workaround to handle markdown-style images
            // A proper implementation would use a custom ImageNode
            const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
            text = text.replace(imageRegex, (_match: string, alt: string, src: string) => {
                return `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto;" />`;
            });

            // Apply text formatting
            if (node.format) {
                if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
                if (node.format & 2) text = `<em>${text}</em>`; // Italic
                if (node.format & 8) text = `<u>${text}</u>`; // Underline
            }

            return text;
        }

        if (node.type === 'paragraph') {
            const content = node.children ? node.children.map(convertNodeToHTML).join('') : '';
            if (!content.trim()) return '<p><br></p>';

            const alignment = node.format || 'left';
            const alignClass = alignment !== 'left' ? ` style="text-align: ${alignment}"` : '';
            return `<p${alignClass}>${content}</p>`;
        }

        if (node.type === 'heading') {
            const content = node.children ? node.children.map(convertNodeToHTML).join('') : '';
            if (!content.trim()) return '';

            const tag = node.tag || 'h1';
            const alignment = node.format || 'left';
            const alignClass = alignment !== 'left' ? ` style="text-align: ${alignment}"` : '';
            return `<${tag}${alignClass}>${content}</${tag}>`;
        }

        if (node.type === 'list') {
            const content = node.children ? node.children.map(convertNodeToHTML).join('') : '';
            if (!content.trim()) return '';

            const tag = node.listType === 'number' ? 'ol' : 'ul';
            return `<${tag}>${content}</${tag}>`;
        }

        if (node.type === 'listitem') {
            const content = node.children ? node.children.map(convertNodeToHTML).join('') : '';
            return `<li>${content}</li>`;
        }

        if (node.type === 'link') {
            const content = node.children ? node.children.map(convertNodeToHTML).join('') : '';
            const url = node.url || '#';
            // Always open links in a new tab for security and better UX.
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${content}</a>`;
        }

        // Handle other node types
        if (node.children && Array.isArray(node.children)) {
            return node.children.map(convertNodeToHTML).join('');
        }

        return '';
    };

    return root.children.map(convertNodeToHTML).join('');
}
