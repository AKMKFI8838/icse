'use server';
/**
 * @fileOverview Retrieves educational content for a specific programming topic.
 *
 * - getLearningContent - A function that fetches explanations, code examples, and a quiz.
 * - LearningContentInput - The input type for the getLearningContent function.
 * - LearningContentOutput - The return type for the getLearningContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningContentInputSchema = z.object({
  topic: z.string().describe('The programming topic to learn, e.g., If-Else Statements.'),
});
export type LearningContentInput = z.infer<typeof LearningContentInputSchema>;

const LearningContentOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the programming topic, formatted for readability.'),
  codeExample: z.string().describe('A simple, correct code example in Java demonstrating the topic.'),
  quiz: z.object({
    question: z.string().describe('A multiple-choice question to test understanding.'),
    options: z.array(z.string()).describe('An array of 4 possible answers.'),
    correctAnswer: z.string().describe('The correct answer from the options.'),
    explanation: z.string().describe('A brief explanation for why the correct answer is right.'),
  }),
});
export type LearningContentOutput = z.infer<typeof LearningContentOutputSchema>;


export async function getLearningContent(input: LearningContentInput): Promise<LearningContentOutput> {
  return getLearningContentFlow(input);
}

const getLearningContentPrompt = ai.definePrompt({
  name: 'getLearningContentPrompt',
  input: {schema: LearningContentInputSchema},
  output: {schema: LearningContentOutputSchema},
  prompt: `You are an expert programmer and educator specializing in teaching Java to ICSE 10th grade students.
Your task is to provide a complete learning module for a specific programming topic.

Topic: {{{topic}}}

1.  **Explanation**: Provide a clear, step-by-step explanation of the topic. Use simple terms and analogies where possible. Ensure it is well-structured and easy to follow.
2.  **Code Example**: Write a simple and clean Java code example that demonstrates the topic in a practical way. The code should be fully complete and runnable.
3.  **Quiz**: Create a single multiple-choice question to check for understanding. The question should be relevant to the topic. Provide 4 options, one of which is correct. Also, provide a short explanation for the correct answer.

Return the final output in the required JSON format.
  `,
});

const getLearningContentFlow = ai.defineFlow(
  {
    name: 'getLearningContentFlow',
    inputSchema: LearningContentInputSchema,
    outputSchema: LearningContentOutputSchema,
  },
  async (input) => {
    const {output} = await getLearningContentPrompt(input);
    return output!;
  }
);
