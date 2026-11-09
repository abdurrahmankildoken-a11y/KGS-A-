import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

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

// Helper to format and strictly validate messages for Gemini SDK
function formatContents(messages: ChatMessage[]) {
  const validContents: Array<{ role: 'user' | 'model'; parts: any[] }> = [];

  for (const m of messages) {
    const parts: any[] = [];
    if (m.image && m.image.data && m.image.mimeType) {
      parts.push({
        inlineData: {
          mimeType: m.image.mimeType,
          data: m.image.data,
        },
      });
    }
    const cleanContent = (m.content || '').trim();
    if (cleanContent) {
      parts.push({ text: cleanContent });
    }

    // Skip messages with no text and no image
    if (parts.length === 0) continue;

    const role: 'user' | 'model' = m.role === 'model' ? 'model' : 'user';

    // Ensure strictly alternating roles required by Gemini API
    const prev = validContents[validContents.length - 1];
    if (prev && prev.role === role) {
      // Merge parts with previous turn of same role
      prev.parts.push(...parts);
    } else {
      validContents.push({ role, parts });
    }
  }

  // Ensure conversation starts with 'user'
  while (validContents.length > 0 && validContents[0].role !== 'user') {
    validContents.shift();
  }

  return validContents;
}

const DEFAULT_INSTRUCTION =
  "Sen KGD AI'sın. Google Gemini standartlarında, son derece zeki, nazik, hızlı ve yardımsever bir yapay zeka asistanısın. Kullanıcı ile samimi ve saygılı bir Türkçe ile konuşursun. Cevaplarını net, akıcı ve doğru ver. Kod bloklarında dil belirteci kullan.";

// API: Ultra-fast Chat streaming with Gemini
app.post('/api/chat/stream', async (req: Request, res: Response): Promise<void> => {
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY tanımlı değil. Lütfen ayarları kontrol edin.',
    });
    return;
  }

  const {
    messages = [],
    model = 'gemini-3.1-flash-lite',
    systemInstruction,
  } = req.body as {
    messages: ChatMessage[];
    model?: string;
    systemInstruction?: string;
  };

  const contents = formatContents(messages);

  if (contents.length === 0) {
    res.status(400).json({ error: 'Geçerli bir mesaj bulunamadı.' });
    return;
  }

  // Set SSE headers with proxy unbuffering
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const targetModel = model || 'gemini-3.1-flash-lite';
  const instruction = systemInstruction || DEFAULT_INSTRUCTION;

  const runStream = async (modelName: string) => {
    const config: any = {
      systemInstruction: instruction,
    };

    if (modelName === 'gemini-3.8-flash') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
    }

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config,
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }
    }
  };

  try {
    try {
      await runStream(targetModel);
    } catch (primaryErr: any) {
      console.warn(`[KGD AI] ${targetModel} hatası:`, primaryErr?.message);
      if (targetModel !== 'gemini-3.1-flash-lite') {
        console.log('[KGD AI] Hızlı yedek modele (gemini-3.1-flash-lite) geçiliyor...');
        await runStream('gemini-3.1-flash-lite');
      } else {
        throw primaryErr;
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
