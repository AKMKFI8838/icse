'use server';
/**
 * @fileOverview A flow to generate a full chapter explanation, broken down by topic.
 *
 * - getChapterAudio - A function that generates chapter notes by topic.
 * - GetChapterAudioInput - The input type for the getChapterAudio function.
 * - GetChapterAudioOutput - The return type for the getChapterAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetChapterAudioInputSchema = z.object({
  subject: z.string().describe('The subject of the chapter, e.g., Physics.'),
  chapter: z.string().describe('The name of the chapter.'),
  length: z.enum(['Short', 'Medium', 'Full']).describe('The desired length of the chapter notes.'),
});
export type GetChapterAudioInput = z.infer<typeof GetChapterAudioInputSchema>;

export interface ChapterTopic {
  topicName: string;
  topicText: string;
}

const GetChapterAudioOutputSchema = z.object({
  topics: z.array(z.object({
    topicName: z.string().describe('The name of the topic or sub-heading.'),
    topicText: z.string().describe('The detailed text notes for this specific topic.'),
  })).describe('An array of topics, each with its own text.'),
});
export type GetChapterAudioOutput = z.infer<typeof GetChapterAudioOutputSchema>;

export async function getChapterAudio(input: GetChapterAudioInput): Promise<GetChapterAudioOutput> {
  return getChapterAudioFlow(input);
}

const getTopicsPrompt = ai.definePrompt({
    name: 'getChapterTopicsPrompt',
    input: {schema: z.object({ subject: z.string(), chapter: z.string(), length: z.string() })},
    output: {schema: z.object({ topics: z.array(z.string().describe("A key topic or sub-heading from the chapter.")) })},
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

const getTopicTextPrompt = ai.definePrompt({
    name: 'getTopicTextPrompt',
    input: {schema: z.object({ subject: z.string(), chapter: z.string(), topicName: z.string(), length: z.string() })},
    output: {schema: z.object({ topicText: z.string() })},
    prompt: `You are an expert educator for the ICSE 10th grade curriculum.
    Provide a clear and detailed explanation for the following topic within the given chapter.
    The length and depth of the explanation should be based on the desired "Notes Length".
    - Short: A brief summary.
    - Medium: A standard explanation.
    - Full: A comprehensive, in-depth explanation with examples.

    Do not use markdown or special formatting. Just provide the plain text.

    Subject: {{{subject}}}
    Chapter: {{{chapter}}}
    Topic: {{{topicName}}}
    Notes Length: {{{length}}}
    `,
});

const getChapterAudioFlow = ai.defineFlow(
  {
    name: 'getChapterAudioFlow',
    inputSchema: GetChapterAudioInputSchema,
    outputSchema: GetChapterAudioOutputSchema,
  },
  async ({ subject, chapter, length }) => {
    // 1. Get the list of topics for the chapter
    const { output: topicsOutput } = await getTopicsPrompt({ subject, chapter, length });
    if (!topicsOutput?.topics || topicsOutput.topics.length === 0) {
        throw new Error("Could not generate chapter topics.");
    }
    
    const allTopics: ChapterTopic[] = [];

    // 2. For each topic, generate detailed notes
    for (const topicName of topicsOutput.topics) {
      // Generate detailed text notes for the topic
      const { output: textOutput } = await getTopicTextPrompt({ subject, chapter, topicName, length });
      if (!textOutput?.topicText) {
        console.warn(`Could not generate text for topic: ${topicName}`);
        allTopics.push({
            topicName,
            topicText: "Could not generate content for this topic.",
        });
        continue; // Skip this topic if text generation fails
      }
      
      allTopics.push({
        topicName,
        topicText: textOutput.topicText,
      });
    }

    if (allTopics.length === 0) {
        throw new Error("Failed to generate any content for the chapter.");
    }

    return { topics: allTopics };
  }
);
