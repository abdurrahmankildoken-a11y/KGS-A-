import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Share2,
  AlertCircle,
  User,
} from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { GeminiLogo } from './GeminiLogo';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageItemProps {
  message: ChatMessage;
  isLastModelMessage: boolean;
  onRegenerate?: () => void;
  onCopySuccess?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLastModelMessage,
  onRegenerate,
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız metin okumayı desteklemiyor.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean markdown tags for clearer speech
      const cleanText = message.content
        .replace(/```[\s\S]*?```/g, 'Kod bloğu.')
        .replace(/[#*_`\[\]]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.05;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KGD AI Yanıtı',
          text: message.content,
        });
      } catch (e) {
        // user cancelled or failed
      }
    } else {
      handleCopy();
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-5 px-3 md:px-6">
        <div className="max-w-[85%] md:max-w-2xl bg-[#282a2c] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm border border-neutral-700/50 space-y-2">
          {message.image && (
            <div className="rounded-xl overflow-hidden border border-neutral-700/80 max-w-sm">
              <img
                src={message.image.previewUrl}
                alt={message.image.name}
                className="w-full max-h-72 object-cover"
              />
            </div>
          )}
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed selection:bg-blue-600/30">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Model response
  return (
    <div className="flex gap-3 md:gap-4 my-6 px-3 md:px-6 max-w-4xl mx-auto">
      {/* Gemini Avatar */}
      <div className="shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-full bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center shadow-sm">
          <GeminiLogo size={20} animate={message.isStreaming} />
        </div>
      </div>

      {/* Message Content & Actions */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Model Title */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-neutral-200">KGD AI</span>
          {message.isStreaming && (
            <span className="text-[11px] text-blue-400 font-medium animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              Yazıyor...
            </span>
          )}
        </div>

        {/* Error notification */}
        {message.error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{message.error}</span>
          </div>
        )}

        {/* Content Body */}
        {message.content ? (
          <MarkdownRenderer content={message.content} />
        ) : message.isStreaming ? (
          <div className="space-y-2 py-2">
            <div className="h-4 w-3/4 rounded-md gemini-shimmer" />
            <div className="h-4 w-1/2 rounded-md gemini-shimmer" />
            <div className="h-4 w-2/3 rounded-md gemini-shimmer" />
          </div>
        ) : null}

        {/* Action bar (Copy, Read, Regenerate, Share) */}
        {!message.isStreaming && message.content && (
          <div className="flex items-center gap-1 pt-1 text-neutral-400">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800/80 transition-colors flex items-center gap-1 text-xs"
              title="Metni Kopyala"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Kopyalandı</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={toggleSpeak}
              className={`p-1.5 rounded-lg hover:text-white hover:bg-neutral-800/80 transition-colors ${
                isSpeaking ? 'text-blue-400 bg-blue-950/30' : ''
              }`}
              title={isSpeaking ? 'Okumayı Durdur' : 'Sesli Dinle'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {isLastModelMessage && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800/80 transition-colors"
                title="Yanıtı Yeniden Oluştur"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800/80 transition-colors"
              title="Paylaş"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
