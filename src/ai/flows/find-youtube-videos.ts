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

// Schema for the data we request from the LLM prompt.
const PromptYouTubeVideoSchema = z.object({
  videoId: z.string().describe('A valid 11-character YouTube video ID.'),
  title: z.string().describe('The title of the YouTube video.'),
  description: z.string().describe('A brief, one-sentence description of the YouTube video.'),
});

const PromptOutputSchema = z.object({
  videos: z.array(PromptYouTubeVideoSchema).max(5).describe('A list of up to 5 relevant YouTube videos.'),
});

// Schema for the final data returned by the flow, including the constructed thumbnail URL.
const FlowYouTubeVideoSchema = PromptYouTubeVideoSchema.extend({
  thumbnailUrl: z.string().url().describe('The URL for the video thumbnail image.'),
});

const FindYouTubeVideosOutputSchema = z.object({
  videos: z.array(FlowYouTubeVideoSchema).max(5),
});
export type FindYouTubeVideosOutput = z.infer<typeof FindYouTubeVideosOutputSchema>;

export async function findYouTubeVideos(
  input: FindYouTubeVideosInput
): Promise<FindYouTubeVideosOutput> {
  return findYouTubeVideosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findYouTubeVideosPrompt',
  input: {schema: FindYouTubeVideosInputSchema},
  output: {schema: PromptOutputSchema}, // We only ask the LLM for the data it can reliably provide.
  prompt: `You are an expert YouTube video curator.
  
  Find up to 5 of the most relevant and helpful YouTube videos for the given topic.
  For each video, provide only the following:
  1. A valid 11-character YouTube video ID.
  2. The exact video title.
  3. A brief, one-sentence description of the video's content.

  It is critical that you only provide real, existing YouTube video IDs. Do not invent videos or IDs.

  Topic: {{{topic}}}`,
});

const findYouTubeVideosFlow = ai.defineFlow(
  {
    name: 'findYouTubeVideosFlow',
    inputSchema: FindYouTubeVideosInputSchema,
    outputSchema: FindYouTubeVideosOutputSchema,
  },
  async (input) => {
    // Get video data from the LLM (without thumbnail URL).
    const {output} = await prompt(input);
    if (!output?.videos) {
      return {videos: []};
    }

    // Programmatically construct the thumbnail URL for each video to ensure it's valid.
    const videosWithThumbnails = output.videos.map((video) => ({
      ...video,
      thumbnailUrl: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
    }));

    return {videos: videosWithThumbnails};
  }
);
