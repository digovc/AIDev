import { io } from 'socket.io-client';

class SocketIOService {
  constructor() {
    this.socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server with ID:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Create a singleton instance
export const socketIOService = new SocketIOService();
