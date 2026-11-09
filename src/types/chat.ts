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
    id: 'gemini-3.8-flash',
    name: 'KGD 3.8 Flash',
    tagline: 'Ultra Hızlı & Zeki',
    badge: 'Önerilen',
    description: 'En son nesil çok modlu Gemini mimarisi. Kod, metin, analiz ve görsellerde ışık hızında yanıt.',
    isDefault: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'KGD Flash Lite',
    tagline: 'Hafif & Seri',
    badge: 'Hızlı',
    description: 'Basit sorular, hızlı özetler ve anlık çeviriler için optimize edilmiş minimum gecikmeli model.',
  },
];
