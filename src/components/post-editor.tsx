"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import ImageUploader from "./image-uploader";

const CATEGORIES = [
  { id: '', label: '未分类', emoji: '📌' },
  { id: 'emergency', label: '紧急通知', emoji: '🚨' },
  { id: 'marketplace', label: '二手闲置', emoji: '🏪' },
  { id: 'help', label: '邻里互助', emoji: '🆘' },
  { id: 'event', label: '社区活动', emoji: '🎉' },
  { id: 'pets', label: '宠物交友', emoji: '🐕' },
  { id: 'food', label: '美食分享', emoji: '🍳' },
];

interface PostEditorProps {
  postId: string;
  initialContent: string;
  initialImages?: string[];
  initialCategory?: string;
  onCancel: () => void;
  onUpdate: () => void;
}

export default function PostEditor({
  postId,
  initialContent,
  initialImages = [],
  initialCategory = '',
  onCancel,
  onUpdate,
}: PostEditorProps) {
  const { showToast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState(initialImages);
  const [category, setCategory] = useState(initialCategory);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      showToast('内容不能为空', 'error');
      return;
    }

    if (content.length > 1000) {
      showToast('内容不能超过 1000 字', 'error');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('请先登录', 'error');
        return;
      }

      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          images,
          category,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast('帖子已更新', 'success');
        onUpdate();
      } else {
        showToast(result.error || '更新失败', 'error');
      }
    } catch (error: any) {
      console.error('Update post error:', error);
      showToast('更新失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">编辑帖子</h2>

          {/* 分类选择 */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">分类</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10'
                  }`}
                >
                  {cat.emoji && <span className="mr-1">{cat.emoji}</span>}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 内容输入 */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">内容</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
              placeholder="分享你的想法..."
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {content.length}/1000
            </div>
          </div>

          {/* 图片上传 */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">图片</label>
            <ImageUploader
              onImagesChange={setImages}
              maxImages={3}
              maxSizeMB={2}
            />
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`图片 ${index + 1}`}
                    className="rounded-lg aspect-square object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
