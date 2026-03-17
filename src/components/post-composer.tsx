"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";

function PostComposerContent() {
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

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
        body: formData,
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

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 输入框 */}
            <Textarea
              value={content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="分享你的想法... (Ctrl+Enter 发布)"
              className="min-h-[120px] resize-y"
              maxLength={1000}
            />

            {/* 字符计数 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>支持 emoji 😊</span>
              <span className={charCount > 900 ? "text-destructive" : ""}>
                {charCount}/1000
              </span>
            </div>

            {/* 图片上传占位 */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                📷 图片上传功能开发中（P2 实现）
              </p>
            </div>

            {/* 发布按钮 */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading || !content.trim()}
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
