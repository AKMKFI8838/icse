
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-practice-test.ts';
import '@/ai/flows/get-quick-revision-notes.ts';
import '@/ai/flows/solve-my-doubts.ts';
import '@/ai/flows/get-chapter-content.ts';
import '@/ai/flows/get-learning-content.ts';
import '@/ai/flows/get-important-questions.ts';
import '@/ai/flows/get-chapter-topics.ts';
import '@/ai/flows/get-topic-explanation.ts';
import '@/ai/flows/mention-user.ts';
import '@/ai/flows/search-youtube.ts';
