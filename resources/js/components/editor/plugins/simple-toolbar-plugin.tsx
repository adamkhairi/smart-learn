import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Image,
    Italic,
    Link,
    List,
    ListOrdered,
    Redo,
    Type,
    Underline,
    Undo,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { INSERT_IMAGE_COMMAND } from './image-plugin';
import { FORMAT_ELEMENT_COMMAND, TextAlignType } from './text-align-plugin';

export function SimpleToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [blockType, setBlockType] = useState('paragraph');
    const [textAlign, setTextAlign] = useState<TextAlignType>('left');
    const [isLink, setIsLink] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));

            const node = selection.anchor.getNode();
            const parent = node.getParent();
            setIsLink($isLinkNode(parent) || $isLinkNode(node));

            // Update block type and alignment based on selection
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
            const elementDOM = editor.getElementByKey(element.getKey());
            if (elementDOM !== null) {
                const type = elementDOM.tagName.toLowerCase();
                setBlockType(type === 'h1' || type === 'h2' || type === 'h3' ? type : 'paragraph');

                // Get current text alignment
                const currentAlign = element.getFormat() || 'left';
                setTextAlign(currentAlign as TextAlignType);
            }
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    const formatText = (format: 'bold' | 'italic' | 'underline') => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const formatHeading = (headingSize: 'h1' | 'h2' | 'h3' | 'paragraph') => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (headingSize === 'paragraph') {
                    $setBlocksType(selection, () => $createParagraphNode());
                } else {
                    $setBlocksType(selection, () => $createHeadingNode(headingSize));
                }
            }
        });
    };

    const insertLink = () => {
        if (!isLink) {
            setShowLinkDialog(true);
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    };

    const handleLinkInsert = () => {
        if (linkUrl) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
            setShowLinkDialog(false);
            setLinkUrl('');
        }
    };

    const insertImage = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            const alt = prompt('Enter image description (optional):') || 'Image';
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, alt });
        }
    };

    const undo = () => {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
    };

    const redo = () => {
        editor.dispatchCommand(REDO_COMMAND, undefined);
    };

    const insertUnorderedList = () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    };

    const insertOrderedList = () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    };

    const setAlignment = (alignment: TextAlignType) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
        setTextAlign(alignment);
    };

    return (
        <div className="flex flex-wrap items-center gap-2 border-b bg-background p-2">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={undo} className="h-8 w-8 p-0" title="Undo">
                    <Undo className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={redo} className="h-8 w-8 p-0" title="Redo">
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Text Style */}
            <Select value={blockType} onValueChange={formatHeading}>
                <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="paragraph">
                        <div className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Normal
                        </div>
                    </SelectItem>
                    <SelectItem value="h1">
                        <div className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Heading 1
                        </div>
                    </SelectItem>
                    <SelectItem value="h2">
                        <div className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Heading 2
                        </div>
                    </SelectItem>
                    <SelectItem value="h3">
                        <div className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Heading 3
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* Basic text formatting */}
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant={isBold ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => formatText('bold')}
                    className="h-8 w-8 p-0"
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={isItalic ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => formatText('italic')}
                    className="h-8 w-8 p-0"
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={isUnderline ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => formatText('underline')}
                    className="h-8 w-8 p-0"
                    title="Underline"
                >
                    <Underline className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={isLink ? 'default' : 'ghost'}
                    size="sm"
                    onClick={insertLink}
                    className="h-8 w-8 p-0"
                    title="Insert Link"
                >
                    <Link className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Lists */}
            <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={insertUnorderedList} className="h-8 w-8 p-0" title="Bullet List">
                    <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={insertOrderedList} className="h-8 w-8 p-0" title="Numbered List">
                    <ListOrdered className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Text Alignment */}
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant={textAlign === 'left' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAlignment('left')}
                    className="h-8 w-8 p-0"
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={textAlign === 'center' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAlignment('center')}
                    className="h-8 w-8 p-0"
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={textAlign === 'right' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAlignment('right')}
                    className="h-8 w-8 p-0"
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={textAlign === 'justify' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAlignment('justify')}
                    className="h-8 w-8 p-0"
                    title="Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Links and Images */}
            <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={insertImage} className="h-8 w-8 p-0" title="Insert Image">
                    <Image className="h-4 w-4" />
                </Button>
            </div>
            <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Link</DialogTitle>
                        <DialogDescription>Enter the URL you want to link to.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Label htmlFor="link-url">URL</Label>
                        <Input id="link-url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowLinkDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleLinkInsert}>Insert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
