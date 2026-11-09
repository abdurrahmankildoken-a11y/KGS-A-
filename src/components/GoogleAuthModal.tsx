import React from 'react';
import { X, CheckCircle2, ShieldCheck, Cloud, Laptop, Sparkles } from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  setUserName: (name: string) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  userName,
  setUserName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#1e1f20] border border-neutral-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 text-neutral-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700 shadow-inner mb-2">
            <GeminiLogo size={36} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            KGD AI & Google Hesabı
          </h2>
          <p className="text-xs text-neutral-400">
            Kişisel yapay zeka deneyiminiz ve cihazlar arası senkronizasyon
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 mb-5 space-y-3">
          <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>KGD AI Yapay Zeka Motoru Şu An Tamamen Aktif!</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Şu an hiçbir kısıtlama olmaksızın KGD 3.8 Flash modeliyle sınırsız sohbet edebilir, kod yazdırabilir ve görsel analizleri yapabilirsiniz. Sohbetleriniz güvenle bu tarayıcıda saklanır.
          </p>
        </div>

        {/* Upcoming Google Integration Roadmap */}
        <div className="space-y-2.5 mb-6 text-xs text-neutral-300">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Sonraki Güncelleme ile Gelecek Özellikler:
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-800/40 border border-neutral-700/40">
            <Cloud className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Google Drive & Docs ile doğrudan dosya analizi</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-800/40 border border-neutral-700/40">
            <Laptop className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Tüm cihazlarınızda (telefon, tablet, bilgisayar) sohbet geçmişi senkronu</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-800/40 border border-neutral-700/40">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Google Tek Tıkla Güvenli Giriş (OAuth 2.0)</span>
          </div>
        </div>

        {/* User Name Customization */}
        <div className="mb-6 space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300">
            KGD AI Sana Nasıl Hitap Etsin?
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Adınız veya Rumuzunuz"
            className="w-full bg-[#131314] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>KGD AI ile Sohbete Devam Et</span>
        </button>
      </div>
    </div>
  );
};
