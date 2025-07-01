'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { SocketContext } from '../../context/ScoketContext';
import {
  useFetchNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from '@/services/api';

const NotificationDropdown = ({ isOpen, onClose, onMarkAsRead, onMarkAllAsRead }) => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsList, setNotificationsList] = useState([]);
  const dropdownRef = useRef(null);

  const socketContext = useContext(SocketContext);
  const { realtimeNotification } = socketContext || {};

  // ✅ Correct param building (boolean isRead)
  const queryParams = {
    page: currentPage,
    limit: 10,
    ...(filter === 'read' ? { isRead: true } : filter === 'unread' ? { isRead: false } : {}),
  };

  const { data, isLoading, refetch, isFetching } = useFetchNotificationsQuery(queryParams, {
    skip: !isOpen,
  });

  const hasMore = data?.data?.pagination?.hasNextPage || false;
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();

  // ⬇️ Set notification list from paginated results
  useEffect(() => {
    if (!data?.data?.notifications) return;
    const newData = data.data.notifications;
    if (currentPage === 1) {
      setNotificationsList(newData);
    } else {
      setNotificationsList((prev) => [...prev, ...newData]);
    }
  }, [data, currentPage]);

  // 🔄 Refresh when real-time update comes
  useEffect(() => {
    if (realtimeNotification && isOpen) {
      setCurrentPage(1);
      refetch();
    }
  }, [realtimeNotification, isOpen, refetch]);

  // ❌ Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // ✅ Change filter (reset page + list)
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    setNotificationsList([]);
  };

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId).unwrap();
      onMarkAsRead?.(1);
      setCurrentPage(1);
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markNotificationAsRead({ markAll: true }).unwrap();
      onMarkAllAsRead?.();
      setCurrentPage(1);
      refetch();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    onClose();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      course_purchase: { icon: '🎓', bg: 'bg-green-100', color: 'text-green-600' },
      new_course: { icon: '📚', bg: 'bg-blue-100', color: 'text-blue-600' },
      user_registration: { icon: '👤', bg: 'bg-purple-100', color: 'text-purple-600' },
      new_offer: { icon: '🎉', bg: 'bg-yellow-100', color: 'text-yellow-600' },
      new_blog: { icon: '📝', bg: 'bg-indigo-100', color: 'text-indigo-600' },
      job_application: { icon: '💼', bg: 'bg-gray-100', color: 'text-gray-600' },
      enquiry: { icon: '❓', bg: 'bg-orange-100', color: 'text-orange-600' },
      withdrawal_request: { icon: '💰', bg: 'bg-emerald-100', color: 'text-emerald-600' },
    };
    return icons[type] || { icon: '🔔', bg: 'bg-gray-100', color: 'text-gray-600' };
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-[32rem] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <button onClick={onClose} className="hover:text-white/90">&times;</button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex bg-white/20 rounded-lg p-1">
            {['all', 'unread', 'read'].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  filter === f
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={markAllAsRead} className="text-sm text-white/90 hover:text-white">
            Mark all read
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        {isLoading && notificationsList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : notificationsList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications found</div>
        ) : (
          <>
            {notificationsList.map((notification) => {
              const iconData = getNotificationIcon(notification.type);
              const isNew = realtimeNotification?.id === notification._id;

              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer transition-all border-b border-gray-100 ${
                    !notification.isRead ? 'bg-white border-l-4 border-blue-500' : ''
                  } ${isNew ? 'bg-blue-50 animate-pulse' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${iconData.bg} rounded-full flex items-center justify-center`}>
                      <span className="text-lg">{iconData.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="p-4 text-center bg-white border-t">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {isLoading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
