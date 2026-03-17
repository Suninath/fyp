import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../rtk/thunk/notificationThunk";

const formatRelativeTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const NotificationBell = ({ className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);

  const { authenticate } = useSelector((state) => state.auth);
  const { items, unreadCount, loading } = useSelector((state) => state.notification);

  useEffect(() => {
    if (!authenticate) {
      return;
    }

    dispatch(fetchUnreadNotificationCount());
  }, [authenticate, dispatch]);

  useEffect(() => {
    if (!open) {
      return;
    }

    dispatch(fetchNotifications({ page: 1, limit: 15 }));
  }, [open, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount]);

  const handleNotificationClick = async (notification) => {
    if (!notification?.isRead) {
      await dispatch(markNotificationRead(notification.id));
    }

    const route = notification?.data?.route;
    if (route) {
      navigate(route);
    }

    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    await dispatch(markAllNotificationsRead());
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-gray-400 hover:text-purple hover:bg-light-bg rounded-lg transition"
        title="Notifications"
      >
        <Bell size={20} />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red text-white text-[10px] leading-[18px] text-center rounded-full font-semibold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[95vw] bg-white border border-gray-200 rounded-xl shadow-xl z-[120] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            </div>
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-purple hover:text-purple-700 inline-flex items-center gap-1"
              disabled={!unreadCount}
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-sm text-gray-500">Loading notifications...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500">No notifications yet.</div>
            ) : (
              items.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-light-bg transition ${
                    notification.isRead ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <span className="text-[11px] text-gray-500 shrink-0">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
