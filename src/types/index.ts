export interface Profile {
  id: string;
  name: string;
  createdAt: string;
}

export interface Script {
  id: string;
  profileId: string;
  title: string;
  description: string;
  fileName?: string;
  fileContent?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ImageAsset {
  id: string;
  profileId: string;
  scriptId?: string;
  prompt: string;
  imagePath?: string;
  status: 'pending' | 'generating' | 'done';
  createdAt?: string;
}

export interface AudioAsset {
  id: string;
  profileId: string;
  scriptId?: string;
  prompt?: string;
  text?: string;
  language: 'hindi' | 'english';
  characterName: string;
  audioPath?: string;
  status: 'pending' | 'generating' | 'done';
  createdAt?: string;
}

export interface GenerationItem {
  id: string;
  profileId: string;
  type: 'image' | 'audio';
  status: 'pending' | 'generating' | 'done';
  duration?: number;
  assetId: string;
}

export interface ExportData {
  profileId: string;
  title: string;
  description: string;
  captions: string;
  videoPath?: string;
}
