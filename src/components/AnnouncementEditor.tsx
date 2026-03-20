"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface AnnouncementEditorProps {
  editingAnnouncement: {
    id: string;
    title: string;
    content: string;
    category: string;
    is_pinned: boolean;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AnnouncementEditor({ editingAnnouncement, onClose, onSuccess }: AnnouncementEditorProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('notice');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title);
      setContent(editingAnnouncement.content);
      setCategory(editingAnnouncement.category);
      setIsPinned(editingAnnouncement.is_pinned);
    } else {
      setTitle('');
      setContent('');
      setCategory('notice');
      setIsPinned(false);
    }
  }, [editingAnnouncement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      showToast('标题和内容不能为空', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingAnnouncement 
        ? `/api/announcements/${editingAnnouncement.id}`
        : '/api/announcements';
      
      const method = editingAnnouncement ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        } as Record<string, string>,
        body: JSON.stringify({
          title,
          content,
          category,
          is_pinned: isPinned,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        showToast(editingAnnouncement ? '公告已更新' : '公告已发布', 'success');
        onSuccess();
        onClose();
      } else {
        showToast(result.error || '操作失败', 'error');
      }
    } catch (error) {
      console.error('Submit announcement error:', error);
      showToast('操作失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">
            {editingAnnouncement ? '✏️ 编辑公告' : '📝 发布新公告'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">标题</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入公告标题"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="notice">📢 通知</option>
                <option value="event">🎉 活动</option>
                <option value="safety">⚠️ 安全</option>
                <option value="other">📌 其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">内容</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入公告内容"
                rows={6}
                maxLength={2000}
                required
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {content.length}/2000
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isPinned" className="text-sm">📌 置顶此公告</label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? '提交中...' : (editingAnnouncement ? '更新' : '发布')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
