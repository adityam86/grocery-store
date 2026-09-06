import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    socket.on('join_order_room', (orderId) => {
      socket.join(orderId);
      console.log(`Client joined order tracking room: ${orderId}`);
    });

    socket.on('rider_location_update', (data) => {
      const { orderId, latitude, longitude, status } = data;
      io.to(orderId).emit('rider_location_received', { latitude, longitude, status });
    });

    socket.on('disconnect', () => {
      console.log(`Socket Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
