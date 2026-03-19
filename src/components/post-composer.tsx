"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";
import EmojiPicker from "@/components/emoji-picker";
import ImageUploader from "@/components/image-uploader";

function PostComposerContent() {
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      showToast("内容不能为空", "error");
      return;
    }

    if (content.length > 1000) {
      showToast("内容不能超过 1000 字", "error");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        showToast("请先登录", "error");
        setLoading(false);
        return;
      }

      // 使用 FormData 提交到 API
      const formData = new FormData();
      formData.append('content', content);
      formData.append('token', token);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          content,
          images: imageUrls,
          category: selectedCategory || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast("发布成功！", "success");
        setContent("");
        setCharCount(0);
        
        // 刷新页面显示新帖子
        window.location.reload();
      } else {
        showToast(result.error || "发布失败", "error");
      }
    } catch (error: any) {
      showToast(error.message || "发布失败", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter 或 Cmd+Enter 快速发布
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setCharCount(value.length);
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const handleImagesChange = (urls: string[]) => {
    setImageUrls(urls);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 分类选择器 */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === ""
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10'
                }`}
              >
                未分类
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("emergency")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === "emergency"
                    ? 'bg-red-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600'
                }`}
              >
                🚨 紧急通知
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("marketplace")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === "marketplace"
                    ? 'bg-orange-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                🏪 二手闲置
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("help")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === "help"
                    ? 'bg-blue-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                🆘 邻里互助
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("event")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === "event"
                    ? 'bg-purple-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                🎉 社区活动
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("pets")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === "pets"
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-600'
                }`}
              >
                🐕 宠物交友
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("food")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === "food"
                    ? 'bg-pink-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                🍳 美食分享
              </button>
            </div>

            {/* 输入框 */}
            <Textarea
              value={content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="分享你的想法... (Ctrl+Enter 发布)"
              className="min-h-[120px] resize-y"
              maxLength={1000}
            />

            {/* 控制栏：表情 + 图片 + 字符计数 */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              {/* 左侧：表情和图片控制 */}
              <div className="flex items-center gap-1">
                <EmojiPicker onSelect={handleEmojiSelect} />
                <ImageUploader onImagesChange={handleImagesChange} maxImages={3} maxSizeMB={2} />
              </div>

              {/* 右侧：字符计数 */}
              <span className={`text-sm ${charCount > 900 ? "text-destructive" : "text-muted-foreground"}`}>
                {charCount}/1000
              </span>
            </div>

            {/* 发布按钮 */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading || !content.trim() || (imageUrls.length > 0 && imageUrls.some(url => !url))}
                className="w-full sm:w-auto"
              >
                {loading ? "发布中..." : "发布"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PostComposer() {
  return (
    <ToastProvider>
      <PostComposerContent />
    </ToastProvider>
  );
}

// 兼容旧代码的命名导出（P2 移除）
export { PostComposerContent as PostComposer };
