import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import type { Klass, LexicalNode } from 'lexical';

// Essential nodes for educational content
export const nodes: Array<Klass<LexicalNode>> = [HeadingNode, ListNode, ListItemNode, LinkNode];
