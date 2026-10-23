import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  X,
  Volume2,
  Check,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { CustomerNotification, User } from '../types';
import {
  getStoredNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  requestBrowserNotificationPermission,
  syncNotificationsFromSupabase,
} from '../services/storage';
import { subscribeToLiveNotifications } from '../services/supabase';

interface NotificationBellProps {
  user: User | null;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ user, onSelectOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [browserPermission, setBrowserPermission] = useState<string>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load and subscribe to notifications
  useEffect(() => {
    const studentId = user?.role === 'student' ? user.studentId : undefined;

    // Check browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }

    const loadNotifications = () => {
      const all = getStoredNotifications();
      // If user is a student, prioritize their notifications or broadcast alerts
      const filtered = user?.role === 'student'
        ? all.filter((n) => !n.studentId || n.studentId === user.studentId || n.studentId === user.id)
        : all;
      setNotifications(filtered);
    };

    loadNotifications();
    syncNotificationsFromSupabase(studentId).then((remote) => {
      if (remote) {
        loadNotifications();
      }
    });

    const handleUpdate = () => loadNotifications();
    window.addEventListener('xeroxic_notifications_updated', handleUpdate);

    // Supabase Realtime subscription
    const unsubscribe = subscribeToLiveNotifications(studentId, () => {
      loadNotifications();
    });

    return () => {
      window.removeEventListener('xeroxic_notifications_updated', handleUpdate);
      unsubscribe();
    };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleEnableBrowserNotifications = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      setBrowserPermission('granted');
    } else {
      setBrowserPermission(Notification.permission);
    }
  };

  const handleMarkAllRead = () => {
    const studentId = user?.role === 'student' ? user.studentId : undefined;
    markAllNotificationsRead(studentId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: CustomerNotification) => {
    if (!notif.isRead) {
      markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    if (onSelectOrder && notif.orderId) {
      onSelectOrder(notif.orderId);
      setIsOpen(false);
    }
  };

  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: CustomerNotification['type']) => {
    switch (type) {
      case 'printer_unavailable':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'delay_update':
        return <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case 'printer_restored':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'order_reassigned':
        return <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-espresso dark:text-white" />;
    }
  };

  const getBorderColor = (type: CustomerNotification['type'], isRead: boolean) => {
    if (isRead) return 'border-transparent bg-transparent hover:bg-bone/40 dark:hover:bg-white/5';
    switch (type) {
      case 'printer_unavailable':
        return 'border-amber-400/40 bg-amber-50/60 dark:bg-amber-950/20';
      case 'delay_update':
        return 'border-orange-400/40 bg-orange-50/60 dark:bg-orange-950/20';
      case 'printer_restored':
        return 'border-emerald-400/40 bg-emerald-50/60 dark:bg-emerald-950/20';
      case 'order_reassigned':
        return 'border-blue-400/40 bg-blue-50/60 dark:bg-blue-950/20';
      default:
        return 'border-transparent bg-bone/30 dark:bg-white/5';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Printer & Order Alerts"
        className="relative p-2 text-on-surface-variant dark:text-[#a1a1aa] hover:text-espresso dark:hover:text-white hover:bg-bone dark:hover:bg-[#282b33] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-espresso/20 dark:focus:ring-white/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1e2025] rounded-2xl shadow-2xl border border-bone/80 dark:border-white/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-bone/60 dark:border-white/10 flex items-center justify-between bg-paper-white/50 dark:bg-[#16181d]/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-espresso dark:text-white">
                Live Customer Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-on-surface-variant hover:text-espresso dark:text-gray-400 dark:hover:text-white px-2 py-1 rounded hover:bg-bone/60 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <Check className="w-3 h-3" />
                  Mark read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-bone/60 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional Browser Notification Permission Prompt */}
          {browserPermission !== 'granted' && (
            <div className="px-3.5 py-2.5 bg-espresso/5 dark:bg-white/5 border-b border-bone/40 dark:border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-on-surface-variant dark:text-gray-300">
                <Volume2 className="w-3.5 h-3.5 text-espresso dark:text-white shrink-0" />
                <span>Get sound & push alerts for printer delays</span>
              </div>
              <button
                onClick={handleEnableBrowserNotifications}
                className="px-2.5 py-1 text-[11px] font-medium bg-espresso text-white dark:bg-white dark:text-black rounded-full hover:opacity-90 transition-opacity shrink-0 ml-2"
              >
                Enable
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="px-4 py-2 border-b border-bone/40 dark:border-white/5 flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-espresso text-white dark:bg-white dark:text-black'
                  : 'text-on-surface-variant dark:text-gray-400 hover:bg-bone dark:hover:bg-white/5'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-espresso text-white dark:bg-white dark:text-black'
                  : 'text-on-surface-variant dark:text-gray-400 hover:bg-bone dark:hover:bg-white/5'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-bone/40 dark:divide-white/5">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No alerts at this moment</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You will receive real-time notifications if your assigned printer experiences a jam, runs out of paper, or recovers.
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 border-l-4 transition-colors cursor-pointer ${getBorderColor(
                    notif.type,
                    notif.isRead
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-white dark:bg-black/30 shadow-xs shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-espresso dark:text-white truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatTimestamp(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant dark:text-gray-300 leading-relaxed mb-2">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        {notif.orderId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-bone dark:bg-white/10 text-espresso dark:text-gray-200">
                            Order #{notif.orderId}
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </span>
                        )}

                        {notif.printerName && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            {notif.printerName}
                          </span>
                        )}

                        {(notif.estimatedDelay || notif.estimatedRecovery) && (
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-medium">
                            ETA: {notif.estimatedDelay || notif.estimatedRecovery}
                          </span>
                        )}

                        {!notif.isRead && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-paper-white/50 dark:bg-[#16181d]/50 border-t border-bone/60 dark:border-white/10 text-center text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected to Xeroxic Fleet Telemetry</span>
          </div>
        </div>
      )}
    </div>
  );
};
