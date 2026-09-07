import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Minus,
  Maximize2,
  Hash,
  Layers,
  Rocket,
  CheckSquare,
  Users,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { chatApi } from '../api/client';
import { getSocket } from '../api/socket';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const getChannelIcon = (iconName) => {
  switch (iconName) {
    case 'Layers': return Layers;
    case 'Rocket': return Rocket;
    case 'CheckSquare': return CheckSquare;
    default: return Hash;
  }
};

export const FloatingChatWidget = ({ onOpenFullScreen }) => {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChannelMenuOpen, setIsChannelMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Initialize socket and channels
  useEffect(() => {
    const socket = getSocket();

    // Fetch channel list
    chatApi.getChannels().then(res => {
      if (res.data?.channels) {
        setChannels(res.data.channels);
      }
    }).catch(() => {});

    // Listen for global chat notifications
    const handleGlobalChat = (e) => {
      const { channel, message } = e.detail || {};
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      } else if (channel === activeChannel && message) {
        setMessages(prev => {
          const id = message._id || message.id;
          if (prev.some(m => (m._id || m.id) === id)) return prev;
          return [...prev, message];
        });
      }
    };

    window.addEventListener('radora:chat_message', handleGlobalChat);

    return () => {
      window.removeEventListener('radora:chat_message', handleGlobalChat);
    };
  }, [isOpen, activeChannel]);

  // Join/leave socket room and fetch messages when channel changes
  useEffect(() => {
    if (!isOpen) return;

    const socket = getSocket();
    socket.emit('chat:join_channel', activeChannel);

    loadChannelMessages(activeChannel);

    const handleNewMessage = (msg) => {
      setMessages(prev => {
        const id = msg._id || msg.id;
        if (prev.some(m => (m._id || m.id) === id)) return prev;
        return [...prev, msg];
      });
    };

    const handleDeletedMessage = (data) => {
      if (data?.messageId) {
        setMessages(prev => prev.filter(m => (m._id || m.id) !== data.messageId));
      }
    };

    socket.on('chat:new_message', handleNewMessage);
    socket.on('chat:message_deleted', handleDeletedMessage);

    return () => {
      socket.emit('chat:leave_channel', activeChannel);
      socket.off('chat:new_message', handleNewMessage);
      socket.off('chat:message_deleted', handleDeletedMessage);
    };
  }, [isOpen, activeChannel]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const loadChannelMessages = async (channel) => {
    try {
      setLoading(true);
      const res = await chatApi.getMessages(channel);
      if (res.data?.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('[FloatingChat] Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');

    try {
      setSending(true);
      const socket = getSocket();

      // Send via socket for instant live broadcast
      socket.emit('chat:send_message', {
        channel: activeChannel,
        content: text,
        user,
      }, (res) => {
        if (res && res.error) {
          addToast('Failed to send message: ' + res.error, 'error');
          setInputText(text);
        }
      });
    } catch (err) {
      addToast('Send error: ' + err.message, 'error');
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const handleOpenWidget = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const activeChannelObj = channels.find(c => c.id === activeChannel) || {
    id: 'general',
    name: 'general',
    icon: 'Hash',
  };
  const ChannelIcon = getChannelIcon(activeChannelObj.icon);

  return (
    <>
      {/* Minimized Floating Launcher Button (Visible on every screen) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
          <button
            onClick={handleOpenWidget}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-radora-600 via-indigo-600 to-purple-600 hover:from-radora-500 hover:to-indigo-500 text-white font-bold text-xs shadow-2xl shadow-radora-600/40 hover:shadow-radora-500/60 transition-all hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-md"
            title="Open Team Live Chat"
          >
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-white group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <span className="tracking-wide">Team Chat</span>

            {/* Unread Message Pill */}
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-500 text-white shadow-sm animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Expanded Pop-up Chatroom Dock */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-all">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
            {/* Channel Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsChannelMenuOpen(!isChannelMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold hover:bg-slate-300/60 dark:hover:bg-slate-700 transition-colors"
              >
                <ChannelIcon className="w-3.5 h-3.5 text-radora-500" />
                <span>#{activeChannelObj.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Channel Selector Menu */}
              {isChannelMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Channels
                  </div>
                  {channels.map(c => {
                    const CIcon = getChannelIcon(c.icon);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setActiveChannel(c.id);
                          setIsChannelMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                          activeChannel === c.id
                            ? 'bg-radora-500/15 text-radora-600 dark:text-radora-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <CIcon className="w-3.5 h-3.5" />
                        <span className="truncate">#{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions: Full Screen, Minimize, Close */}
            <div className="flex items-center gap-1">
              {onOpenFullScreen && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullScreen();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Expand to Full Screen Chat"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-white dark:bg-slate-900 text-xs">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">No messages in #{activeChannelObj.name}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Send a note to collaborate with teammates live!</span>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = String(msg.senderId) === String(user?._id || user?.id);
                const isAdminSender = msg.senderRole === 'architect_admin';

                return (
                  <div
                    key={msg._id || msg.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-sm ${
                      isAdminSender
                        ? 'bg-gradient-to-tr from-radora-600 to-indigo-600'
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                    }`}>
                      {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-0.5 px-0.5">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                          {msg.senderName}
                        </span>
                        {isAdminSender && (
                          <span className="text-[8px] font-bold px-1 py-0.2 rounded-full bg-radora-500/15 text-radora-600 dark:text-radora-400">
                            Admin
                          </span>
                        )}
                        <span className="text-[9px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-radora-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/60'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              type="button"
              onClick={() => setInputText('🚀 Verifying current module checklist.')}
              className="px-2 py-0.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors"
            >
              🚀 Module verification
            </button>
            <button
              type="button"
              onClick={() => setInputText('✅ Task marked completed with 0 errors.')}
              className="px-2 py-0.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors"
            >
              ✅ Task completed
            </button>
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-50/80 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${activeChannelObj.name}...`}
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2 rounded-xl bg-gradient-to-r from-radora-600 to-indigo-600 hover:from-radora-500 hover:to-indigo-500 text-white shadow-md shadow-radora-600/30 transition-all disabled:opacity-40"
              title="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
