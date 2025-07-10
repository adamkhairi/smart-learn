import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { ContentEditable } from '@/components/editor/editor-ui/content-editable';
import { ImagePlugin } from '@/components/editor/plugins/image-plugin';
import { SimpleToolbarPlugin } from '@/components/editor/plugins/simple-toolbar-plugin';
import { TextAlignPlugin } from '@/components/editor/plugins/text-align-plugin';

export function Plugins() {
    return (
        <div className="relative">
            {/* Simple toolbar like Google Classroom */}
            <SimpleToolbarPlugin />

            <div className="relative">
                <RichTextPlugin
                    contentEditable={
                        <div className="min-h-[400px] p-4 focus-within:outline-none">
                            <ContentEditable placeholder="Type your content here..." />
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />

                {/* Essential plugins for educational content */}
                <HistoryPlugin />
                <AutoFocusPlugin />
                <ListPlugin />
                <LinkPlugin />
                <ImagePlugin />
                <TextAlignPlugin />
            </div>
        </div>
    );
}
