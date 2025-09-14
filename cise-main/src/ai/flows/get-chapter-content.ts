'use server';
/**
 * @fileOverview Retrieves educational content for a specific ICSE 10th grade chapter.
 *
 * - getChapterContent - A function that fetches a chapter's explanation and key diagrams.
 * - ChapterContentInput - The input type for the getChapterContent function.
 * - ChapterContentOutput - The return type for the getChapterContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChapterContentInputSchema = z.object({
  subject: z.string().describe('The subject of the chapter, e.g., Physics, Biology.'),
  chapter: z.string().describe('The name of the chapter.'),
});
export type ChapterContentInput = z.infer<typeof ChapterContentInputSchema>;

const ChapterContentOutputSchema = z.object({
  explanation: z.string().describe('A concise and clear explanation of the chapter\'s key concepts, suitable for revision.'),
  diagrams: z.array(z.object({
    title: z.string().describe('The title of the diagram.'),
    description: z.string().describe('A brief description of what the diagram illustrates.'),
    imageUrl: z.string().url().describe('A placeholder image URL for the diagram. Use picsum.photos service for this. e.g. https://picsum.photos/600/400'),
  })).describe('An array of important diagrams from the chapter, each with a title, description, and an image URL.'),
});
export type ChapterContentOutput = z.infer<typeof ChapterContentOutputSchema>;


export async function getChapterContent(input: ChapterContentInput): Promise<ChapterContentOutput> {
  return getChapterContentFlow(input);
}

const getChapterContentPrompt = ai.definePrompt({
  name: 'getChapterContentPrompt',
  input: {schema: ChapterContentInputSchema},
  output: {schema: ChapterContentOutputSchema},
  prompt: `You are an expert educator for the ICSE 10th grade curriculum.
  Your task is to provide study materials for a specific chapter.

  Subject: {{{subject}}}
  Chapter: {{{chapter}}}

  1.  **Explanation**: Provide a concise but comprehensive explanation of the main topics in this chapter. It should be easy to understand and suitable for quick revision. Format it nicely.
  2.  **Diagrams**: Identify up to 4 of the most important diagrams in this chapter that a student must know for their exam. For each diagram:
      -   Provide a clear title.
      -   Provide a short, simple description.
      -   Provide a placeholder image URL from picsum.photos (e.g., https://picsum.photos/600/400).

  Return the final output in the required JSON format.
  `,
});

const getChapterContentFlow = ai.defineFlow(
  {
    name: 'getChapterContentFlow',
    inputSchema: ChapterContentInputSchema,
    outputSchema: ChapterContentOutputSchema,
  },
  async (input) => {
    const {output} = await getChapterContentPrompt(input);
    return output!;
  }
);
