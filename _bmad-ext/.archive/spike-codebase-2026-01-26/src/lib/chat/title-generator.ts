/**
 * @fileoverview Conversation Title Generator
 * @module lib/chat/title-generator
 *
 * Auto-generates conversation titles from first user message.
 * Uses simple heuristics to create meaningful, concise titles.
 */

/**
 * Generate a title from the first user message
 *
 * @param firstMessage - First user message content
 * @param maxLength - Maximum title length (default: 50)
 * @returns Generated conversation title
 */
export function generateConversationTitle(
  firstMessage: string,
  maxLength: number = 50
): string {
  if (!firstMessage || firstMessage.trim().length === 0) {
    return 'New Conversation';
  }

  // Remove leading/trailing whitespace
  const trimmed = firstMessage.trim();

  // Extract first sentence or line
  const firstSentence = trimmed.split(/[.!?]/)[0];
  const firstLine = trimmed.split('\n')[0];
  const extract = firstSentence.length < firstLine.length
    ? firstSentence
    : firstLine;

  // Remove common prefixes
  const cleaned = extract
    .replace(/^(can you|please|could you|help me|I need|I want|i need|i want)\s+/i, '')
    .replace(/^_\s*/, '')  // Remove leading underscore
    .trim();

  // Capitalize first letter
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Truncate if too long
  if (capitalized.length > maxLength) {
    return capitalized.substring(0, maxLength - 3).trim() + '...';
  }

  // Fallback if cleaning removed everything
  if (capitalized.length === 0) {
    return 'New Conversation';
  }

  return capitalized;
}

/**
 * Generate a title from AI response
 *
 * @param aiResponse - AI assistant response
 * @param maxLength - Maximum title length (default: 50)
 * @returns Generated conversation title
 */
export function generateTitleFromAIResponse(
  aiResponse: string,
  maxLength: number = 50
): string {
  if (!aiResponse || aiResponse.trim().length === 0) {
    return 'New Conversation';
  }

  // Extract first meaningful sentence
  const sentences = aiResponse.split(/[.!?]/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) {
    return 'New Conversation';
  }

  const firstSentence = sentences[0].trim();

  // Remove code blocks
  const withoutCode = firstSentence.replace(/```[\s\S]*?```/g, '').trim();

  // Capitalize and truncate
  const capitalized = withoutCode.charAt(0).toUpperCase() + withoutCode.slice(1);
  const truncated = capitalized.length > maxLength
    ? capitalized.substring(0, maxLength - 3).trim() + '...'
    : capitalized;

  return truncated || 'New Conversation';
}

/**
 * Generate a title from a conversation thread
 *
 * @param messages - Array of messages in the thread
 * @param maxLength - Maximum title length (default: 50)
 * @returns Generated conversation title
 */
export function generateTitleFromMessages(
  messages: Array<{ role: string; content: string }>,
  maxLength: number = 50
): string {
  if (!messages || messages.length === 0) {
    return 'New Conversation';
  }

  // Find first user message
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    return generateConversationTitle(firstUserMessage.content, maxLength);
  }

  // Fallback to first message
  return generateTitleFromAIResponse(messages[0].content, maxLength);
}
