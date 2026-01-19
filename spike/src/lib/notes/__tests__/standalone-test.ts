/**
 * Simple standalone test for note formatter
 */

import type { NoteRecord } from '../types';
import {
    formatNoteForStorage,
    parseNoteFromStorage,
    parsedToNoteRecord,
    getNoteFilename,
    extractNoteId,
} from '../format/note-formatter';

const mockNote: NoteRecord = {
    id: 'note-123',
    projectId: 'project-abc',
    workspaceId: 'ide',
    title: 'Test Note',
    emoji: '📝',
    blocks: [
        {
            id: 'block-1',
            type: 'heading',
            props: { level: 1 },
            content: [
                { type: 'text', text: 'Test Note' },
            ],
            children: [],
        } as any,
        {
            id: 'block-2',
            type: 'paragraph',
            props: {},
            content: [
                { type: 'text', text: 'This is test content' },
            ],
            children: [],
        } as any,
    ],
    parentId: 'parent-456',
    isFavorite: true,
    order: 5,
    isIndexed: true,
    indexedAt: Date.now(),
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
};

console.log('Testing formatNoteForStorage...');
const markdown = formatNoteForStorage(mockNote);
console.log('Markdown generated:');
console.log(markdown);
console.log('\n');
console.log('Testing parseNoteFromStorage...');
const parsed = parseNoteFromStorage(markdown, mockNote.id);
console.log('Parsed frontmatter:', JSON.stringify(parsed.frontmatter, null, 2));
console.log('Parsed blocks count:', parsed.blocks.length);
console.log('\n');
console.log('Testing parsedToNoteRecord...');
const restored = parsedToNoteRecord(parsed);
console.log('Restored note:', JSON.stringify({
    title: restored.title,
    id: restored.id,
}, null, 2));
console.log('\n');
console.log('Testing getNoteFilename...');
const filename = getNoteFilename('note-abc-123');
console.log('Generated filename:', filename);
console.log('Extracted ID:', extractNoteId(filename));
console.log('\n');
console.log('All tests completed successfully!');
