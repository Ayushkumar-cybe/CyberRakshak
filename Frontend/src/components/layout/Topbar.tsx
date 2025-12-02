import React, { useState, useEffect } from "react";
import { Bell, Sun, Moon, User } from "lucide-react";
import { getNotifications, markNotificationRead } from "../../services/api";
import type { Notification } from "../../services/api";


const Topbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Poll for notifications
  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (id: string) => {
    try {
      await markNotificationRead(id);
      // Update local state to reflect read status
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification read", error);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Branding (if Sidebar collapsed) or Breadcrumbs */}
      <div className="font-bold text-lg text-slate-700 dark:text-white">
        Dashboard
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 relative"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-3 border-b dark:border-slate-700 font-semibold text-sm flex justify-between">
                <span>Notifications</span>
                <span className="text-xs text-slate-500">{unreadCount} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-center opacity-60">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id)}
                      className={`p-3 border-b dark:border-slate-800 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition ${!n.is_read ? "bg-blue-50 dark:bg-slate-800/50" : ""}`}
                    >
                      <p className={`font-semibold ${n.type === 'error' ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {n.title}
                      </p>
                      <p className="opacity-70 text-xs mt-1">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 text-right">
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l dark:border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight">Admin</p>
            <p className="text-xs opacity-60">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
