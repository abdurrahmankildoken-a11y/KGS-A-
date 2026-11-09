import React, { useState } from 'react';
import { X, Sliders, Download, Check, RefreshCw } from 'lucide-react';
import { AVAILABLE_MODELS } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSaveSystemPrompt: (prompt: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onExportHistory: () => void;
}

const DEFAULT_SYSTEM_INSTRUCTION =
  "Sen KGD AI'sın. Google Gemini standartlarında, son derece zeki, nazik, hızlı, vizyoner ve kapsamlı bir yapay zeka asistanısın. Kullanıcı ile samimi, saygılı ve yardımsever bir dille konuşursun. Türkçe dilbilgisine ve akıcılığına azami özen göster. Kodlama, bilim, matematik, yaratıcı yazarlık, analiz, tasarım ve günlük sohbetlerde en yüksek doğruluk ve mükemmel markdown formatlama ile yanıt ver.";

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  systemPrompt,
  onSaveSystemPrompt,
  selectedModel,
  onSelectModel,
  onExportHistory,
}) => {
  const [localPrompt, setLocalPrompt] = useState(systemPrompt || DEFAULT_SYSTEM_INSTRUCTION);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSystemPrompt(localPrompt);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setLocalPrompt(DEFAULT_SYSTEM_INSTRUCTION);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#1e1f20] border border-neutral-700/80 rounded-3xl shadow-2xl p-6 text-neutral-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">KGD AI Ayarları</h2>
            <p className="text-xs text-neutral-400">Yapay zeka yanıt stili ve model tercihleri</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Active Model */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Varsayılan Yapay Zeka Modeli
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_MODELS.map((m) => {
                const isSelected = m.id === selectedModel;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectModel(m.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 text-white'
                        : 'bg-[#131314] border-neutral-800 hover:border-neutral-700 text-neutral-400'
                    }`}
                  >
                    <div className="font-semibold text-xs text-neutral-200">{m.name}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{m.tagline}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Prompt Customization */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Sistem Talimatı (AI Kişiliği)
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Varsayılana Dön
              </button>
            </div>
            <textarea
              rows={4}
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="Yapay zekanın nasıl davranmasını istediğinizi belirtin..."
              className="w-full bg-[#131314] border border-neutral-700 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Export Data */}
          <div className="pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-neutral-300">Sohbet Geçmişini İndir</span>
                <p className="text-[11px] text-neutral-400">Tüm sohbetlerinizi JSON formatında yedekleyin.</p>
              </div>
              <button
                type="button"
                onClick={onExportHistory}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Yedek Al</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-md flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Kaydedildi!</span>
              </>
            ) : (
              <span>Ayarları Kaydet</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
