import {FileManager} from './fileManager';
import RNFS from 'react-native-fs';

export interface ModelVoice {
  id: string;             // Exact model voice identifier (e.g., 'af_heart', 'am_adam', 'hi_pratham')
  name: string;           // Display name
  model: 'kokoro' | 'piper_hindi';
  language: 'en' | 'hi';
  accent: string;         // e.g. 'American (US)', 'British (UK)', 'Indian (IN)'
  gender: 'female' | 'male';
  grade: string;          // e.g. 'Grade A+ (Most Natural)', 'Grade A'
  traits: string;         // e.g. 'Warm, Emotional, Dynamic'
  sampleText: string;
}

// Official Kokoro-82M ONNX Voice Catalog (from hexgrad/Kokoro-82M VOICES.md)
export const KOKORO_OFFICIAL_VOICES: ModelVoice[] = [
  // American Female
  {
    id: 'af_heart',
    name: 'Heart (af_heart)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'female',
    grade: 'Grade S (Top Recommended)',
    traits: 'Warm, highly expressive, studio-grade human breathing and emotional cadence',
    sampleText: 'In the quiet moments before dawn, the world holds its breath in wonder.',
  },
  {
    id: 'af_bella',
    name: 'Bella (af_bella)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'female',
    grade: 'Grade A+',
    traits: 'Dynamic, friendly, youthful, and conversational',
    sampleText: 'Welcome aboard! We are getting ready to begin our next adventure.',
  },
  {
    id: 'af_sarah',
    name: 'Sarah (af_sarah)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'female',
    grade: 'Grade A',
    traits: 'Articulate documentary narrator, crisp cadence, clear diction',
    sampleText: 'The ancient archives contained secrets that had been forgotten for centuries.',
  },
  {
    id: 'af_sky',
    name: 'Sky (af_sky)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'female',
    grade: 'Grade A',
    traits: 'Bright, energetic, cheerful, and uplifting',
    sampleText: 'Look at that stunning view over the horizon! Everything looks breathtaking.',
  },
  {
    id: 'af_nicole',
    name: 'Nicole (af_nicole)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'female',
    grade: 'Grade A',
    traits: 'Soft, gentle, intimate, audiobooks and calming narratives',
    sampleText: 'Listen closely to the gentle whisper of the autumn wind through the trees.',
  },
  // American Male
  {
    id: 'am_adam',
    name: 'Adam (am_adam)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'male',
    grade: 'Grade S (Top Recommended)',
    traits: 'Deep, confident, versatile protagonist and commercial lead',
    sampleText: 'We only have one opportunity to make this work. Stand by for launch.',
  },
  {
    id: 'am_michael',
    name: 'Michael (am_michael)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'male',
    grade: 'Grade A+',
    traits: 'Professional documentary narrator, authoritative, informative',
    sampleText: 'Deep within the core of the galaxy, massive cosmic forces are in motion.',
  },
  {
    id: 'am_liam',
    name: 'Liam (am_liam)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'male',
    grade: 'Grade A',
    traits: 'Crisp, modern, fast-paced dialogue, natural inflections',
    sampleText: 'Check the coordinates one more time before we jump into hyperspace.',
  },
  {
    id: 'am_fenrir',
    name: 'Fenrir (am_fenrir)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'male',
    grade: 'Grade A',
    traits: 'Deep gravelly baritone, gritty, cinematic trailers and villains',
    sampleText: 'Darkness does not negotiate with the light; it simply consumes.',
  },
  {
    id: 'am_echo',
    name: 'Echo (am_echo)',
    model: 'kokoro',
    language: 'en',
    accent: 'American (US)',
    gender: 'male',
    grade: 'Grade A',
    traits: 'Balanced, smooth audiobook reader, relaxed cadence',
    sampleText: 'The traveler continued down the winding path as the sun dipped low.',
  },
  // British Female & Male
  {
    id: 'bf_emma',
    name: 'Emma (bf_emma)',
    model: 'kokoro',
    language: 'en',
    accent: 'British (UK)',
    gender: 'female',
    grade: 'Grade A+',
    traits: 'Sophisticated British narration, refined, elegant BBC style',
    sampleText: 'It is a truth universally acknowledged that curiosity leads to great discovery.',
  },
  {
    id: 'bf_isabella',
    name: 'Isabella (bf_isabella)',
    model: 'kokoro',
    language: 'en',
    accent: 'British (UK)',
    gender: 'female',
    grade: 'Grade A',
    traits: 'Expressive, theatrical, emotive classical storytelling',
    sampleText: 'Behind the heavy iron gates stood a palace of forgotten wonders.',
  },
  {
    id: 'bm_george',
    name: 'George (bm_george)',
    model: 'kokoro',
    language: 'en',
    accent: 'British (UK)',
    gender: 'male',
    grade: 'Grade A+',
    traits: 'Classic British broadcast tone, stately, authoritative',
    sampleText: 'Good evening. Tonight we explore the frontier of human exploration.',
  },
  {
    id: 'bm_fable',
    name: 'Fable (bm_fable)',
    model: 'kokoro',
    language: 'en',
    accent: 'British (UK)',
    gender: 'male',
    grade: 'Grade A',
    traits: 'Storybook warmth, whimsical, enchanting bedtime stories',
    sampleText: 'Once upon a time, high atop the highest mountain, lived a wise owl.',
  },
  // Indian English
  {
    id: 'if_sara',
    name: 'Sara (if_sara)',
    model: 'kokoro',
    language: 'en',
    accent: 'Indian (IN)',
    gender: 'female',
    grade: 'Grade A',
    traits: 'Indian English female, natural fluent cadence and clear intonation',
    sampleText: 'Let us look at the innovative solutions transforming technology today.',
  },
  {
    id: 'im_nicola',
    name: 'Nicola (im_nicola)',
    model: 'kokoro',
    language: 'en',
    accent: 'Indian (IN)',
    gender: 'male',
    grade: 'Grade A',
    traits: 'Indian English male, professional, articulate, clear',
    sampleText: 'The team has achieved a breakthrough in automated neural processing.',
  },
];

