import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const getSocketUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    try {
      const url = new URL(import.meta.env.VITE_API_URL);
      return url.origin;
    } catch (e) {
      return import.meta.env.VITE_API_URL;
    }
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:5005';
  }
  return 'https://myclaimportal.onrender.com';
};

export const SOCKET_URL = getSocketUrl();

let socketInstance = null;

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
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
