"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider } from "@/components/ui/toast";

interface Conversation {
  user: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  lastMessage: {
    id: string;
    content: string;
    created_at: string;
    from_user_id: string;
  };
  unreadCount: number;
}

function MessagesContentInner() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="text-xl font-bold">← 返回</Link>
          <h1 className="text-xl font-bold">我的消息</h1>
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
        ) : conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Link
                key={conv.user.id}
                href={`/messages/${conv.user.id}`}
                className="block"
              >
                <Card className={conv.unreadCount > 0 ? 'border-primary/20 bg-primary/5' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {conv.user.avatar ? (
                        <img
                          src={conv.user.avatar}
                          alt={conv.user.nickname}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {conv.user.nickname?.[0]?.toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">
                            {conv.user.nickname}
                          </h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {timeAgo(conv.lastMessage.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage.from_user_id === conv.user.id
                            ? conv.lastMessage.content
                            : `你：${conv.lastMessage.content}`}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                            {conv.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">暂无消息</h3>
              <p className="text-muted-foreground">
                有新的私信时会在这里显示
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MessagesContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <MessagesContentInner />
    </Suspense>
  );
}

export default function MessagesPage() {
  return (
    <ToastProvider>
      <MessagesContent />
    </ToastProvider>
  );
}
