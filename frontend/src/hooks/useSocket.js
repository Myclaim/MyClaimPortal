import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

<<<<<<< HEAD
const SOCKET_URL = 'https://myclaimportal.onrender.com';
=======
const SOCKET_URL = 'http://localhost:5005';
>>>>>>> 9cb87025bea4640e9ef29ca9ba9501c3bb704586

let socketInstance = null;

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    setSocket(socketInstance);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    // Initial state
    setConnected(socketInstance.connected);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket, connected };
};
