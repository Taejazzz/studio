export type NodeType = 'text' | 'youtube';

export interface Node {
  id: string;
  type: NodeType;
  content: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

export interface Edge {
  id:string;
  source: string;
  target: string;
}

export type ActionType = 'WHAT' | 'HOW' | 'WHEN' | 'EXPLAIN' | 'EXPAND' | 'CUSTOM' | 'YOUTUBE' | 'DELETE';

export interface Settings {
  responseLength: number;
  autoLength: boolean;
  responseFormat: 'paragraph' | 'bullet points' | 'single word';
  tone: 'professional' | 'business' | 'friendly' | 'funny' | 'straightforward' | 'one word' | 'expressive';
  customInstructions: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}
