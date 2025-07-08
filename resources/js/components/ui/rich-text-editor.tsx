import React, { useState, useEffect } from 'react';
import { SerializedEditorState } from 'lexical';
import { Editor } from '@/components/blocks/editor-00/editor';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    id?: string;
    label?: string;
    value: string | SerializedEditorState | null;
    onChange: (jsonContent: string, htmlContent: string) => void;
    error?: string;
    className?: string;
    required?: boolean;
    height?: number;
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

export function RichTextEditor({
    id,
    label,
    value,
    onChange,
    error,
    className,
    required = false,
}: RichTextEditorProps) {
    const [editorState, setEditorState] = useState<SerializedEditorState>(() => {
        return parseEditorValue(value);
    });

    // Update editor state when value prop changes
    useEffect(() => {
        setEditorState(parseEditorValue(value));
    }, [value]);

    const handleChange = (newEditorState: SerializedEditorState) => {
        setEditorState(newEditorState);

        // Convert editor state to HTML for display purposes
        const htmlContent = convertLexicalToHTML(newEditorState);

        // Store both JSON (for editor) and HTML (for display)
        onChange(JSON.stringify(newEditorState), htmlContent);
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
            {error && (
                <p className="text-sm text-red-600">{error}</p>
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
