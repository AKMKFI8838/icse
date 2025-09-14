
'use server';
/**
 * @fileOverview Creates a special message for mentioning a user.
 *
 * - mentionUser - A function that generates a mention message.
 * - MentionUserInput - The input type for the mentionUser function.
 * - MentionUserOutput - The return type for the mentionUser function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MentionUserInputSchema = z.object({
  mentionedUserName: z.string().describe('The name of the user being mentioned.'),
  mentionedUserId: z.string().describe('The ID of the user being mentioned.'),
});
export type MentionUserInput = z.infer<typeof MentionUserInputSchema>;

const MentionUserOutputSchema = z.object({
  mentionMessage: z.string().describe('The formatted message to display in the chat.'),
});
export type MentionUserOutput = z.infer<typeof MentionUserOutputSchema>;

export async function mentionUser(input: MentionUserInput): Promise<MentionUserOutput> {
  return mentionUserFlow(input);
}

const mentionUserPrompt = ai.definePrompt({
  name: 'mentionUserPrompt',
  input: {schema: MentionUserInputSchema},
  output: {schema: MentionUserOutputSchema},
  prompt: `You are a chat system assistant. A user has been mentioned. 
  Create a message that says the user is being called.
  
  User mentioned: {{{mentionedUserName}}}

  The output should be in the format: "@<UserName> is calling......."
  `,
});

const mentionUserFlow = ai.defineFlow(
  {
    name: 'mentionUserFlow',
    inputSchema: MentionUserInputSchema,
    outputSchema: MentionUserOutputSchema,
  },
  async input => {
    const {output} = await mentionUserPrompt(input);
    return output!;
  }
);
