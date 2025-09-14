'use server';
/**
 * @fileOverview Generates important questions for a subject based on previous years' papers.
 *
 * - getImportantQuestions - A function that generates important questions.
 * - GetImportantQuestionsInput - The input type for the getImportantQuestions function.
 * - GetImportantQuestionsOutput - The return type for the getImportantQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetImportantQuestionsInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate important questions, e.g., Physics.'),
});
export type GetImportantQuestionsInput = z.infer<typeof GetImportantQuestionsInputSchema>;

const GetImportantQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The text of the important question.'),
      analysis: z.string().describe('A brief analysis of why the question is important, mentioning past trends or key concepts.'),
    })
  ).describe('An array of 20 important questions.'),
});
export type GetImportantQuestionsOutput = z.infer<typeof GetImportantQuestionsOutputSchema>;

export async function getImportantQuestions(input: GetImportantQuestionsInput): Promise<GetImportantQuestionsOutput> {
  return getImportantQuestionsFlow(input);
}

const getImportantQuestionsPrompt = ai.definePrompt({
  name: 'getImportantQuestionsPrompt',
  input: {schema: GetImportantQuestionsInputSchema},
  output: {schema: GetImportantQuestionsOutputSchema},
  prompt: `You are an expert educator and paper-setter for the ICSE 10th grade curriculum with deep knowledge of past examination trends.
Your task is to generate the top 20 most important questions for the subject: {{{subject}}}.

Your analysis must be based on a detailed review of previous years' question papers. The questions should be a mix from all chapters of the subject.

For each question, provide:
1.  **Question**: The question text itself.
2.  **Analysis**: A short, insightful reason why this question is important. For example, mention if it targets a fundamental concept that is frequently tested, or if it has appeared in a similar form in past papers (e.g., "Appeared in 2019 & 2022").

Return the final output in the required JSON format.
`,
});

const getImportantQuestionsFlow = ai.defineFlow(
  {
    name: 'getImportantQuestionsFlow',
    inputSchema: GetImportantQuestionsInputSchema,
    outputSchema: GetImportantQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await getImportantQuestionsPrompt(input);
    return output!;
  }
);
