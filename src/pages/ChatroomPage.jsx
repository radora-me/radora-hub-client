import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Hash,
  Layers,
  Rocket,
  CheckSquare,
  Users,
  Shield,
  Sparkles,
  Clock,
  RefreshCw,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  EyeOff,
  Check,
  Terminal,
  Flame,
  Zap,
  Compass,
  Cpu,
  Code2,
  Bug,
  ShieldCheck,
  LifeBuoy,
  Lock,
  Menu
} from 'lucide-react';
import { chatApi } from '../api/client';
import { getSocket } from '../api/socket';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const AVAILABLE_ICONS = [
  { id: 'Hash', icon: Hash, label: 'General' },
  { id: 'Layers', icon: Layers, label: 'Layers' },
  { id: 'Rocket', icon: Rocket, label: 'Rocket' },
  { id: 'CheckSquare', icon: CheckSquare, label: 'Checklist' },
  { id: 'Terminal', icon: Terminal, label: 'Terminal' },
  { id: 'Code2', icon: Code2, label: 'Code' },
  { id: 'Zap', icon: Zap, label: 'Fast' },
  { id: 'Flame', icon: Flame, label: 'Urgent' },
  { id: 'Bug', icon: Bug, label: 'QA / Bug' },
  { id: 'ShieldCheck', icon: ShieldCheck, label: 'Security' },
  { id: 'Compass', icon: Compass, label: 'Discovery' },
  { id: 'Cpu', icon: Cpu, label: 'Core / Arch' },
  { id: 'LifeBuoy', icon: LifeBuoy, label: 'Support' },
];

const getChannelIcon = (iconName) => {
  const match = AVAILABLE_ICONS.find(i => i.id === iconName);
  return match ? match.icon : Hash;
};

