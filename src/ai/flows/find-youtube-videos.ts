'use server';
/**
 * @fileOverview A Genkit flow for finding relevant YouTube videos.
 *
 * - findYouTubeVideos - A function that finds YouTube videos for a given topic.
 * - FindYouTubeVideosInput - The input type for the findYouTubeVideos function.
 * - FindYouTubeVideosOutput - The return type for the findYouTubeVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindYouTubeVideosInputSchema = z.object({
  topic: z.string().describe('The topic to search for YouTube videos about.'),
});
export type FindYouTubeVideosInput = z.infer<typeof FindYouTubeVideosInputSchema>;

const YouTubeVideoSchema = z.object({
  videoId: z.string().describe('The ID of the YouTube video.'),
  title: z.string().describe('The title of the YouTube video.'),
  description: z.string().describe('A brief description of the YouTube video.'),
  thumbnailUrl: z.string().url().describe('The URL for the video thumbnail image.'),
});

const FindYouTubeVideosOutputSchema = z.object({
  videos: z.array(YouTubeVideoSchema).max(5).describe('A list of up to 5 relevant YouTube videos.'),
});
export type FindYouTubeVideosOutput = z.infer<typeof FindYouTubeVideosOutputSchema>;

export async function findYouTubeVideos(input: FindYouTubeVideosInput): Promise<FindYouTubeVideosOutput> {
  return findYouTubeVideosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findYouTubeVideosPrompt',
  input: {schema: FindYouTubeVideosInputSchema},
  output: {schema: FindYouTubeVideosOutputSchema},
  prompt: `You are an expert YouTube video curator.
  
  Find the 5 most relevant and helpful YouTube videos for the following topic.
  Provide the video ID, title, a brief description, and a thumbnail URL for each.
  Ensure the thumbnail URL is a valid, publicly accessible image URL from i.ytimg.com.

  Topic: {{{topic}}}`,
});


const findYouTubeVideosFlow = ai.defineFlow(
  {
    name: 'findYouTubeVideosFlow',
    inputSchema: FindYouTubeVideosInputSchema,
    outputSchema: FindYouTubeVideosOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