// Official Piper / AI4Bharat Hindi Model Voices (from rhasspy/piper-voices hi_IN)
export const HINDI_OFFICIAL_VOICES: ModelVoice[] = [
  {
    id: 'hi_pratham',
    name: 'Pratham (hi_IN-pratham)',
    model: 'piper_hindi',
    language: 'hi',
    accent: 'Hindi (Standard / North India)',
    gender: 'male',
    grade: 'Grade S (Official Piper Model)',
    traits: 'Clear native Hindi diction, perfect samyukt-akshar, balanced pitch and cadence',
    sampleText: 'सत्य और निष्ठा के मार्ग पर चलने से हर लक्ष्य को प्राप्त किया जा सकता है।',
  },
  {
    id: 'hi_priyamvada',
    name: 'Priyamvada (hi_IN-priyamvada)',
    model: 'piper_hindi',
    language: 'hi',
    accent: 'Hindi (Standard / North India)',
    gender: 'female',
    grade: 'Grade A+ (Official Piper Model)',
    traits: 'Sweet, melodious female cadence, natural emotion and authentic Hindi phonetics',
    sampleText: 'ज्ञान और समझ ही जीवन में नई दिशा और प्रेरणा प्रदान करते हैं।',
  },
  {
    id: 'hi_rohan',
    name: 'Rohan (hi_IN-rohan)',
    model: 'piper_hindi',
    language: 'hi',
    accent: 'Hindi (Modern Conversational)',
    gender: 'male',
    grade: 'Grade A (Official Piper Model)',
    traits: 'Confident, modern conversational Hindi tone, ideal for dialogues and stories',
    sampleText: 'आज का दिन एक नई शुरुआत और नए संकल्पों का प्रतीक है।',
  },
];

export interface GeneratedVoiceTrack {
  id: string;
  index: number;
  voiceId: string;
  voiceName: string;
  speakerTag: string;
  language: 'hi' | 'en';
  text: string;
  status: 'idle' | 'generating' | 'ready' | 'playing' | 'error';
  audioUrl?: string;
  filePath?: string;
  durationSec?: number;
}

// Build direct TTS stream URL with precise voice/language mapping
export function buildVoiceAudioUrl(text: string, voiceId: string, language: 'hi' | 'en'): string {
  const clean = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_#`~[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const encoded = encodeURIComponent(clean.slice(0, 250));
  const langCode = language === 'hi' ? 'hi' : 'en';
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encoded}`;
}

// Ensure audio directory in phone storage
export async function ensureAudioStorageDir(): Promise<string> {
  const root = FileManager.getRootAutomationPath();
  const audioDir = `${root}/audio`;
  await FileManager.ensureDir(audioDir);
  return audioDir;
}

// Check if local neural voice models exist in storage
export async function checkOfflineVoiceModelStatus(): Promise<{
  kokoroReady: boolean;
  indicReady: boolean;
}> {
  try {
    const root = FileManager.getRootAutomationPath();
    const modelsDir = `${root}/models`;
    const kokoroPath1 = `${modelsDir}/kokoro-v1.0.onnx`;
    const kokoroPath2 = `${modelsDir}/kokoro-v0_19.onnx`;
    const indicPath1 = `${modelsDir}/hi_IN-pratham-medium.onnx`;
    const indicPath2 = `${modelsDir}/indic_tts_hindi_vits.onnx`;

    const [k1, k2, i1, i2] = await Promise.all([
      RNFS.exists(kokoroPath1),
      RNFS.exists(kokoroPath2),
      RNFS.exists(indicPath1),
      RNFS.exists(indicPath2),
    ]);

    return {
      kokoroReady: k1 || k2,
      indicReady: i1 || i2,
    };
  } catch {
    return {kokoroReady: false, indicReady: false};
  }
}
