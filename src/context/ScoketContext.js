'use client';

import { createContext, useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useFetchRoleQuery, useFetchMeQuery } from '../services/api';
import { usePathname } from 'next/navigation';
import jwtDecode from 'jwt-decode';
import { toast } from 'sonner';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [tokens, setTokens] = useState({ accessToken: null, adminAccessToken: null });
  const [socketInstance, setSocketInstance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState(null);

  const pathname = usePathname();
  const isAdminPanel = useMemo(() => pathname?.startsWith('/admin'), [pathname]);

  // Read tokens from localStorage after login
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      const accessToken = localStorage.getItem('accessToken');
      const adminAccessToken = localStorage.getItem('admin_access_token');

      if (accessToken || adminAccessToken) {
        setTokens({ accessToken, adminAccessToken });
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [pathname]);

  const shouldRunRoleQuery = isAdminPanel && !!tokens.adminAccessToken;
  const shouldRunUserQuery = !isAdminPanel && !!tokens.accessToken;

  const {
    data: roleData,
    isLoading: isLoadingRole,
    refetch: refetchRole
  } = useFetchRoleQuery(undefined, { skip: !shouldRunRoleQuery });

  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUser
  } = useFetchMeQuery(undefined, { skip: !shouldRunUserQuery });

  const user = userData?.data || null;

  // Cache role into localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (roleData?.success && ['admin', 'agent'].includes(roleData.role)) {
      localStorage.setItem('cachedRole', roleData.role);
    } else if (userData?.success && ['user', 'admin', 'agent'].includes(userData.data?.role)) {
      localStorage.setItem('cachedRole', userData.data.role);
    }
  }, [roleData, userData]);

  // Refetch when token appears
  useEffect(() => {
    if (shouldRunRoleQuery) refetchRole();
    if (shouldRunUserQuery) refetchUser();
  }, [tokens]);

  // Ensure server initializes Socket.IO once
  useEffect(() => {
    fetch('/api/socket');
  }, []);

  // Initialize socket only when tokens are ready
  useEffect(() => {
    if (!tokens.accessToken && !tokens.adminAccessToken) return;

    const getTokenAndRole = () => {
      let token = null;
      let role = null;

      const cachedRole = localStorage.getItem('cachedRole');
      if (cachedRole) {
        if (['admin', 'agent'].includes(cachedRole)) {
          token = localStorage.getItem('admin_access_token');
        } else if (cachedRole === 'user') {
          token = localStorage.getItem('accessToken');
        }
        if (token) return { token, role: cachedRole };
      }

      // Fallback: decode tokens
      const allRoles = ['admin', 'agent', 'user'];
      for (const r of allRoles) {
        const key = r === 'user' ? 'accessToken' : 'admin_access_token';
        const tk = localStorage.getItem(key);
        if (tk) {
          try {
            const decoded = jwtDecode(tk);
            if (decoded?.role === r) {
              localStorage.setItem('cachedRole', r);
              return { token: tk, role: r };
            }
          } catch (_) {}
        }
      }

      return { token: null, role: null };
    };

    const { token, role } = getTokenAndRole();
    if (!token || !role) return;

    const socket = io({
      auth: { token, role },
      path: '/socket.io',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log(`🔌 Connected as ${role}`);
      setIsConnected(true);

      // Join user-specific room
      const userId = localStorage.getItem('user_id') || user?._id;
      if (userId) {
        socket.emit('join_room', `user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`⚠️ Socket disconnected`);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connect_error:', err.message);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('cachedRole');
      toast.error('Session expired. Please log in again.');
      window.location.href = '/';
    });

    socket.on('new_notification', (notification) => {
      console.log('🔔 Notification received:', notification);
      setRealtimeNotification(notification);
    });

    setSocketInstance(socket);
    return () => socket.disconnect();
  }, [tokens]); // 👈 only depends on tokens now

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected, user, realtimeNotification }}>
      {children}
    </SocketContext.Provider>
  );
};
