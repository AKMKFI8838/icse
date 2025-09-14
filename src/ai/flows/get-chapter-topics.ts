'use server';
/**
 * @fileOverview A flow to retrieve the list of topics for a chapter.
 *
 * - getChapterTopics - A function that returns a list of topic names.
 * - GetChapterTopicsInput - The input type for the getChapterTopics function.
 * - GetChapterTopicsOutput - The return type for the getChapterTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetChapterTopicsInputSchema = z.object({
  subject: z.string().describe('The subject of the chapter, e.g., Physics.'),
  chapter: z.string().describe('The name of the chapter.'),
  length: z.enum(['Short', 'Medium', 'Full']).describe('The desired length of the chapter notes.'),
});
export type GetChapterTopicsInput = z.infer<typeof GetChapterTopicsInputSchema>;


const GetChapterTopicsOutputSchema = z.object({
  topics: z.array(z.string().describe("A key topic or sub-heading from the chapter."))
});
export type GetChapterTopicsOutput = z.infer<typeof GetChapterTopicsOutputSchema>;

export async function getChapterTopics(input: GetChapterTopicsInput): Promise<GetChapterTopicsOutput> {
  return getChapterTopicsFlow(input);
}

const getTopicsPrompt = ai.definePrompt({
    name: 'getChapterTopicsPrompt',
    input: {schema: GetChapterTopicsInputSchema},
    output: {schema: GetChapterTopicsOutputSchema},
    prompt: `You are an expert educator for the ICSE 10th grade curriculum. 
    List the main topics and sub-headings for the given chapter. The number of topics should depend on the desired length of the notes.
    
    Subject: {{{subject}}}
    Chapter: {{{chapter}}}
    Desired Length: {{{length}}}

    - If Length is "Short", list 3-4 key topics.
    - If Length is "Medium", list 5-7 main topics.
    - If Length is "Full", list 8-12 comprehensive topics and sub-topics.
    
    Return only the list of topic names.`,
});

const getChapterTopicsFlow = ai.defineFlow(
  {
    name: 'getChapterTopicsFlow',
    inputSchema: GetChapterTopicsInputSchema,
    outputSchema: GetChapterTopicsOutputSchema,
  },
  async ({ subject, chapter, length }) => {
    const { output } = await getTopicsPrompt({ subject, chapter, length });
    if (!output?.topics || output.topics.length === 0) {
        throw new Error("Could not generate chapter topics.");
    }
    return { topics: output.topics };
  }
);
