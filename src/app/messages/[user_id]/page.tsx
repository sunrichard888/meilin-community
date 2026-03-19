"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider, useToast } from "@/components/ui/toast";

interface Message {
  id: string;
  content: string;
  from_user_id: string;
  created_at: string;
  from_user?: {
    id: string;
    nickname: string;
    avatar?: string;
  };
}

interface User {
  id: string;
  nickname: string;
  avatar?: string;
}

function ChatContentInner() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const otherUserId = params.user_id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (otherUserId) {
      fetchMessages();
    }
  }, [otherUserId]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('请先登录', 'error');
        router.push('/login');
        return;
      }

      const messagesRes = await fetch(`/api/messages/${otherUserId}?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const messagesData = await messagesRes.json();
      setMessages(messagesData.messages || []);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      showToast('消息不能为空', 'error');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to_user_id: otherUserId,
          content: newMessage.trim(),
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setNewMessage('');
        fetchMessages();
      } else {
        showToast(result.error || '发送失败', 'error');
      }
    } catch (error) {
      console.error('Send message error:', error);
      showToast('发送失败', 'error');
    } finally {
      setSending(false);
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/messages" className="text-xl font-bold">← 返回</Link>
          <div className="flex items-center gap-3">
            {otherUser?.avatar ? (
              <img
                src={otherUser.avatar}
                alt={otherUser.nickname}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {otherUser?.nickname?.[0]?.toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold">{otherUser?.nickname || '加载中...'}</h1>
          </div>
        </div>
      </header>

      <div className="container flex-1 py-6 flex flex-col">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg) => {
              const isMe = msg.from_user_id === localStorage.getItem('user_id');
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {timeAgo(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-muted-foreground">暂无消息，打个招呼吧~</p>
            </CardContent>
          </Card>
        )}

        {/* 输入框 */}
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 min-h-[50px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            className="self-end"
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <ChatContentInner />
    </Suspense>
  );
}

export default function ChatPage() {
  return (
    <ToastProvider>
      <ChatContent />
    </ToastProvider>
  );
}
