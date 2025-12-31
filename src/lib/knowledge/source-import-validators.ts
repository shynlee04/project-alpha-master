/**
 * @fileoverview Source Import Validators
 * @module lib/knowledge/source-import-validators
 * @governance EPIC-6-1, PHASE-5
 */

import { isPDF, getFileSizeMB } from './pdf-parser';

/**
 * Validate PDF file
 *
 * @param file - File to validate
 * @throws Error if file is invalid
 */
export function validatePDF(file: File): void {
    // Check file type
    if (!isPDF(file)) {
        throw new Error('Invalid file type. Only PDF files are supported.');
    }

    // Check file size (max 50MB)
    const sizeMB = getFileSizeMB(file);
    if (sizeMB > 50) {
        throw new Error(`File too large (${sizeMB.toFixed(2)}MB). Maximum size is 50MB.`);
    }
}

/**
 * Validate URL
 *
 * @param url - URL string to validate
 * @throws Error if URL is invalid
 */
export function validateURL(url: string): void {
    try {
        new URL(url);
    } catch {
        throw new Error('Invalid URL format. Please provide a valid URL (e.g., https://example.com).');
    }

    // Check for supported protocols
    const supportedProtocols = ['http:', 'https:'];
    const parsed = new URL(url);
    if (!supportedProtocols.includes(parsed.protocol)) {
        throw new Error(`Unsupported protocol: ${parsed.protocol}. Only HTTP and HTTPS are supported.`);
    }
}

/**
 * Validate image file
 *
 * @param file - Image file to validate
 * @throws Error if file is invalid
 */
export function validateImage(file: File): void {
    const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

    if (!supportedTypes.includes(file.type)) {
        throw new Error(
            `Unsupported image type: ${file.type}. Supported types: ${supportedTypes.join(', ')}`
        );
    }

    // Check file size (max 20MB for images)
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 20) {
        throw new Error(`Image too large (${sizeMB.toFixed(2)}MB). Maximum size is 20MB.`);
    }
}
