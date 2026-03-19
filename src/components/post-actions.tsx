"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import PostEditor from "./post-editor";

interface PostActionsProps {
  postId: string;
  postContent: string;
  postImages?: string[];
  postCategory?: string;
  isOwner: boolean;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export default function PostActions({
  postId,
  postContent,
  postImages = [],
  postCategory,
  isOwner,
  onDelete,
  onUpdate,
}: PostActionsProps) {
  const { showToast } = useToast();
  const [showEditor, setShowEditor] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (!confirm('确定要删除这个帖子吗？删除后无法恢复。')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('请先登录', 'error');
        return;
      }

      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast('帖子已删除', 'success');
        onDelete?.();
      } else {
        showToast(result.error || '删除失败', 'error');
      }
    } catch (error: any) {
      console.error('Delete post error:', error);
      showToast('删除失败', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setShowEditor(true);
  };

  const handleUpdate = () => {
    onUpdate?.();
    setShowEditor(false);
  };

  if (!isOwner) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setShowMenu(!showMenu)}
        >
          ⋮
        </Button>
        
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-8 z-20 bg-background border rounded-lg shadow-lg py-2 w-32">
              <button
                onClick={() => {
                  handleEdit();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
              >
                ✏️ 编辑
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}
                disabled={deleting}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors text-red-600 disabled:opacity-50"
              >
                🗑️ 删除
              </button>
            </div>
          </>
        )}
      </div>

      {showEditor && (
        <PostEditor
          postId={postId}
          initialContent={postContent}
          initialImages={postImages}
          initialCategory={postCategory}
          onCancel={() => setShowEditor(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}
