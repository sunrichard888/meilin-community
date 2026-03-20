"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { AnnouncementEditor } from "@/components/AnnouncementEditor";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
  author?: {
    nickname: string;
  };
}

function AnnouncementManagementInner() {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch('/api/announcements', { headers: headers as Record<string, string> });
      const data = await res.json();

      if (res.ok) {
        setAnnouncements(data || []);
      }
    } catch (error) {
      console.error('Fetch announcements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个公告吗？')) return;

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        } as Record<string, string>,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast('公告已删除', 'success');
        fetchAnnouncements();
      } else {
        showToast(result.error || '删除失败', 'error');
      }
    } catch (error) {
      console.error('Delete announcement error:', error);
      showToast('删除失败', 'error');
    }
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        } as Record<string, string>,
        body: JSON.stringify({ is_pinned: !isPinned }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast(isPinned ? '已取消置顶' : '已置顶', 'success');
        fetchAnnouncements();
      } else {
        showToast(result.error || '操作失败', 'error');
      }
    } catch (error) {
      console.error('Toggle pin error:', error);
      showToast('操作失败', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">← 返回</Link>
            <h1 className="text-xl font-bold">📢 公告管理</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary">
              仪表盘
            </Link>
            <Link href="/admin/users" className="text-sm font-medium hover:text-primary">
              用户管理
            </Link>
            <Link href="/admin/moderation" className="text-sm font-medium hover:text-primary">
              内容审核
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex justify-end mb-6">
          <Button onClick={() => {
            setEditingAnnouncement(null);
            setShowEditor(true);
          }}>
            📝 发布新公告
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        {announcement.is_pinned && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            📌 置顶
                          </span>
                        )}
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {announcement.category === 'notice' ? '📢 通知' :
                           announcement.category === 'event' ? '🎉 活动' :
                           announcement.category === 'safety' ? '⚠️ 安全' :
                           '📌 其他'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePin(announcement.id, announcement.is_pinned)}
                        >
                          {announcement.is_pinned ? '取消置顶' : '置顶'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAnnouncement(announcement);
                            setShowEditor(true);
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      发布：{announcement.author?.nickname || '管理员'} · 
                      时间：{new Date(announcement.created_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-muted-foreground">暂无公告</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 公告编辑器 */}
      {showEditor && (
        <AnnouncementEditor
          editingAnnouncement={editingAnnouncement}
          onClose={() => {
            setShowEditor(false);
            setEditingAnnouncement(null);
          }}
          onSuccess={fetchAnnouncements}
        />
      )}
    </div>
  );
}

function AnnouncementManagement() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <AnnouncementManagementInner />
    </Suspense>
  );
}

export default function AnnouncementManagementPage() {
  return (
    <ToastProvider>
      <AnnouncementManagement />
    </ToastProvider>
  );
}
