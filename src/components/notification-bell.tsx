"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import NotificationPanel from "./notification-panel";

export default function NotificationBell() {
  const { user, getToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 加载未读数
  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const token = await getToken();
      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUnreadCount(result.count);
      }
    } catch (error) {
      console.error('加载未读数失败:', error);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    
    // 定时刷新（30 秒）
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/notifications/unread-count', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleNotificationClick = () => {
    setPanelOpen(!panelOpen);
    if (!panelOpen) {
      // 打开面板时标记为已读
      handleMarkAllRead();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleNotificationClick}
        aria-label="通知"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* 通知面板 */}
      {panelOpen && (
        <>
          {/* 点击外部关闭 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setPanelOpen(false)}
          />
          <NotificationPanel 
            onClose={() => setPanelOpen(false)}
            onMarkAllRead={handleMarkAllRead}
            onNotificationRead={() => {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }}
          />
        </>
      )}
    </div>
  );
}
