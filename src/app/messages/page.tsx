"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_nickname: string;
  other_user_avatar?: string;
  unread_count: number;
  last_message_content?: string;
}

function MessagesContent() {
  const { getToken } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/messages/rooms?limit=50', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setConversations(result.data || []);
      }
    } catch (error) {
      console.error('加载会话失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">消息</h1>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* 左侧：会话列表 */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-4">
                {/* 搜索框 */}
                <div className="mb-4">
                  <Input placeholder="搜索消息..." />
                </div>

                {/* 会话列表 */}
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    加载中...
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedRoom(conv.id)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {conv.other_user_avatar ? (
                              <img src={conv.other_user_avatar} alt={conv.other_user_nickname} className="w-full h-full object-cover" />
                            ) : (
                              conv.other_user_nickname?.[0]?.toUpperCase() || '?'
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm truncate">
                              {conv.other_user_nickname || '匿名用户'}
                            </span>
                            {conv.unread_count > 0 && (
                              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                {conv.unread_count > 99 ? '99+' : conv.unread_count}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {conv.last_message_content || '暂无消息'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-sm">暂无消息</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：聊天窗口 */}
          <div className="md:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="pt-4 h-full flex flex-col">
                {selectedRoom ? (
                  <>
                    {/* 聊天头部 */}
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          ?
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">聊天中</div>
                        <div className="text-xs text-muted-foreground">
                          实时消息
                        </div>
                      </div>
                    </div>

                    {/* 聊天区域 */}
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-lg font-semibold mb-2">聊天功能开发中</h3>
                        <p className="text-sm">
                          消息历史记录和实时聊天功能即将上线
                        </p>
                      </div>
                    </div>

                    {/* 输入框 */}
                    <div className="pt-4 border-t">
                      <div className="flex gap-2">
                        <Input placeholder="输入消息..." disabled />
                        <Button disabled>
                          发送
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* 空状态 */
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💬</div>
                      <h3 className="text-lg font-semibold mb-2">开始聊天</h3>
                      <p className="text-sm">
                        从左侧选择一个会话，或者搜索邻居开始聊天
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
