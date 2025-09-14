'use server';
/**
 * @fileOverview An AI agent that answers student questions.
 *
 * - solveMyDoubts - A function that handles answering student questions.
 * - SolveMyDoubtsInput - The input type for the solveMyDoubts function.
 * - SolveMyDoubtsOutput - The return type for the solveMyDoubts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveMyDoubtsInputSchema = z.object({
  question: z.string().describe('The question the student is asking.'),
  difficulty: z
    .enum(['Low', 'Medium', 'High'])
    .optional()
    .describe('The difficulty level of the question.'),
});
export type SolveMyDoubtsInput = z.infer<typeof SolveMyDoubtsInputSchema>;

const SolveMyDoubtsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type SolveMyDoubtsOutput = z.infer<typeof SolveMyDoubtsOutputSchema>;

export async function solveMyDoubts(
  input: SolveMyDoubtsInput
): Promise<SolveMyDoubtsOutput> {
  return solveMyDoubtsFlow(input);
}

const answerPrompt = ai.definePrompt({
  name: 'solveMyDoubtsPrompt',
  input: {schema: SolveMyDoubtsInputSchema},
  output: {schema: z.object({answer: z.string()})},
  prompt: `You are a helpful AI chatbot that answers student questions related to the ICSE 10th board exam syllabus.

  Question: {{{question}}}
  Difficulty Level: {{{difficulty}}}

  Provide a clear and concise answer. Keep your answer brief and to the point.`,
});

const solveMyDoubtsFlow = ai.defineFlow(
  {
    name: 'solveMyDoubtsFlow',
    inputSchema: SolveMyDoubtsInputSchema,
    outputSchema: SolveMyDoubtsOutputSchema,
  },
  async input => {
    const {output: answerOutput} = await answerPrompt(input);
    if (!answerOutput?.answer) {
      throw new Error('Could not generate an answer.');
    }
    
    return {
      answer: answerOutput.answer,
    };
  }
);
