"use client";

import { useState, useEffect } from "react";
import { PostData } from "@/actions/posts";
import PostCard from "@/components/post-card";

interface PostListProps {
  initialPosts: PostData[];
}

export default function PostList({ initialPosts }: PostListProps) {
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [filter, setFilter] = useState<"all" | "my_community">("all");

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // 过滤帖子
  const filteredPosts = filter === "all" 
    ? posts 
    : posts.filter(post => post.community_name);

  return (
    <div className="space-y-4">
      {/* 过滤选项 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          全部帖子
        </button>
        <button
          onClick={() => setFilter("my_community")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === "my_community"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          本小区
        </button>
      </div>

      {/* 帖子列表 */}
      {filteredPosts.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ filter }: { filter: "all" | "my_community" }) {
  if (filter === "my_community") {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🏘️</div>
        <h3 className="text-lg font-semibold mb-2">暂无本小区帖子</h3>
        <p className="text-muted-foreground">
          成为第一个发帖的人吧！
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">📝</div>
      <h3 className="text-lg font-semibold mb-2">还没有帖子</h3>
      <p className="text-muted-foreground">
        发布第一条社区动态吧！
      </p>
    </div>
  );
}
