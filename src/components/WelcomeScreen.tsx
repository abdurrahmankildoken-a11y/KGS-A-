import React from 'react';
import { GeminiLogo } from './GeminiLogo';
import { Code, Compass, PenTool, Sparkles, Brain, Cpu, MessageSquareQuote } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  userName?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  userName = 'Abdurrahman',
}) => {
  const suggestions = [
    {
      icon: <Code className="w-5 h-5 text-blue-400" />,
      tag: 'Kod & Mimari',
      title: 'Python REST API & JWT Auth',
      prompt: 'FastAPI kullanarak JWT tabanlı yetkilendirme içeren bir REST API şablonu yazar mısın? Kodları açıkla.',
      color: 'from-blue-500/15 to-transparent',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      tag: 'Yapay Zeka & Fikir',
      title: 'Yenilikçi AI Proje Fikirleri',
      prompt: 'Google Gemini mimarisini kullanan, günlük hayatta insanların işini kolaylaştıracak 3 özgün yapay zeka proje fikri öner.',
      color: 'from-purple-500/15 to-transparent',
    },
    {
      icon: <PenTool className="w-5 h-5 text-rose-400" />,
      tag: 'Yaratıcı Yazım',
      title: 'Bilim Kurgu Hikayesi',
      prompt: '2045 yılında bilinç kazanan bir KGD AI sisteminin insanlıkla kurduğu ilk teması anlatan sürükleyici bir kısa hikaye yaz.',
      color: 'from-rose-500/15 to-transparent',
    },
    {
      icon: <Brain className="w-5 h-5 text-emerald-400" />,
      tag: 'Öğrenme & Analiz',
      title: 'Kuantum Hesaplama Açıklaması',
      prompt: 'Kuantum bilgisayarlarını ve Qubit mantığını hiç teknik bilgisi olmayan birine benzetmelerle anlaşılır biçimde anlat.',
      color: 'from-emerald-500/15 to-transparent',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-8 text-center select-none">
      {/* Gemini star and greeting */}
      <div className="mb-6 flex flex-col items-center">
        <div className="p-3 rounded-2xl bg-neutral-800/40 border border-neutral-700/50 mb-4 shadow-xl backdrop-blur-xs">
          <GeminiLogo size={52} animate />
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
          <span className="gemini-gradient-text">Merhaba, {userName}</span>
        </h1>
        <p className="text-lg md:text-2xl font-medium text-neutral-400 max-w-xl">
          Bugün sana nasıl yardımcı olabilirim?
        </p>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl mt-6">
        {suggestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className={`group text-left p-4 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-neutral-800 hover:border-neutral-700/80 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between h-36 bg-gradient-to-br ${item.color}`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">
                  {item.tag}
                </span>
                <span className="p-1 rounded-lg bg-neutral-800/80 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-neutral-200 group-hover:text-white transition-colors">
                {item.title}
              </h3>
            </div>

            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
              "{item.prompt}"
            </p>
          </button>
        ))}
      </div>

      {/* Feature Pills */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400">
        <span className="px-3 py-1 rounded-full bg-neutral-800/60 border border-neutral-700/40 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          Gemini 3.8 Flash Mimarisi
        </span>
        <span className="px-3 py-1 rounded-full bg-neutral-800/60 border border-neutral-700/40 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Görsel & Metin Çok Modlu
        </span>
        <span className="px-3 py-1 rounded-full bg-neutral-800/60 border border-neutral-700/40 flex items-center gap-1.5">
          <MessageSquareQuote className="w-3.5 h-3.5 text-rose-400" />
          Sesli Giriş & Seslendirme
        </span>
      </div>
    </div>
  );
};
