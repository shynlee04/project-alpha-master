/**
 * @fileoverview RAG Query Optimizer - Default Configuration
 * @module lib/rag/query-optimizer-config
 * @governance EPIC-32-4
 *
 * Default configuration values for query parser.
 */

import type { QueryParserConfig } from './query-optimizer-types';

/**
 * Default query parser configuration
 */
export const DEFAULT_CONFIG: Required<QueryParserConfig> = {
  minKeywordLength: 2,
  maxKeywords: 10,
  enableEntityExtraction: true,
  enableFilterSuggestion: true,
  stopWords: [
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his',
    'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which',
    'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'about',
    'get', 'got', 'getting', 'like', 'know', 'make', 'made', 'making',
    'think', 'see', 'come', 'want', 'use', 'find', 'give', 'tell', 'try',
    'leave', 'call', 'keep', 'let', 'put', 'seem', 'help', 'show', 'hear',
    'play', 'run', 'move', 'live', 'believe', 'bring', 'happen', 'say',
    'said', 'saying', 'also', 'now', 'even', 'still', 'well', 'back',
    'much', 'way', 'new', 'first', 'last', 'long', 'great', 'little',
    'own', 'old', 'right', 'big', 'high', 'different', 'small', 'large',
    'next', 'early', 'young', 'important', 'public', 'bad', 'good',
    'best', 'better', 'worst', 'worse', 'real', 'bit', 'actually',
    'really', 'something', 'anything', 'everything', 'nothing', 'someone',
    'anyone', 'everyone', 'nobody', 'somewhere', 'anywhere', 'everywhere',
  ],
};
