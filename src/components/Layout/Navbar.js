"use client";

import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/slices/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTheme } from "next-themes";
import { useState, useEffect, useContext, useRef } from "react";
import { FiSun, FiMoon, FiBell, FiSearch, FiLogOut, FiX, FiCheck, FiCheckCircle, FiFilter, FiVolume2, FiVolumeX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useFetchAdminNotificationsQuery,
  useMarkAdminNotificationAsReadMutation,
  useFetchAdminUnreadNotificationCountQuery,
} from '@/services/api';
import { SocketContext } from '../../context/ScoketContext';
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef(null);
  const audioRef = useRef(null);

  // Socket context
  const socketContext = useContext(SocketContext);
  const { socket, isConnected, user } = socketContext || {};

  // Fetch unread notification count
  const { data: unreadCountData, refetch: refetchUnreadCount } =
    useFetchAdminUnreadNotificationCountQuery(undefined, {
      skip: !user,
    });

  const unreadCount = unreadCountData?.data?.unreadCount || 0;

  // Fetch notifications
  const { data, isLoading, refetch } = useFetchAdminNotificationsQuery(
    {
      page: currentPage,
      limit: 10,
      ...(filter !== 'all' && { isRead: filter === 'read' ? true : false }),
    },
    { skip: !notificationOpen }
  );

  const notifications = data?.data?.notifications || [];
  const hasMore = data?.data?.pagination?.hasNextPage || false;

  // Mark notification as read mutation
  const [markNotificationAsRead] = useMarkAdminNotificationAsReadMutation();

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // Handle new socket notification
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification) => {
      setAnimateBell(true);
      refetchUnreadCount();
      playNotificationSound();

      if (Notification.permission === 'granted') {
        new Notification(getNotificationTitle(notification.type), {
          body: notification.message,
          icon: '/icon-192x192.png',
          tag: `notification-${notification.id}`,
          requireInteraction: false,
        });
      }

      const timeout = setTimeout(() => setAnimateBell(false), 1000);
      return () => clearTimeout(timeout);
    };

    socket.on('new_notification', handleNotification);
    return () => socket.off('new_notification', handleNotification);
  }, [socket, refetchUnreadCount, soundEnabled]);

  // Refetch on tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchUnreadCount]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen]);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    router.push("/");
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    handleLogout();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
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

  const getNotificationIcon = (type) => {
    const icons = {
      course_purchase: '🎓',
      new_course: '📚',
      user_registration: '👤',
      new_offer: '🎉',
      new_blog: '📝',
      job_application: '💼',
      enquiry: '❓',
      withdrawal_request: '💰',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      course_purchase: 'bg-green-500',
      new_course: 'bg-blue-500',
      user_registration: 'bg-purple-500',
      new_offer: 'bg-orange-500',
      new_blog: 'bg-indigo-500',
      job_application: 'bg-teal-500',
      enquiry: 'bg-pink-500',
      withdrawal_request: 'bg-yellow-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId).unwrap();
      refetchUnreadCount();
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markNotificationAsRead({ markAll: true }).unwrap();
      refetchUnreadCount();
      refetch();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    if (notification.link) {
      window.location.href = notification.link;
    }

    setNotificationOpen(false);
  };

  // Hide on sign-in page
  if (pathname === "/admin/signin") return null;
  if (!mounted) return null;

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-4 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80 md:px-6">
      {/* Logo/Brand */}
      <div className="flex items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <div className="w-60 max-w-full px-4 xl:mr-12">
            <Link
              href="/"
              className="header-logo block w-full transition-transform duration-300 hover:scale-110"
            >
              <Image
                src="/images/logo/LOGO_DARK.png"
                alt="logo"
                width={140}
                height={30}
                className="w-full dark:hidden"
              />
              <Image
                src="/images/logo/LOGO_LIGHT.png"
                alt="logo"
                width={140}
                height={30}
                className="hidden w-full dark:block"
              />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Search Bar - Hidden on mobile */}
      <div className="hidden md:block relative mx-4 flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full border border-gray-300 bg-gray-50/80 backdrop-bulr-sm py-1.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-200 dark:placeholder-gray-400 transition-all duration-200"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-1 md:space-x-3">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? 
            <FiSun size={20} className="text-amber-400" /> : 
            <FiMoon size={20} className="text-blue-600" />
          }
        </motion.button>

        {/* Enhanced Notifications */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={`relative rounded-full p-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 ${
              animateBell ? 'animate-bounce' : ''
            }`}
            aria-label="Notifications"
          >
            <motion.div
              animate={animateBell ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              <FiBell size={20} />
            </motion.div>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-1 text-xs font-bold text-white shadow-lg"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
            <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white shadow-sm ${isConnected ? 'bg-green-400' : 'bg-red-400'} dark:border-gray-800`}></span>
          </motion.button>

          {/* Enhanced Notification Dropdown */}
          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 flex w-96 max-h-[32rem] flex-col rounded-2xl border border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-gray-700/50 dark:bg-gray-900/95"
              >
                {/* Enhanced Header */}
                <div className="border-b border-gray-200/50 p-4 dark:border-gray-700/50">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-2">
                        <FiBell className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleSound}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        aria-label="Toggle sound"
                      >
                        {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNotificationOpen(false)}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      >
                        <FiX size={16} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FiFilter className="h-4 w-4 text-gray-400" />
                      <div className="flex space-x-1">
                        {['all', 'unread', 'read'].map((option) => (
                          <motion.button
                            key={option}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setFilter(option);
                              setCurrentPage(1);
                            }}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                              filter === option
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {unreadCount > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={markAllAsRead}
                        className="flex items-center space-x-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      >
                        <FiCheckCircle size={14} />
                        <span>Mark all read</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Enhanced Notifications List */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence>
                    {isLoading && notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent"
                        />
                        <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 text-center"
                      >
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <FiBell className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">No notifications</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">You are all caught up!</p>
                      </motion.div>
                    ) : (
                      <>
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            onClick={() => handleNotificationClick(notification)}
                            className={`group relative cursor-pointer border-b border-gray-100/50 p-4 transition-all duration-200 hover:bg-gray-50/50 dark:border-gray-700/50 dark:hover:bg-gray-8
00/50 ${
                              !notification.isRead ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="relative flex-shrink-0">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getNotificationColor(notification.type)} text-white shadow-lg`}>
                                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                </div>
                                {!notification.isRead && (
                                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></div>
                                )}
                              </div>
                              
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className={`text-sm font-medium ${
                                      notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                      {getNotificationTitle(notification.type).replace(/^\S+\s/, '')}
                                    </h5>
                                    <p className={`mt-1 text-sm ${
                                      notification.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                      {notification.message}
                                    </p>
                                  </div>
                                  
                                  {!notification.isRead && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification._id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-all duration-200"
                                    >
                                      <FiCheck size={12} />
                                    </motion.button>
                                  )}
                                </div>
                                
                                <div className="mt-2 flex items-center justify-between">
                                  <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </p>
                                  {notification.isRead && (
                                    <FiCheckCircle className="h-3 w-3 text-green-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {hasMore && (
                          <div className="p-4 text-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={loadMore}
                              disabled={isLoading}
                              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              {isLoading ? 'Loading...' : 'Load More'}
                            </motion.button>
                          </div>
                        )}
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogoutClick}
          className="flex items-center space-x-2 rounded-full border border-gray-200 bg-gray-50/80 backdrop-blur-sm px-3 py-1.5 text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:shadow-md dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700/80 shadow-sm"
          aria-label="Logout"
        >
          <FiLogOut size={16} />
          <span className="hidden text-sm font-medium sm:block">Logout</span>
        </motion.button>
      </div>

      {/* Connection Status (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`fixed bottom-4 right-4 rounded-full px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm ${
            isConnected ? 'bg-green-500/90' : 'bg-red-500/90'
          }`}
        >
          <div className="flex items-center space-x-1">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-200' : 'bg-red-200'} animate-pulse`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </motion.div>
      )}

      {/* Enhanced Logout Confirmation Dialog */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 dark:text-white border-gray-200/50 dark:border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300">
              Confirm Logout
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30"
            >
              <FiLogOut className="h-8 w-8 text-red-500 dark:text-red-400" />
            </motion.div>
            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Ready to leave?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to log out of your account?
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
              className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutConfirm}
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audio element for notification sound */}
      <audio ref={audioRef} preload="auto" style={{ display: 'none' }}>
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
      </audio>
    </nav>
  );
};

export default Navbar;