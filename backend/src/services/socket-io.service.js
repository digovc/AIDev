const socketIO = require('socket.io');

class SockerIOService {
  constructor() {
    this.io = null;
  }

  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Cliente conectado: ${ socket.id }`);

      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${ socket.id }`);
      });
    });

    return this.io;
  }
}

module.exports = new SockerIOService();
