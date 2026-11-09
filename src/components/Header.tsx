import React, { useState, useRef, useEffect } from 'react';
import { PanelLeft, ChevronDown, Sparkles, Settings, UserPlus, Plus, Check } from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';
import { AIModel, AVAILABLE_MODELS } from '../types/chat';

interface HeaderProps {
  onToggleSidebar: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenGoogleAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  selectedModel,
  onSelectModel,
  onNewChat,
  onOpenSettings,
  onOpenGoogleAuth,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-neutral-800/80 bg-[#131314]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3 md:px-5">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/70 transition-colors"
          title="Menüyü Aç/Kapat"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <GeminiLogo size={26} />
          <span className="font-bold text-lg md:text-xl tracking-tight text-white flex items-center gap-1.5">
            KGD AI
          </span>
        </div>

        {/* Model Selector Dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 bg-neutral-800/70 hover:bg-neutral-700/80 border border-neutral-700/60 transition-all hover:text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{activeModel.name}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#1e1f20] border border-neutral-700/80 shadow-2xl p-2 z-50">
              <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-700/50">
                Model Seçimi
              </div>
              <div className="space-y-1 mt-1">
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = model.id === selectedModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-blue-900/30 border border-blue-500/40 text-white'
                          : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-medium text-sm">
                          <span>{model.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-normal">
                            {model.badge}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-2">
                          {model.description}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: New Chat & Google Auth Preview & Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 transition-all"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>Yeni Sohbet</span>
        </button>

        {/* Google Sign-in Trigger (ready for future integration as requested) */}
        <button
          onClick={onOpenGoogleAuth}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-800 hover:bg-neutral-700/80 text-white border border-neutral-700 transition-all shadow-sm group"
          title="Google Hesabı ile Giriş Yap"
        >
          {/* Authentic Google 'G' icon */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="hidden md:inline text-neutral-200 group-hover:text-white">
            Giriş Yap
          </span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/70 transition-colors"
          title="Ayarlar"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
