'use client';

import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../context/ScoketContext'; // Adjust path as needed
import { Bell } from 'lucide-react';

const NotificationBell = ({ onToggleDropdown, unreadCount }) => {
  const [animateBell, setAnimateBell] = useState(false);
  const socketContext = useContext(SocketContext);
  const { socket, realtimeNotification } = socketContext || {};

  useEffect(() => {
    console.log('NotificationBell - SocketContext:', socketContext);
    console.log('NotificationBell - Socket:', socket);
    console.log('NotificationBell - UnreadCount:', unreadCount);
  }, [socketContext, socket, unreadCount]);

  // Handle real-time notifications from SocketContext
  useEffect(() => {
    if (!realtimeNotification) return;

    console.log('📥 Processing real-time notification:', realtimeNotification);
    
    // Animate bell
    setAnimateBell(true);
    const timeout = setTimeout(() => setAnimateBell(false), 1000);

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(getNotificationTitle(realtimeNotification.type), {
        body: realtimeNotification.message,
        icon: '/icon-192x192.png',
        tag: `notification-${realtimeNotification.id}`,
        requireInteraction: false,
      });
    }

    // Play notification sound
    playNotificationSound();

    return () => clearTimeout(timeout);
  }, [realtimeNotification]);

  const playNotificationSound = () => {
    try {
      // Create audio element for notification sound
      const audio = new Audio('/sounds/notification.mp3'); // Add your sound file to public/sounds/
      audio.volume = 0.5; // Adjust volume (0.0 to 1.0)
      audio.play().catch(error => {
        console.log('Could not play notification sound:', error);
        // Fallback: Use default system sound
        if ('vibrate' in navigator) {
          navigator.vibrate(200); // Vibrate for 200ms on mobile devices
        }
      });
    } catch (error) {
      console.log('Error playing notification sound:', error);
    }
  };

  const getNotificationTitle = (type) => {
    const titles = {
      course_purchase: '🎓 Course Purchase',
      new_course: '📚 New Course',
      user_registration: '👤 New User',
      new_offer: '🎉 Special Offer',
      new_blog: '📝 New Blog',
      job_application: '💼 Job Application',
      enquiry: '❓ Enquiry',
      withdrawal_request: '💰 Withdrawal',
    };
    return titles[type] || '🔔 Notification';
  };

  return (
    <div className="relative">
      <button
        onClick={onToggleDropdown}
        className={`relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-all duration-200 ${
          animateBell ? 'animate-bounce' : ''
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
      </button>
    </div>
  );
};

export default NotificationBell;