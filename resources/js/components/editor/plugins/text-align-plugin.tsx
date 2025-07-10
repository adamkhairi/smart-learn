import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import { $getSelection, $isParagraphNode, $isRangeSelection, COMMAND_PRIORITY_CRITICAL, createCommand, LexicalCommand } from 'lexical';
import { useEffect } from 'react';

export type TextAlignType = 'left' | 'center' | 'right' | 'justify';

// Create alignment commands
export const FORMAT_ELEMENT_COMMAND: LexicalCommand<TextAlignType> = createCommand();

// Helper function to set text alignment
export function $setTextAlign(alignment: TextAlignType) {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const nodes = selection.getNodes();

    nodes.forEach((node) => {
        const element = node.getTopLevelElementOrThrow();
        if ($isParagraphNode(element) || $isHeadingNode(element)) {
            element.setFormat(alignment);
        }
    });
}

export function TextAlignPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // Register command for text alignment
        const unregister = editor.registerCommand(
            FORMAT_ELEMENT_COMMAND,
            (alignment: TextAlignType) => {
                editor.update(() => {
                    $setTextAlign(alignment);
                });
                return true;
            },
            COMMAND_PRIORITY_CRITICAL,
        );

        return () => {
            unregister();
        };
    }, [editor]);

    return null;
}
