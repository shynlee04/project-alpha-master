/**
 * @fileoverview Storyboard Composite Tool
 * @module lib/agent/tools/composite/storyboard-tool
 *
 * Composite agentic tool that creates visual storyboards from concepts:
 * 1. Generate story outline
 * 2. Expand each frame with script + visual description
 * 3. Generate image generation prompts for each frame
 * 4. Optionally generate images
 *
 * User's use case: "throw an idea and AI creates storyboard with
 * script and sequential images"
 *
 * @epic EPIC-TOOLS - Agentic Tool Architecture
 * @story TOOLS-02 - Composite Tool Implementations
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import {
  StoryboardStyleSchema,
  type StoryboardResult,
  type StoryboardFrame,
  type CompositeToolContext,
} from './types';

/**
 * Storyboard tool input schema
 */
export const StoryboardInputSchema = z.object({
  concept: z.string().describe('The story concept, idea, or scenario'),
  style: StoryboardStyleSchema.optional().default('cinematic')
    .describe('Visual style for the storyboard'),
  frameCount: z.number().min(4).max(20).optional().default(8)
    .describe('Number of frames to generate (4-20)'),
  includeScript: z.boolean().optional().default(true)
    .describe('Include dialogue/script for each frame'),
  generateImagePrompts: z.boolean().optional().default(true)
    .describe('Generate image generation prompts for each frame'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']).optional().default('16:9')
    .describe('Aspect ratio for image prompts'),
  characters: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional()
    .describe('Main characters with their descriptions'),
});

export type StoryboardInput = z.infer<typeof StoryboardInputSchema>;

/**
 * Storyboard tool definition
 */
export const storyboardDef = toolDefinition({
  name: 'storyboard',
  description: `Create a visual storyboard from a story concept.
This composite tool orchestrates a multi-step creative workflow:
1. Generates a story outline with key scenes
2. Expands each scene with visual descriptions and script
3. Creates image generation prompts for each frame
4. (Optional) Generates images for each frame

Use this when you need to:
- Visualize a story or concept
- Create a comic or graphic novel layout
- Plan a video or animation sequence
- Generate sequential visual content`,
  inputSchema: StoryboardInputSchema,
  needsApproval: false, // Storyboard generation is creative, not destructive
});

/**
 * Technical specs by style
 */
function getTechnicalSpecs(style: string): string {
  const specs: Record<string, string> = {
    comic: 'bold outlines, flat colors, halftone dots, speech bubbles, dynamic panels',
    cinematic: 'dramatic lighting, shallow depth of field, film grain, widescreen',
    minimalist: 'simple shapes, limited color palette, clean lines, negative space',
    realistic: 'photorealistic, detailed textures, natural lighting, accurate proportions',
    anime: 'large expressive eyes, vibrant colors, dynamic poses, speed lines',
    sketch: 'pencil strokes, rough lines, gestural marks, cross-hatching',
  };
  return specs[style] || specs.cinematic;
}

/**
 * Create storyboard composite tool client implementation
 *
 * @param getContext - Function to get composite tool context
 * @returns TanStack AI tool client implementation
 */
export function createStoryboardTool(getContext: () => CompositeToolContext) {
  return storyboardDef.client(async (input: unknown): Promise<StoryboardResult> => {
    const args = input as StoryboardInput;
    const context = getContext();

    try {
      // Step 1: Generate story outline
      console.log('[StoryboardTool] Step 1: Generating story outline...');

      const characterDescriptions = args.characters
        ?.map((c) => `- ${c.name}: ${c.description}`)
        .join('\n') || '';

      const outlinePrompt = `Create a ${args.frameCount}-scene story outline for:

Concept: ${args.concept}

Style: ${args.style}
${characterDescriptions ? `\nCharacters:\n${characterDescriptions}` : ''}

For each scene, provide:
1. Scene number
2. Brief description (1-2 sentences)
3. Key action or emotion

Format as JSON array:
[
  { "scene": 1, "description": "...", "action": "..." },
  ...
]`;

      const outlineResponse = await context.callAI(outlinePrompt, {
        temperature: 0.7,
        systemPrompt: 'You are a creative storyboard artist. Create engaging, visual narratives.',
      });

      // Parse outline
      let scenes: Array<{ scene: number; description: string; action: string }> = [];
      try {
        const jsonMatch = outlineResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          scenes = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fallback: create simple scenes
        scenes = Array.from({ length: args.frameCount }, (_, i) => ({
          scene: i + 1,
          description: `Scene ${i + 1} of the story`,
          action: 'Key moment',
        }));
      }

      // Step 2: Expand each frame
      console.log('[StoryboardTool] Step 2: Expanding frames...');
      const frames: StoryboardFrame[] = [];

      for (const scene of scenes.slice(0, args.frameCount)) {
        const framePrompt = `Expand this scene for a ${args.style} storyboard:

Scene ${scene.scene}: ${scene.description}
Action: ${scene.action}

Provide:
1. Detailed visual description (camera angle, composition, lighting)
2. ${args.includeScript ? 'Dialogue/script for this scene' : 'No dialogue needed'}
3. Character positions and actions
4. Mood/atmosphere

Format as JSON:
{
  "visual": "...",
  "script": "...",
  "characters": [{ "character": "...", "position": "...", "action": "..." }],
  "cameraAngle": "...",
  "lighting": "...",
  "mood": "..."
}`;

        try {
          const frameResponse = await context.callAI(framePrompt, {
            temperature: 0.6,
            maxTokens: 500,
          });

          const jsonMatch = frameResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            // Generate image prompt for this frame
            let imagePrompt = '';
            if (args.generateImagePrompts) {
              const technicalSpecs = getTechnicalSpecs(args.style);
              imagePrompt = `${parsed.visual}, ${technicalSpecs}, ${parsed.lighting}, ${parsed.mood}, ${args.aspectRatio} aspect ratio`;
            }

            frames.push({
              index: scene.scene,
              scene: scene.description,
              script: parsed.script || undefined,
              visualDescription: parsed.visual,
              imagePrompt,
              characterPositions: parsed.characters,
              cameraAngle: parsed.cameraAngle,
              lighting: parsed.lighting,
              mood: parsed.mood,
            });
          }
        } catch {
          // Fallback frame
          frames.push({
            index: scene.scene,
            scene: scene.description,
            visualDescription: scene.description,
            imagePrompt: `${scene.description}, ${args.style} style`,
          });
        }
      }

      // Step 3: Generate synopsis
      console.log('[StoryboardTool] Step 3: Generating synopsis...');
      const synopsisPrompt = `Write a brief synopsis (2-3 sentences) for this storyboard:

Concept: ${args.concept}

Scenes:
${frames.map((f) => `${f.index}. ${f.scene}`).join('\n')}`;

      const synopsis = await context.callAI(synopsisPrompt, {
        temperature: 0.5,
        maxTokens: 150,
      });

      // Generate style guide
      const styleGuide = `Style: ${args.style}
Technical specs: ${getTechnicalSpecs(args.style)}
Aspect ratio: ${args.aspectRatio}
Frame count: ${frames.length}`;

      return {
        success: true,
        title: args.concept.substring(0, 50),
        synopsis: synopsis.trim(),
        frames,
        styleGuide,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storyboard error';
      console.error('[StoryboardTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}