export const ChatroomPage = () => {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Channel Creation Modal State
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanTopic, setNewChanTopic] = useState('');
  const [newChanIcon, setNewChanIcon] = useState('Hash');
  const [creatingChan, setCreatingChan] = useState(false);

  // Channel Deletion Modal State
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [deletingChan, setDeletingChan] = useState(false);

  // Message Deletion Modal State
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deletingMsg, setDeletingMsg] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initial load of channels
  useEffect(() => {
    fetchChannels();
  }, []);

  // Socket.IO real-time event subscriptions
  useEffect(() => {
    fetchMessages(activeChannel, true);
    const socket = getSocket();
    if (!socket) return;

    // Join active channel room
    socket.emit('chat:join_channel', activeChannel);

    const handleNewMessage = (msg) => {
      if (msg.channel === activeChannel) {
        setMessages(prev => {
          if (prev.some(m => (m._id || m.id) === (msg._id || msg.id))) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleMessageDeleted = (data) => {
      const deletedId = data.messageId || data.id;
      setMessages(prev => prev.filter(m => (m._id || m.id) !== deletedId));
    };

    const handleChannelCreated = ({ channel }) => {
      if (!channel) return;
      setChannels(prev => (prev.some(c => c.id === channel.id) ? prev : [...prev, channel]));
    };

    const handleChannelDeleted = ({ channelId }) => {
      setChannels(prev => prev.filter(c => c.id !== channelId));
      setActiveChannel(prev => (prev === channelId ? 'general' : prev));
    };

    const handleOnlineUsers = (users) => {
      if (Array.isArray(users)) {
        setOnlineUsers(users);
      }
    };

    const handleUserTyping = ({ channel, userName, isTyping }) => {
      if (channel !== activeChannel) return;
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(userName) ? prev : [...prev, userName];
        } else {
          return prev.filter(u => u !== userName);
        }
      });
    };

    socket.on('chat:new_message', handleNewMessage);
    socket.on('chat:message_deleted', handleMessageDeleted);
    socket.on('chat:channel_created', handleChannelCreated);
    socket.on('chat:channel_deleted', handleChannelDeleted);
    socket.on('chat:online_users', handleOnlineUsers);
    socket.on('chat:user_typing', handleUserTyping);

    return () => {
      socket.emit('chat:leave_channel', activeChannel);
      socket.off('chat:new_message', handleNewMessage);
      socket.off('chat:message_deleted', handleMessageDeleted);
      socket.off('chat:channel_created', handleChannelCreated);
      socket.off('chat:channel_deleted', handleChannelDeleted);
      socket.off('chat:online_users', handleOnlineUsers);
      socket.off('chat:user_typing', handleUserTyping);
    };
  }, [activeChannel]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChannels = async () => {
    try {
      const res = await chatApi.getChannels();
      if (res.data.success) {
        setChannels(res.data.channels || []);
      }
    } catch (err) {
      console.error('[Chat] Failed to load channels:', err);
    }
  };

  const fetchMessages = async (channel, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await chatApi.getMessages(channel);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('[Chat] Failed to load messages:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('chat:typing', {
        channel: activeChannel,
        userName: user?.name || 'Teammate',
        isTyping: true,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('chat:typing', {
          channel: activeChannel,
          userName: user?.name || 'Teammate',
          isTyping: false,
        });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText('');

    // Clear typing notification
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('chat:typing', {
        channel: activeChannel,
        userName: user?.name || 'Teammate',
        isTyping: false,
      });
    }

    try {
      setSending(true);
      if (socket && socket.connected) {
        socket.emit('chat:send_message', {
          channel: activeChannel,
          content: textToSend,
          user: {
            _id: user?._id || user?.id,
            id: user?._id || user?.id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            avatar: user?.avatar,
          }
        }, (response) => {
          if (!response || !response.success) {
            chatApi.sendMessage(activeChannel, textToSend).catch(console.error);
          }
        });
      } else {
        const res = await chatApi.sendMessage(activeChannel, textToSend);
        if (res.data.success) {
          setMessages(prev => {
            const msg = res.data.message;
            if (prev.some(m => (m._id || m.id) === (msg._id || msg.id))) return prev;
            return [...prev, msg];
          });
        }
      }
    } catch (err) {
      addToast('Failed to send message: ' + (err.response?.data?.message || err.message), 'error');
      setInputText(textToSend); // Restore on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Channel Creation ---
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    const cleanName = newChanName.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
    if (!cleanName || cleanName.length < 2) {
      addToast('Channel name must be at least 2 characters.', 'error');
      return;
    }

    try {
      setCreatingChan(true);
      const res = await chatApi.createChannel({
        name: cleanName,
        topic: newChanTopic.trim(),
        icon: newChanIcon,
      });

      if (res.data.success) {
        addToast(`Channel #${res.data.channel.name} created! 🚀`, 'success');
        setChannels(prev => (prev.some(c => c.id === res.data.channel.id) ? prev : [...prev, res.data.channel]));
        setActiveChannel(res.data.channel.id);
        setIsCreateChannelOpen(false);
        setNewChanName('');
        setNewChanTopic('');
        setNewChanIcon('Hash');
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to create channel', 'error');
    } finally {
      setCreatingChan(false);
    }
  };

  // --- Channel Deletion ---
  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;

    try {
      setDeletingChan(true);
      const res = await chatApi.deleteChannel(channelToDelete.id);
      if (res.data.success) {
        addToast(`Channel #${channelToDelete.name} deleted successfully`, 'success');
        setChannels(prev => prev.filter(c => c.id !== channelToDelete.id));
        if (activeChannel === channelToDelete.id) {
          setActiveChannel('general');
        }
        setChannelToDelete(null);
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to delete channel', 'error');
    } finally {
      setDeletingChan(false);
    }
  };

  // --- Message Deletion ---
  const handleDeleteMessage = async (scope) => {
    if (!messageToDelete) return;
    const msgId = messageToDelete._id || messageToDelete.id;

    try {
      setDeletingMsg(true);
      const res = await chatApi.deleteMessage(msgId, scope);
      if (res.data.success) {
        addToast(res.data.message || 'Message deleted', 'success');
        setMessages(prev => prev.filter(m => (m._id || m.id) !== msgId));
        setMessageToDelete(null);
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to delete message', 'error');
    } finally {
      setDeletingMsg(false);
    }
  };

  const activeChannelData = channels.find(c => c.id === activeChannel) || {
    id: activeChannel,
    name: activeChannel,
    topic: 'Team Discussion',
    icon: 'Hash',
  };

  const ActiveIcon = getChannelIcon(activeChannelData.icon);

  return (
    <div className="h-full w-full flex overflow-hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Channel Navigation & Online Teammates */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-50/95 dark:bg-slate-950/95 border-r border-slate-200 dark:border-slate-800 p-3.5 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 shrink-0 h-full
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Channel Header */}
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-radora-500" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Channels ({channels.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateChannelOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-radora-500/10 text-radora-600 dark:text-radora-400 hover:bg-radora-500/20 transition-all border border-radora-500/20"
              title="Create New Channel"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Channels Scrollable List */}
          <div className="space-y-1 overflow-y-auto pr-1 flex-1 min-h-0 custom-scrollbar">
            {channels.map((chan) => {
              const Icon = getChannelIcon(chan.icon);
              const isActive = activeChannel === chan.id;
              const isGeneral = chan.id === 'general';
              const canDelete = !isGeneral && (isAdmin || String(chan.createdBy) === String(user?._id || user?.id));

              return (
                <div
                  key={chan.id}
                  className={`group relative flex items-center justify-between rounded-xl transition-all ${
                    isActive
                      ? 'bg-radora-600/15 text-radora-600 dark:text-radora-300 border border-radora-500/30 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveChannel(chan.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold truncate text-left"
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-radora-500' : 'text-slate-400'}`} />
                    <span className="truncate">{chan.name}</span>
                  </button>

                  {/* Channel Delete Button */}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChannelToDelete(chan);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 mr-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title={`Delete #${chan.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Online Teammates Section */}
          <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Teammates ({Math.max(onlineUsers.length, 1)})
              </span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1.5 px-1">
              {onlineUsers.length > 0 ? (
                onlineUsers.map((u, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-1.5 py-1 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1 font-medium">
                      {u.name || u.email || 'Online User'}
                    </span>
                    {u.role === 'architect_admin' && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-radora-500/15 text-radora-500 font-bold">
                        Admin
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 px-1.5 py-1 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{user?.name} (You)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current User Card */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 px-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-radora-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name}
              </div>
              <div className="text-[10px] text-radora-600 dark:text-radora-400 font-semibold truncate">
                {isAdmin ? '👑 Architect Admin' : '👤 Team Member'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Feed & Composer (Edge-to-Edge Full-Screen) */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
        
        {/* Channel Top Header Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Open Channels"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-xl bg-radora-500/10 border border-radora-500/20 flex items-center justify-center text-radora-600 dark:text-radora-400 shrink-0">
              <ActiveIcon className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  #{activeChannelData.name}
                </h2>
                {activeChannelData.isDefault && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                    Default
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activeChannelData.topic || `Channel for #${activeChannelData.name} collaboration`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>

            {/* Delete Channel if eligible */}
            {!activeChannelData.isDefault && (isAdmin || String(activeChannelData.createdBy) === String(user?._id || user?.id)) && (
              <button
                onClick={() => setChannelToDelete(activeChannelData)}
                title="Delete Channel"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => fetchMessages(activeChannel, false)}
              title="Refresh Chat"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-radora-500 mb-2" />
              <span className="text-xs">Loading channel messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No messages in #{activeChannel} yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Start the conversation! Coordinate tasks, updates, and checklist verification in real time.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const msgId = msg._id || msg.id;
              const isMe = String(msg.senderId) === String(user?._id || user?.id);
              const isAdminSender = msg.senderRole === 'architect_admin';

              return (
                <div
                  key={msgId}
                  className={`flex items-start gap-3 group relative ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {/* Sender Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    {msg.senderAvatar ? (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs ${
                        isAdminSender
                          ? 'bg-gradient-to-tr from-radora-600 to-indigo-600'
                          : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                      }`}>
                        {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Name & Role Header */}
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {msg.senderName}
                      </span>

                      {isAdminSender ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-radora-500/15 text-radora-600 dark:text-radora-400 border border-radora-500/25">
                          👑 Admin
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          👤 Member
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Hover Message Delete Trigger */}
                      <button
                        type="button"
                        onClick={() => setMessageToDelete(msg)}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all"
                        title={isAdmin && !isMe ? "Admin Message Options" : "Delete Message"}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Content Bubble */}
                    <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-xs relative group/bubble ${
                      isMe
                        ? 'bg-gradient-to-r from-radora-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/80'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Real-time typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic px-2 py-1 bg-slate-50 dark:bg-slate-950/50 rounded-lg w-fit animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-radora-500" />
              <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Chips */}
        <div className="px-4 sm:px-6 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 text-[11px] shrink-0">
          <span className="text-slate-400 shrink-0 text-[10px] font-bold uppercase">Quick:</span>
          <button
            type="button"
            onClick={() => setInputText('🚀 Radora Next build verification in progress across all portals.')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 transition-colors"
          >
            🚀 Build verification
          </button>
          <button
            type="button"
            onClick={() => setInputText('✅ Checklist module signed off with 0 blockers.')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 transition-colors"
          >
            ✅ Checklist signed off
          </button>
          <button
            type="button"
            onClick={() => setInputText('⚠️ Notice: Updating environment variables and Atlas credentials.')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 transition-colors"
          >
            ⚠️ Env notice
          </button>
          <button
            type="button"
            onClick={() => setInputText('🔍 Live sync confirmed: changes propagate without page reload.')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 transition-colors"
          >
            🔍 Live sync confirmed
          </button>
        </div>

        {/* Input & Send Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${activeChannelData.name}... (Enter to send)`}
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500 focus:ring-1 focus:ring-radora-500/30 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-radora-600 to-indigo-600 hover:from-radora-500 hover:to-indigo-500 text-white shadow-md shadow-radora-600/30 transition-all disabled:opacity-40 hover:scale-105 active:scale-95 shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5 text-xs font-bold">Send</span>
          </button>
        </form>

      </div>

      {/* ========================================================================= */}
      {/* 1. Create Channel Modal */}
      {/* ========================================================================= */}
      {isCreateChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-radora-500/10 border border-radora-500/20 flex items-center justify-center text-radora-600 dark:text-radora-400">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create Team Channel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateChannelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Channel Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">
                    #
                  </span>
                  <input
                    type="text"
                    value={newChanName}
                    onChange={(e) => setNewChanName(e.target.value)}
                    placeholder="e.g. backend-api, ui-reviews, sprint-qa"
                    required
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Spaces and special characters will be automatically formatted into hyphens.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Topic / Purpose
                </label>
                <input
                  type="text"
                  value={newChanTopic}
                  onChange={(e) => setNewChanTopic(e.target.value)}
                  placeholder="e.g. Discussion on API schemas and edge endpoints"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Channel Icon
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = newChanIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setNewChanIcon(item.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-radora-500/15 border-radora-500 text-radora-600 dark:text-radora-400 scale-105 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={item.label}
                      >
                        <ItemIcon className="w-4 h-4" />
                        <span className="text-[9px] truncate max-w-[45px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateChannelOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingChan || !newChanName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-radora-600 to-indigo-600 hover:from-radora-500 hover:to-indigo-500 shadow-md shadow-radora-600/25 disabled:opacity-50"
                >
                  {creatingChan ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Delete Channel Confirmation Modal */}
      {/* ========================================================================= */}
      {channelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Delete Channel #{channelToDelete.name}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              This will permanently delete the channel and all messages posted inside it. This action cannot be undone.
            </p>

            <div className="flex gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => setChannelToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteChannel}
                disabled={deletingChan}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/25 transition-all disabled:opacity-50"
              >
                {deletingChan ? 'Deleting...' : 'Delete Channel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Delete Message Options Modal (Delete for me vs Delete for everyone / Admin) */}
      {/* ========================================================================= */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Message
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview of message */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {messageToDelete.senderName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(messageToDelete.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic truncate">
                  "{messageToDelete.content}"
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {/* Option 1: Delete for me */}
                <button
                  type="button"
                  onClick={() => handleDeleteMessage('me')}
                  disabled={deletingMsg}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950/50 dark:hover:bg-slate-800 text-left transition-all group flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 group-hover:scale-105 transition-transform">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Delete for me
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      This message will only be removed from your view. Other members will still see it.
                    </div>
                  </div>
                </button>

                {/* Option 2: Delete for everyone (Author or Admin) */}
                {(String(messageToDelete.senderId) === String(user?._id || user?.id) || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage('everyone')}
                    disabled={deletingMsg}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all group flex items-start gap-3 ${
                      isAdmin && String(messageToDelete.senderId) !== String(user?._id || user?.id)
                        ? 'border-radora-500/40 bg-radora-500/5 hover:bg-radora-500/10'
                        : 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 group-hover:scale-105 transition-transform ${
                      isAdmin && String(messageToDelete.senderId) !== String(user?._id || user?.id)
                        ? 'bg-radora-500/20 text-radora-600 dark:text-radora-400'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {isAdmin && String(messageToDelete.senderId) !== String(user?._id || user?.id) ? (
                          <>
                            <span className="text-radora-600 dark:text-radora-400 font-bold">
                              👑 Permanently Delete for Everyone (Admin)
                            </span>
                          </>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 font-bold">
                            Delete for everyone
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isAdmin && String(messageToDelete.senderId) !== String(user?._id || user?.id)
                          ? 'As Chief Architect Admin, permanently destroy this message for all users in the channel.'
                          : 'Permanently remove this message for all members in this channel.'}
                      </div>
                    </div>
                  </button>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMessageToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
