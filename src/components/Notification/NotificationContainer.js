'use client';

import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../context/ScoketContext';
import NotificationBell from './NotificationBell';
import NotificationDropdown from './NotificationDropdown';
import { useFetchUnreadNotificationCountQuery } from '@/services/api';

const NotificationContainer = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { socket, isConnected, user, realtimeNotification } = useContext(SocketContext) || {};

  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
    isFetching: isUnreadCountFetching,
  } = useFetchUnreadNotificationCountQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });

  const unreadCount = unreadCountData?.data?.unreadCount || 0;

  // 🔄 Refetch count when real-time notification arrives
  useEffect(() => {
    if (realtimeNotification) {
      console.log('📥 Real-time notification received in container:', realtimeNotification);

      // Optional short delay for DB consistency
      setTimeout(() => {
        refetchUnreadCount();
      }, 300);

      // Optionally show browser push notification
      if (window?.Notification && Notification.permission === 'granted') {
        new Notification('📢 New Notification', {
          body: realtimeNotification.message,
        });
      }
    }
  }, [realtimeNotification, refetchUnreadCount]);

  // 🔁 Refetch on window/tab focus
  useEffect(() => {
    const handleFocus = () => refetchUnreadCount();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchUnreadCount]);

  // 🔌 Refetch on socket reconnect
  useEffect(() => {
    if (!socket) return;
    const handleReconnect = () => {
      console.log('🔄 Socket reconnected, refetching unread count...');
      refetchUnreadCount();
    };
    socket.on('connect', handleReconnect);
    return () => socket.off('connect', handleReconnect);
  }, [socket, refetchUnreadCount]);

  // 🔐 Request push permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const handleToggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleCloseDropdown = () => setIsDropdownOpen(false);
  const handleMarkAsRead = () => refetchUnreadCount();
  const handleMarkAllAsRead = () => refetchUnreadCount();

  return (
    <div className="relative">
      <NotificationBell
        onToggleDropdown={handleToggleDropdown}
        unreadCount={unreadCount}
        loading={isUnreadCountFetching}
      />
      <NotificationDropdown
        isOpen={isDropdownOpen}
        onClose={handleCloseDropdown}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
      {/* Connection Status Badge (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className={`fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs text-white z-50 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {isConnected ? '🟢 Socket Connected' : '🔴 Socket Disconnected'}
        </div>
      )}
    </div>
  );
};

export default NotificationContainer;
