import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  API_BASE.startsWith('http://') || API_BASE.startsWith('https://')
    ? API_BASE.replace(/\/api\/?$/, '')
    : (typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:5000')
);

let socket = null;

export const initSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to Radora Hub Real-Time Engine (ID:', socket.id, ')');

    // Announce online user
    try {
      const stored = localStorage.getItem('radora_auth_user');
      if (stored) {
        const user = JSON.parse(stored);
        socket.emit('user:online', user);
      }
    } catch (e) {
      console.error('[Socket] Failed to announce presence:', e);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection warning:', err.message);
  });

  // Listen for platform updates (e.g. project changes, checklist changes, template deletes)
  // and dispatch native browser event for instantaneous reactive updates without page reload
  socket.on('platform:update', (data) => {
    window.dispatchEvent(new CustomEvent('radora:platform_update', { detail: data }));
  });

  // Global notification for incoming chat messages
  socket.on('chat:global_message_notify', (data) => {
    window.dispatchEvent(new CustomEvent('radora:chat_message', { detail: data }));
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const announceUserPresence = (user) => {
  const s = getSocket();
  if (s && user) {
    s.emit('user:online', user);
  }
};
