"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast, ToastProvider } from "@/components/ui/toast";

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  read: boolean;
  created_at: string;
  actor?: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  post?: {
    id: string;
    content: string;
  };
  comment?: {
    id: string;
    content: string;
  };
}

function NotificationsContentInner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('请先登录', 'error');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filter === 'unread' && { unread: 'true' }),
      });

      const res = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications || []);
        setTotalPages(data.totalPages || 0);
      } else {
        showToast(data.error || '获取通知失败', 'error');
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      showToast('获取通知失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          notification_id: notificationId,
          mark_all_read: !notificationId,
        }),
      });

      if (res.ok) {
        fetchNotifications();
        showToast(notificationId ? '已标记为已读' : '全部标记为已读', 'success');
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'system': return '📢';
      default: return '🔔';
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const actorName = notification.actor?.nickname || '某人';
    
    switch (notification.type) {
      case 'like':
        return `${actorName} 点赞了你的帖子`;
      case 'comment':
        return `${actorName} 评论了你的帖子`;
      case 'follow':
        return `${actorName} 关注了你`;
      case 'system':
        return notification.post?.content || '系统通知';
      default:
        return '新通知';
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.post?.id) {
      return `/posts/${notification.post.id}`;
    }
    if (notification.actor?.id) {
      return `/users/${notification.actor.id}`;
    }
    return '/notifications';
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">← 返回</Link>
            <h1 className="text-xl font-bold">我的通知</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            >
              {filter === 'all' ? '只看未读' : '查看全部'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkAsRead()}
            >
              全部已读
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={getNotificationLink(notification)}
                className={`block transition-colors ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <Card className={!notification.read ? 'border-primary/20' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* 头像 */}
                      {notification.actor?.avatar ? (
                        <img
                          src={notification.actor.avatar}
                          alt={notification.actor.nickname}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {notification.actor?.nickname?.[0]?.toUpperCase() || '🔔'}
                        </div>
                      )}

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <span className={`text-sm ${!notification.read ? 'font-semibold text-primary' : ''}`}>
                            {getNotificationMessage(notification)}
                          </span>
                        </div>
                        
                        {notification.comment?.content && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            "{notification.comment.content}"
                          </div>
                        )}
                        
                        {notification.post?.content && !notification.comment && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            "{notification.post.content}"
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-2">
                          {timeAgo(notification.created_at)}
                        </div>
                      </div>

                      {/* 未读标记 */}
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <span className="px-4 py-2">
                  第 {page} / {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'unread' ? '没有未读通知' : '暂无通知'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'unread' ? '所有通知都已读' : '有新的互动时会在这里显示'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function NotificationsContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <NotificationsContentInner />
    </Suspense>
  );
}

export default function NotificationsPage() {
  return (
    <ToastProvider>
      <NotificationsContent />
    </ToastProvider>
  );
}
