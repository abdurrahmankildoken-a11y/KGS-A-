import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Pin,
  Sparkles,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { ChatSession } from '../types/chat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  onClearAllSessions: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onClearAllSessions,
  onSelectPrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const regularSessions = filteredSessions.filter((s) => !s.pinned);

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveEditing = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingId && editTitle.trim()) {
      onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-68 bg-[#1e1f20] border-r border-neutral-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'
        }`}
      >
        {/* Top Header / New Chat */}
        <div className="p-3.5 space-y-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-[#131314] hover:bg-neutral-800/90 text-neutral-200 hover:text-white border border-neutral-700/60 shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">Yeni Sohbet</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-purple-400 opacity-60 group-hover:opacity-100" />
          </button>

          {/* Search bar */}
          {sessions.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Sohbetlerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131314] border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          )}
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {/* Pinned Chats */}
          {pinnedSessions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pin className="w-3 h-3 text-amber-400" />
                <span>Sabitlenenler</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {pinnedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    isEditing={editingId === session.id}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                    onStartEditing={(e) => startEditing(session, e)}
                    onSaveEditing={saveEditing}
                    onCancelEditing={cancelEditing}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePinSession(session.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Recent Chats */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Son Sohbetler
            </div>

            {regularSessions.length === 0 && pinnedSessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-neutral-400">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                <p>Henüz sohbet geçmişi yok.</p>
                <p className="mt-1 text-[11px] text-neutral-400">Yeni bir mesaj yazarak başla!</p>
              </div>
            ) : (
              <div className="mt-1 space-y-0.5">
                {regularSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    isEditing={editingId === session.id}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                    onStartEditing={(e) => startEditing(session, e)}
                    onSaveEditing={saveEditing}
                    onCancelEditing={cancelEditing}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePinSession(session.id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick inspiration ideas */}
          <div className="pt-2 border-t border-neutral-800/60">
            <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3 text-yellow-400" />
              <span>Hızlı Fikirler</span>
            </div>
            <div className="mt-1 space-y-1">
              {[
                { title: 'Python REST API Örneği', prompt: 'Python FastAPI ile JWT auth destekli örnek bir REST API oluşturur musun?' },
                { title: 'Modern UI Tasarım İpuçları', prompt: 'Modern minimalist bir web arayüzü tasarlamak için dikkat edilmesi gereken 5 altın kural nedir?' },
                { title: 'Kod Hata Ayıklama', prompt: 'Sana göndereceğim kod bloğundaki potansiyel performans sorunlarını analiz eder misin?' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPrompt(item.prompt);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors line-clamp-1"
                >
                  ⚡ {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-[#1e1f20] space-y-2 text-xs">
          {sessions.length > 1 && (
            <button
              onClick={() => {
                if (window.confirm('Tüm sohbet geçmişini silmek istediğinize emin misiniz?')) {
                  onClearAllSessions();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-950/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tüm Geçmişi Temizle</span>
            </button>
          )}

          <div className="px-2 pt-1 flex items-center justify-between text-[11px] text-neutral-400">
            <span>KGD AI v1.0 • Gemini Engine</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Çevrimiçi" />
          </div>
        </div>
      </aside>
    </>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (title: string) => void;
  onSelect: () => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSaveEditing: (e?: React.FormEvent) => void;
  onCancelEditing: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  onSelect,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onDelete,
  onTogglePin,
}) => {
  if (isEditing) {
    return (
      <form onSubmit={onSaveEditing} className="flex items-center gap-1 px-2 py-1">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          autoFocus
          className="flex-1 bg-[#131314] text-xs text-white px-2 py-1 rounded border border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="p-1 text-emerald-400 hover:text-emerald-300"
          title="Kaydet"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onCancelEditing}
          className="p-1 text-neutral-400 hover:text-white"
          title="İptal"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </form>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
        isActive
          ? 'bg-[#282a2c] text-white font-medium border-l-2 border-blue-400'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#282a2c]/50'
      }`}
    >
      <div className="flex items-center gap-2 truncate pr-14">
        <MessageSquare
          className={`w-3.5 h-3.5 shrink-0 ${
            isActive ? 'text-blue-400' : 'text-neutral-500'
          }`}
        />
        <span className="truncate">{session.title || 'Yeni Sohbet'}</span>
      </div>

      {/* Action buttons (Pin, Edit, Delete) on hover */}
      <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onTogglePin}
          className={`p-1 rounded hover:bg-neutral-700/80 transition-colors ${
            session.pinned ? 'text-amber-400 opacity-100' : 'text-neutral-400 hover:text-white'
          }`}
          title={session.pinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={onStartEditing}
          className="p-1 rounded hover:bg-neutral-700/80 text-neutral-400 hover:text-white transition-colors"
          title="Yeniden Adlandır"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-neutral-700/80 text-neutral-400 hover:text-red-400 transition-colors"
          title="Sohbeti Sil"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
