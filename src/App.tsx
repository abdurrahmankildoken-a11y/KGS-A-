/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { SettingsModal } from './components/SettingsModal';
import { ChatImage, ChatMessage, ChatSession, AVAILABLE_MODELS } from './types/chat';

const STORAGE_KEY_SESSIONS = 'kgd_ai_sessions_v1';
const STORAGE_KEY_ACTIVE = 'kgd_ai_active_id';
const STORAGE_KEY_MODEL = 'kgd_ai_model';
const STORAGE_KEY_USERNAME = 'kgd_ai_username';
const STORAGE_KEY_SYSTEM_PROMPT = 'kgd_ai_system_prompt';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const initialSession: ChatSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`,
      title: 'Yeni Sohbet',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: AVAILABLE_MODELS[0].id,
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return sessions[0]?.id || '';
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MODEL);
    if (saved === 'gemini-3.8-flash' || saved === 'gemini-3.1-flash-lite') return saved;
    return 'gemini-3.1-flash-lite';
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_USERNAME) || 'Abdurrahman';
  });

  const [systemPrompt, setSystemPrompt] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_SYSTEM_PROMPT) || '';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasBackend, setHasBackend] = useState<boolean | null>(null);

  // Check if backend API is accessible (e.g. on AI Studio / Node vs static GitHub Pages)
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (res.ok) {
          setHasBackend(true);
        } else {
          setHasBackend(false);
        }
      })
      .catch(() => {
        setHasBackend(false);
      });
  }, []);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE, activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODEL, selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERNAME, userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SYSTEM_PROMPT, systemPrompt);
  }, [systemPrompt]);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeSessionId]);

  // Create a new session
  const handleNewChat = () => {
    if (isStreaming) {
      handleStopStreaming();
    }
    const newSession: ChatSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`,
      title: 'Yeni Sohbet',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const fresh: ChatSession = {
        id: crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`,
        title: 'Yeni Sohbet',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: selectedModel,
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  const handleClearAllSessions = () => {
    const fresh: ChatSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`,
      title: 'Yeni Sohbet',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel,
    };
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Turn off isStreaming flag in current message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const updatedMessages = s.messages.map((m) =>
          m.isStreaming ? { ...m, isStreaming: false } : m
        );
        return { ...s, messages: updatedMessages };
      })
    );
  };

  const handleSendMessage = async (text: string, image?: ChatImage) => {
    if (isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      image,
    };

    const modelMessageId = crypto.randomUUID
      ? crypto.randomUUID()
      : `msg-model-${Date.now()}`;
    const modelMessage: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const isFirstMessage = (activeSession?.messages.length || 0) === 0;

    // Update session with user message and empty model message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          messages: [...s.messages, userMessage, modelMessage],
          updatedAt: Date.now(),
        };
      })
    );

    // Instant clean auto-title if first message (no extra concurrent API request)
    if (isFirstMessage && text) {
      const cleanTitle = text.trim().slice(0, 30) + (text.trim().length > 30 ? '...' : '');
      handleRenameSession(activeSessionId, cleanTitle);
    }

    // Scroll to bottom immediately
    setTimeout(() => scrollToBottom('smooth'), 50);

    // Start streaming from backend
    setIsStreaming(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Timeout safety net (only if NO chunks arrive within 25s)
    let isAbortedByTimeout = false;
    let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
      isAbortedByTimeout = true;
      abortController.abort();
    }, 25000);

    try {
      // Prepare strictly valid conversation history:
      // Only include previous messages that have actual content and no errors
      const validHistory = (activeSession?.messages || [])
        .filter((m) => (m.content || '').trim().length > 0 && !m.error)
        .map((m) => ({
          role: m.role,
          content: m.content.trim(),
          image: m.image
            ? {
                mimeType: m.image.mimeType,
                data: m.image.data,
              }
            : undefined,
        }));

      // Append current user message
      validHistory.push({
        role: 'user',
        content: text.trim(),
        image: image
          ? {
              mimeType: image.mimeType,
              data: image.data,
            }
          : undefined,
      });

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: validHistory,
          model: selectedModel,
          systemInstruction: systemPrompt || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Yanıt akışı başlatılamadı.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);
            if (data.error) {
              throw new Error(data.error);
            }
            if (data.text) {
              // As soon as first token arrives, clear the timeout!
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              accumulatedText += data.text;
              // Update state with stream chunk
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id !== activeSessionId) return s;
                  const updatedMessages = s.messages.map((m) =>
                    m.id === modelMessageId
                      ? { ...m, content: accumulatedText }
                      : m
                  );
                  return { ...s, messages: updatedMessages };
                })
              );
              scrollToBottom('smooth');
            }
            if (data.done) {
              break;
            }
          } catch (jsonErr) {
            console.warn('SSE Parse warning:', jsonErr);
          }
        }
      }

      // Mark streaming complete
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const updatedMessages = s.messages.map((m) =>
            m.id === modelMessageId ? { ...m, isStreaming: false } : m
          );
          return { ...s, messages: updatedMessages };
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError' && !isAbortedByTimeout) {
        console.log('Kullanıcı yanıt oluşturmayı durdurdu.');
      } else {
        console.error('Akış hatası:', err);
        const timeoutErrorMessage =
          'Sunucudan yanıt alınamadı (zaman aşımı). Lütfen Tekrar Dene butonuna tıklayın.';
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSessionId) return s;
            const updatedMessages = s.messages.map((m) =>
              m.id === modelMessageId
                ? {
                    ...m,
                    isStreaming: false,
                    error: isAbortedByTimeout
                      ? timeoutErrorMessage
                      : err.message?.includes('404') || hasBackend === false
                      ? 'GitHub Pages statik bir barındırma servisidir ve arka uç Node.js sunucusunu (server.ts) çalıştırmaz. KGD AI\'ın canlı tam sürümünü AI Studio bağlantısından hemen kullanabilirsiniz.'
                      : err.message ||
                        'Sunucu ile bağlantı kurulamadı veya bir hata oluştu.',
                  }
                : m
            );
            return { ...s, messages: updatedMessages };
          })
        );
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length < 2 || isStreaming) return;
    const messages = [...activeSession.messages];
    // Find last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const lastUserMessage = messages[lastUserIndex];
    // Truncate to before last user message and re-send
    const sliced = messages.slice(0, lastUserIndex);
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: sliced } : s))
    );

    setTimeout(() => {
      handleSendMessage(lastUserMessage.content, lastUserMessage.image);
    }, 50);
  };

  const handleExportHistory = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `kgd_ai_sohbet_yedegi_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentMessages = activeSession ? activeSession.messages : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#e3e3e3]">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        onClearAllSessions={handleClearAllSessions}
        onSelectPrompt={(p) => handleSendMessage(p)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          selectedModel={selectedModel}
          onSelectModel={(m) => setSelectedModel(m)}
          onNewChat={handleNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGoogleAuth={() => setIsGoogleModalOpen(true)}
        />

        {/* GitHub Pages / Static Hosting Info Banner */}
        {hasBackend === false && (
          <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border-b border-blue-500/30 px-4 py-2.5 text-xs text-neutral-200 flex flex-wrap items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span>
                <strong>GitHub Pages Modu:</strong> GitHub Pages sadece statik dosya barındırır. Arka uçtaki canlı Gemini sunucusuna bağlı tam sürüm AI Studio üzerinde 7/24 aktiftir.
              </span>
            </div>
            <a
              href="https://ais-pre-tpdc5j6aifjrncdky7wson-976869168609.europe-west2.run.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm inline-flex items-center gap-1 shrink-0"
            >
              Canlı Tam Sürümü Aç ↗
            </a>
          </div>
        )}

        {/* Chat Stream / Messages View */}
        <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-2">
          {currentMessages.length === 0 ? (
            <WelcomeScreen
              userName={userName}
              onSelectPrompt={(p) => handleSendMessage(p)}
            />
          ) : (
            <div className="max-w-4xl mx-auto space-y-2">
              {currentMessages.map((msg, idx) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isLastModelMessage={
                    msg.role === 'model' && idx === currentMessages.length - 1
                  }
                  onRegenerate={handleRegenerate}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Gemini-Style Chat Input Pill Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemPrompt={systemPrompt}
        onSaveSystemPrompt={setSystemPrompt}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onExportHistory={handleExportHistory}
      />

      {/* Google Sign-in Preview Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        userName={userName}
        setUserName={setUserName}
      />
    </div>
  );
}
