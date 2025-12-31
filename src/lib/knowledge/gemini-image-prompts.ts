/**
 * @fileoverview Gemini Image Processor Prompts
 * @module lib/knowledge/gemini-image-prompts
 * @governance EPIC-38, PHASE-5
 *
 * Prompt building logic for image analysis tasks.
 */

import type { GeminiImageOptions } from './gemini-image-types';

/**
 * Build analysis prompt based on options
 *
 * @param options - Processing options
 * @returns Analysis prompt string
 */
export function buildAnalysisPrompt(options: GeminiImageOptions): string {
  const extractText = options.extractText !== false;
  const generateDescription = options.generateDescription !== false;
  const analyzeStructure = options.analyzeStructure !== false;
  const detectObjects = options.detectObjects === true;

  const tasks = [];
  if (extractText) tasks.push('Extract ALL text visible in the image using OCR');
  if (generateDescription) tasks.push('Describe what is depicted in the image');
  if (analyzeStructure) tasks.push('Analyze the structure (diagrams, charts, graphs)');
  if (detectObjects) tasks.push('Detect and label objects');

  return `Analyze this image and provide detailed information in JSON format.

${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Specific tasks:
${extractText ? '- For handwritten text: transcribe accurately character-by-character\n- For printed text: extract all readable content' : ''}
${generateDescription ? '- Identify the main subject matter\n- Describe the visual style and composition' : ''}
${analyzeStructure ? '- If this is a chart/graph: identify type, axes, data points\n- If this is a diagram: identify components and relationships\n- If this is a screenshot: describe UI elements and their purpose' : ''}
${detectObjects ? '- List all detected objects with confidence scores\n- Provide bounding boxes for each object (percentage-based coordinates)' : ''}

Respond ONLY with valid JSON matching this structure:
{
  "text": "All extracted text (handwritten and printed)",
  "description": "Visual description of the image content",
  "imageType": "handwriting|diagram|chart|graph|screenshot|photo|other",
  "handwritingConfidence": 0.95,
  "structuredData": {
    "chartType": "bar|line|pie|scatter",
    "elements": ["element1", "element2"],
    "dataPoints": [{"label": "A", "value": 10}],
    "axes": {"x": "X-axis label", "y": "Y-axis label"}
  },
  "detectedObjects": [
    {"label": "person", "confidence": 0.98, "boundingBox": {"x": 10, "y": 20, "width": 30, "height": 40}}
  ],
  "textRegions": [
    {"text": "Sample text", "boundingBox": {"x": 0.1, "y": 0.2, "width": 0.3, "height": 0.05}}
  ]
}`;
}
