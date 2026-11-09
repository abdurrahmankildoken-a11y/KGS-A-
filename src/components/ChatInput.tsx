import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Image as ImageIcon,
  Mic,
  MicOff,
  Square,
  X,
  Sparkles,
} from 'lucide-react';
import { ChatImage } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (text: string, image?: ChatImage) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  placeholder = 'KGD AI\'ya bir şeyler sor veya bir görsel ekle...',
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<ChatImage | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputText]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'tr-TR';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Ses tanıma hatası:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Tarayıcınız sesle yazmayı desteklemiyor.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Strip out "data:image/xyz;base64," prefix for Gemini SDK
        const commaIdx = result.indexOf(',');
        const base64Data = commaIdx !== -1 ? result.substring(commaIdx + 1) : result;

        setSelectedImage({
          name: file.name,
          mimeType: file.type,
          data: base64Data,
          previewUrl: result,
        });
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      onStopStreaming();
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed && !selectedImage) return;

    onSendMessage(trimmed, selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = inputText.trim().length > 0 || selectedImage !== null;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 md:px-6 pb-4 pt-1">
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Floating Input Box */}
      <div className="relative rounded-3xl bg-[#1e1f20] border border-neutral-700/70 focus-within:border-blue-500/60 shadow-xl transition-all duration-200">
        {/* Attached image preview */}
        {selectedImage && (
          <div className="p-3 pb-0 flex items-center">
            <div className="relative group inline-block rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900">
              <img
                src={selectedImage.previewUrl}
                alt={selectedImage.name}
                className="w-16 h-16 object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                title="Görseli Kaldır"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="ml-3 text-xs text-neutral-400 truncate max-w-xs">
              {selectedImage.name}
            </span>
          </div>
        )}

        {/* Text Input area */}
        <div className="flex items-end px-4 py-3 gap-2">
          {/* Add Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
            title="Görsel Ekle (Çok Modlu Analiz)"
          >
            <ImageIcon className="w-5 h-5 text-neutral-300" />
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-full transition-colors shrink-0 ${
              isRecording
                ? 'text-red-400 bg-red-950/40 animate-pulse'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title={isRecording ? 'Dinlemeyi Durdur' : 'Sesle Yaz'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Sizi dinliyorum...' : placeholder}
            className="flex-1 bg-transparent text-sm md:text-base text-white placeholder-neutral-500 resize-none focus:outline-none max-h-44 py-1 leading-normal"
          />

          {/* Send or Stop Button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all shrink-0 shadow-md"
              title="Yanıtı Durdur"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!hasContent}
              className={`p-2 rounded-full transition-all shrink-0 shadow-md ${
                hasContent
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 scale-100'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
              title="Gönder (Enter)"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Gemini Disclaimer */}
      <div className="mt-2 text-center">
        <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-400/80" />
          <span>KGD AI hata yapabilir, bu nedenle yanıtları doğrulamayı unutmayın.</span>
        </p>
      </div>
    </div>
  );
};
