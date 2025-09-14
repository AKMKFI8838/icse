'use server';
/**
 * @fileOverview A flow to generate quick revision notes on a specific topic.
 *
 * - getQuickRevisionNotes - A function that generates revision notes for a given topic.
 * - GetQuickRevisionNotesInput - The input type for the getQuickRevisionNotes function.
 * - GetQuickRevisionNotesOutput - The return type for the getQuickRevisionNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetQuickRevisionNotesInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate revision notes.'),
  difficulty: z
    .enum(['low', 'medium', 'high'])
    .describe('The difficulty level of the revision notes.'),
});
export type GetQuickRevisionNotesInput = z.infer<typeof GetQuickRevisionNotesInputSchema>;

const GetQuickRevisionNotesOutputSchema = z.object({
  notes: z.string().describe('The generated revision notes for the topic.'),
});
export type GetQuickRevisionNotesOutput = z.infer<typeof GetQuickRevisionNotesOutputSchema>;

export async function getQuickRevisionNotes(input: GetQuickRevisionNotesInput): Promise<GetQuickRevisionNotesOutput> {
  return getQuickRevisionNotesFlow(input);
}

const notesPrompt = ai.definePrompt({
  name: 'getQuickRevisionNotesPrompt',
  input: {schema: GetQuickRevisionNotesInputSchema},
  output: {schema: z.object({ notes: z.string() })},
  prompt: `You are an expert in creating concise and effective revision notes for students.

  Generate revision notes for the following topic, tailored to the specified difficulty level:

  Topic: {{{topic}}}
  Difficulty: {{{difficulty}}}

  Ensure the notes are easy to understand, cover the key concepts, and are suitable for quick review.`,
});

const getQuickRevisionNotesFlow = ai.defineFlow(
  {
    name: 'getQuickRevisionNotesFlow',
    inputSchema: GetQuickRevisionNotesInputSchema,
    outputSchema: GetQuickRevisionNotesOutputSchema,
  },
  async input => {
    const { output: notesOutput } = await notesPrompt(input);
    if(!notesOutput?.notes) {
      throw new Error("Could not generate revision notes.");
    }

    return {
      notes: notesOutput.notes,
    };
  }
);
