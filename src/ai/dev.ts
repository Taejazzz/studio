import { config } from 'dotenv';
config();

import '@/services/youtube.ts';
import '@/ai/flows/generate-node-content.ts';
import '@/ai/flows/generate-custom-node-content.ts';
import '@/ai/flows/find-youtube-videos.ts';
