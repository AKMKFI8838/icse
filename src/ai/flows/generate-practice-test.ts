'use server';
/**
 * @fileOverview Generates practice tests tailored to a specific difficulty level.
 *
 * - generatePracticeTest - A function that generates practice tests.
 * - GeneratePracticeTestInput - The input type for the generatePracticeTest function.
 * - GeneratePracticeTestOutput - The return type for the generatePracticeTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePracticeTestInputSchema = z.object({
  difficulty: z
    .enum(['Low', 'Medium', 'High'])
    .describe('The difficulty level of the practice test.'),
  topic: z.string().describe('The topic of the practice test.'),
  numQuestions: z
    .number()
    .min(1)
    .max(50)
    .default(10)
    .describe('The number of questions to generate for the test.'),
});
export type GeneratePracticeTestInput = z.infer<typeof GeneratePracticeTestInputSchema>;

const GeneratePracticeTestOutputSchema = z.object({
  testQuestions: z.array(
    z.object({
      question: z.string().describe('The text of the question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ),
});
export type GeneratePracticeTestOutput = z.infer<typeof GeneratePracticeTestOutputSchema>;

export async function generatePracticeTest(input: GeneratePracticeTestInput): Promise<GeneratePracticeTestOutput> {
  return generatePracticeTestFlow(input);
}

const generatePracticeTestPrompt = ai.definePrompt({
  name: 'generatePracticeTestPrompt',
  input: {schema: GeneratePracticeTestInputSchema},
  output: {schema: GeneratePracticeTestOutputSchema},
  prompt: `You are an expert educator specializing in ICSE 10th grade curriculum.
  Generate a practice test for the topic "{{topic}}" with {{numQuestions}} questions.
  The difficulty level should be {{difficulty}}.

  Each question should have 4 options, with one correct answer.
  Return the questions in JSON format.
  Ensure that the difficulty level is appropriate for ICSE 10th grade students.
  Do not include any explanations or justifications for the answers.
  Only generate the test questions.

  {{#each testQuestions}}
  Question: {{this.question}}
  Options:
  {{#each this.options}}
  - {{this}}
  {{/each}}
  Correct Answer: {{this.correctAnswer}}
  {{/each}}`,
});

const generatePracticeTestFlow = ai.defineFlow(
  {
    name: 'generatePracticeTestFlow',
    inputSchema: GeneratePracticeTestInputSchema,
    outputSchema: GeneratePracticeTestOutputSchema,
  },
  async input => {
    const {output} = await generatePracticeTestPrompt(input);
    return output!;
  }
);
