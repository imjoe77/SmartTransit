"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function isMongoId(value) {
  return /^[a-f\d]{24}$/i.test(`${value || ""}`);
}

function formatTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function NotificationBell() {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!active) return;
        setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
      } catch {
        if (!active) return;
      } finally {
        if (active) setLoading(false);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);

    const handleFocus = () => loadNotifications();
    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!dropdownRef.current || dropdownRef.current.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const markVisibleUnreadAsRead = async () => {
    const ids = notifications
      .filter((notification) => !notification.read && isMongoId(notification._id))
      .map((notification) => notification._id);
    if (!ids.length) return;

    setNotifications((current) =>
      current.map((notification) =>
        ids.includes(notification._id) ? { ...notification, read: true } : notification
      )
    );

    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    } catch {
      // Ignore transient failures; next refresh will sync state.
    }
  };

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      await markVisibleUnreadAsRead();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all flex items-center justify-center focus:outline-none"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell size={20} className={cn("transition-transform", open ? "text-emerald-400" : "hover:rotate-12 hover:scale-110")} />
        
        {/* Unread Badge Ping */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 border-2 border-slate-950"></span>
          </span>
        )}
      </button>

      {open ? (
        <div className="absolute right-0 z-[70] mt-2 w-80 rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800/60 pb-2">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {unreadCount > 0 ? (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            ) : null}
          </div>

          <div className="max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Loader2 className="animate-spin mb-2" size={20} />
                <p className="text-sm">Loading alerts...</p>
              </div>
            ) : notifications.length ? (
              notifications.slice(0, 12).map((notification) => (
                <div
                  key={`${notification._id || notification.message}-${notification.timestamp || ""}`}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-2.5 text-sm transition-colors",
                    notification.read ? "hover:bg-slate-900/50" : "bg-slate-800/40 hover:bg-slate-800/60"
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <div className={cn(
                      "flex h-2 w-2 rounded-full mt-1", 
                      notification.read ? "bg-transparent" : "bg-rose-500"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 leading-snug">{notification.message}</p>
                    <p className="mt-1 text-[10px] font-medium text-slate-500">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center px-4">
                <Bell size={28} className="mb-3 text-slate-700" />
                <p className="text-sm text-slate-400 font-medium">All caught up!</p>
                <p className="text-xs mt-1">Check back later for new alerts.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
