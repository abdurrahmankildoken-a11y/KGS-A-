export interface ChatImage {
  name: string;
  mimeType: string;
  data: string; // base64 without data URI prefix
  previewUrl: string; // full data URI for <img> tag
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  image?: ChatImage;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  model: string;
  pinned?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'KGD Flash Turbo',
    tagline: 'Anında Yanıt & Çok Hızlı',
    badge: 'Önerilen',
    description: 'Minimum gecikme ve anında kelime akışı. Günlük sohbetler, kodlar ve hızlı yanıtlar için optimize edilmiştir.',
    isDefault: true,
  },
  {
    id: 'gemini-3.8-flash',
    name: 'KGD 3.8 Flash Pro',
    tagline: 'Derin Analiz & Muhakeme',
    badge: 'Kapsamlı',
    description: 'En gelişmiş mantıksal muhakeme ve derin düşünme yeteneği. Karmaşık problemler ve detaylı projeler için.',
  },
];
