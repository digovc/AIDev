import { io } from 'socket.io-client';

class SocketIOService {
  _listeners = {};

  constructor() {
    this.socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server with ID:', this.socket.id);
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  on(eventName, listener) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(listener);
  }

  emit(eventName, ...args) {
    if (this._listeners[eventName]) {
      this._listeners[eventName].forEach(listener => listener(...args));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Create a singleton instance
export const socketIOService = new SocketIOService();
