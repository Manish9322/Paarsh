import { Bell } from 'lucide-react';

const SimpleNotificationBell = ({ onToggleDropdown, unreadCount = 0 }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-all duration-200"
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

export default SimpleNotificationBell;