"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast, ToastProvider } from "@/components/ui/toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'notice' | 'event' | 'safety' | 'other';
  is_pinned: boolean;
  author?: {
    nickname: string;
  };
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  notice: '📢 通知',
  event: '🎉 活动',
  safety: '⚠️ 安全',
  other: '📌 其他',
};

function AnnouncementsContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { showToast } = useToast();

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'notice' | 'event' | 'safety' | 'other'>('notice');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('标题和内容不能为空', 'error');
      return;
    }

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          is_pinned: isPinned,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast('公告发布成功！', 'success');
        setShowCreateForm(false);
        setNewTitle('');
        setNewContent('');
        setNewCategory('notice');
        setIsPinned(false);
        fetchAnnouncements();
      } else {
        showToast(result.error || '发布失败', 'error');
      }
    } catch (error: any) {
      showToast(error.message || '发布失败', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">← 返回</Link>
            <h1 className="text-xl font-bold">社区公告</h1>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              📝 {showCreateForm ? '取消发布' : '发布新公告'}
            </Button>
          )}
        </div>
      </header>

      <div className="container py-6">
        {isAdmin && showCreateForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">发布新公告</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">标题</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="请输入公告标题"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">分类</label>
                  <div className="flex gap-2">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setNewCategory(key as any)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newCategory === key
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-primary/10'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">内容</label>
                  <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="min-h-[200px]"
                    placeholder="请输入公告内容"
                    maxLength={2000}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPinned" className="text-sm">置顶此公告</label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreate}>发布</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="pt-6">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.is_pinned && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            📌 置顶
                          </span>
                        )}
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {CATEGORY_LABELS[announcement.category]}
                        </span>
                        <h2 className="text-lg font-semibold hover:text-primary transition-colors">
                          {announcement.title}
                        </h2>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span>发布：{announcement.author?.nickname || '管理员'}</span>
                        <span className="mx-2">•</span>
                        <span>时间：{new Date(announcement.created_at).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedId === announcement.id ? '收起' : '展开'}
                    </Button>
                  </div>

                  {(expandedId === announcement.id || announcement.is_pinned) && (
                    <div className="prose max-w-none pt-4 border-t mt-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold mb-2">暂无公告</h3>
              <p className="text-muted-foreground">有重要公告时会在这里显示</p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-sm">公告订阅和推送功能即将上线...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <ToastProvider>
      <AnnouncementsContent />
    </ToastProvider>
  );
}
