import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI server-side with required telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: {
    mimeType: string;
    data: string; // base64 without prefix
  };
}

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'KGD AI API',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper to format messages for Gemini SDK
function formatContents(messages: ChatMessage[]) {
  return messages.map((m) => {
    const parts: any[] = [];
    if (m.image && m.image.data && m.image.mimeType) {
      parts.push({
        inlineData: {
          mimeType: m.image.mimeType,
          data: m.image.data,
        },
      });
    }
    if (m.content) {
      parts.push({ text: m.content });
    }
    return {
      role: m.role === 'model' ? 'model' : 'user',
      parts,
    };
  });
}

// API: Chat streaming with Gemini (with automatic 503 high-demand fallback)
app.post('/api/chat/stream', async (req: Request, res: Response): Promise<void> => {
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY tanımlı değil. Lütfen ayarları kontrol edin.',
    });
    return;
  }

  const {
    messages = [],
    model = 'gemini-3.8-flash',
    systemInstruction,
  } = req.body as {
    messages: ChatMessage[];
    model?: string;
    systemInstruction?: string;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Mesaj listesi boş olamaz.' });
    return;
  }

  const contents = formatContents(messages);

  const defaultInstruction =
    "Sen KGD AI'sın. Google Gemini standartlarında, son derece zeki, nazik, hızlı, vizyoner ve kapsamlı bir yapay zeka asistanısın. Kullanıcı ile samimi, saygılı ve yardımsever bir dille konuşursun. Türkçe dilbilgisine ve akıcılığına azami özen göster. Kodlama, bilim, matematik, yaratıcı yazarlık, analiz, tasarım ve günlük sohbetlerde en yüksek doğruluk ve mükemmel markdown formatlama ile yanıt ver. Kod bloklarında dil belirteci kullan ve açıklayıcı yorumlar ekle.";

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const primaryModel = model || 'gemini-3.8-flash';
  const fallbackModel = 'gemini-3.1-flash-lite';

  const tryStream = async (targetModel: string) => {
    return await ai.models.generateContentStream({
      model: targetModel,
      contents,
      config: {
        systemInstruction: systemInstruction || defaultInstruction,
      },
    });
  };

  try {
    let stream;
    try {
      stream = await tryStream(primaryModel);
    } catch (err: any) {
      const errStr = JSON.stringify(err);
      // If 503 / high demand or not found, try fallback
      if (
        (err?.status === 503 || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE')) &&
        primaryModel !== fallbackModel
      ) {
        console.warn(`[KGD AI] ${primaryModel} yoğunlukta, ${fallbackModel} modeline geçiliyor...`);
        stream = await tryStream(fallbackModel);
      } else {
        throw err;
      }
    }

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('KGD AI Generation Error:', error);
    let userMsg = 'Yapay zeka yanıt oluştururken bir sorunla karşılaştı.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.error?.message) {
        userMsg = parsed.error.message;
      }
    } catch {
      if (error?.message) userMsg = error.message;
    }
    res.write(`data: ${JSON.stringify({ error: userMsg, done: true })}\n\n`);
    res.end();
  }
});

// API: Quick title generator for chat session using fast lite model
app.post('/api/chat/title', async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.json({ title: 'Yeni Sohbet' });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Şu kullanıcı mesajı için 3-5 kelimelik kısa, net bir Türkçe sohbet başlığı üret (tırnaksız): "${prompt.slice(0, 200)}"`,
      config: {
        systemInstruction: 'Sadece 3-5 kelimelik bir başlık döndür. Tırnak veya ek açıklama yazma.',
      },
    });

    const title = (response.text || 'Yeni Sohbet').trim().replace(/^["']|["']$/g, '');
    res.json({ title: title.slice(0, 35) });
  } catch (e) {
    res.json({ title: prompt.slice(0, 25) });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`✨ KGD AI sunucusu http://0.0.0.0:${port} adresinde hazır.`);
  });
}

startServer();
