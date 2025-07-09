'use server';
/**
 * @fileOverview A Genkit flow for finding relevant YouTube videos using a tool.
 *
 * - findYouTubeVideos - A function that finds YouTube videos for a given topic.
 * - FindYouTubeVideosInput - The input type for the findYouTubeVideos function.
 * - FindYouTubeVideosOutput - The return type for the findYouTubeVideos function.
 */

import {ai} from '@/ai/genkit';
import {searchYouTube} from '@/services/youtube';
import {z} from 'genkit';

// Input and Output schemas remain the same for the exported function.
const FindYouTubeVideosInputSchema = z.object({
  topic: z.string().describe('The topic to search for YouTube videos about.'),
});
export type FindYouTubeVideosInput = z.infer<typeof FindYouTubeVideosInputSchema>;

const FlowYouTubeVideoSchema = z.object({
    videoId: z.string().describe('A valid 11-character YouTube video ID.'),
    title: z.string().describe('The title of the YouTube video.'),
    description: z.string().describe('A brief, one-sentence description of the YouTube video.'),
    thumbnailUrl: z.string().url().describe('The URL for the video thumbnail image.'),
});

const FindYouTubeVideosOutputSchema = z.object({
  videos: z.array(FlowYouTubeVideoSchema).max(5),
});
export type FindYouTubeVideosOutput = z.infer<typeof FindYouTubeVideosOutputSchema>;


// The exported function that the UI calls.
export async function findYouTubeVideos(
  input: FindYouTubeVideosInput
): Promise<FindYouTubeVideosOutput> {
  // Gracefully handle missing API key. If the service returns an empty array,
  // we pass it on to the UI.
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('YouTube API key not found. Returning no videos.');
    return { videos: [] };
  }
  return findYouTubeVideosFlow(input);
}


// Define the tool for searching YouTube. The LLM will call this.
const youTubeSearchTool = ai.defineTool(
  {
    name: 'searchYouTube',
    description: 'Searches YouTube for videos based on a query.',
    inputSchema: z.object({
      query: z.string().describe('The search query for YouTube.'),
    }),
    outputSchema: FindYouTubeVideosOutputSchema,
  },
  async (input) => {
    const videos = await searchYouTube(input.query);
    return { videos };
  }
);


// The prompt that instructs the LLM to use the tool.
// The output of this prompt will be the output of the tool call.
const prompt = ai.definePrompt({
  name: 'findYouTubeVideosPrompt',
  tools: [youTubeSearchTool],
  input: {schema: FindYouTubeVideosInputSchema},
  output: {schema: FindYouTubeVideosOutputSchema},
  prompt: `You are an expert at creating search queries.
  
  Based on the user's topic, generate a concise and effective search query to find relevant YouTube videos.
  Then, use the searchYouTube tool to perform the search.
  
  Do not make up videos or video IDs. Only use the searchYouTube tool.

  Topic: {{{topic}}}`,
});

const findYouTubeVideosFlow = ai.defineFlow(
  {
    name: 'findYouTubeVideosFlow',
    inputSchema: FindYouTubeVideosInputSchema,
    outputSchema: FindYouTubeVideosOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);

    // The output should be the result of the tool call.
    if (!output) {
      return {videos: []};
    }
    
    return output;
  }
);
