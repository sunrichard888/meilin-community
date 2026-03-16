"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PostComposerProps {
  onAddPost: (content: string) => void;
  userNickname?: string;
}

export function PostComposer({ onAddPost, userNickname }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddPost(content);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <Card className="mb-6 p-0 overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {userNickname?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border-0 bg-muted/30 rounded-xl p-3 text-base focus:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-colors"
            placeholder="分享邻里趣事、求助信息、好物推荐... (Ctrl+Enter 发布)"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex items-center justify-between p-3 bg-muted/30">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
            aria-label="添加图片"
            disabled={isSubmitting}
          >
            <span aria-hidden="true">🖼️</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
            aria-label="添加位置"
            disabled={isSubmitting}
          >
            <span aria-hidden="true">📍</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
            aria-label="添加话题"
            disabled={isSubmitting}
          >
            <span aria-hidden="true">#</span>
          </Button>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="rounded-full px-6"
        >
          {isSubmitting ? "发布中..." : "发布"}
        </Button>
      </div>
    </Card>
  );
}
