"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/post-card";
import { useToast, ToastProvider } from "@/components/ui/toast";

interface SearchResult {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  category?: string;
  created_at: string;
  user?: {
    id: string;
    nickname: string;
    avatar?: string;
  };
}

interface Suggestion {
  suggestions: string[];
  categories: Array<{ id: string; name: string; emoji: string }>;
}

const CATEGORIES = [
  { id: 'all', label: '全部', emoji: '' },
  { id: 'emergency', label: '紧急通知', emoji: '🚨' },
  { id: 'marketplace', label: '二手闲置', emoji: '🏪' },
  { id: 'help', label: '邻里互助', emoji: '🆘' },
  { id: 'event', label: '社区活动', emoji: '🎉' },
  { id: 'pets', label: '宠物交友', emoji: '🐕' },
  { id: 'food', label: '美食分享', emoji: '🍳' },
];

function SearchContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'latest' | 'hottest'>('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'all';
    
    setQuery(q);
    setSelectedCategory(category);
    setPage(1);
    fetchResults(q, category, sortBy, 1);
    fetchSuggestions(q);
  }, [searchParams]);

  const fetchResults = async (q: string, category: string, sort: string, pageNum: number) => {
    if (!q && category === 'all') {
      setResults([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        sort,
      });

      if (q) params.set('q', q);
      if (category !== 'all') params.set('category', category);

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      setResults(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Search error:', error);
      showToast('搜索失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (q: string) => {
    if (!q || q.length < 2) {
      setSuggestions(null);
      return;
    }

    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && selectedCategory === 'all') {
      showToast('请输入搜索内容或选择分类', 'error');
      return;
    }

    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    router.push(`/search?${params}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/search?${params}`);
  };

  const handleSortChange = (sort: 'latest' | 'hottest') => {
    setSortBy(sort);
    fetchResults(query, selectedCategory, sort, page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 头部搜索框 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Link href="/" className="flex items-center text-xl font-bold mr-4">
              ← 返回
            </Link>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索帖子内容..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={100}
            />
            <Button type="submit">搜索</Button>
          </form>

          {/* 搜索建议 */}
          {suggestions && suggestions.suggestions.length > 0 && (
            <div className="mt-2 ml-32 text-sm text-muted-foreground">
              <div className="mb-1">热门搜索：</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.suggestions.slice(0, 5).map((suggestion, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-muted rounded cursor-pointer hover:bg-primary/10"
                    onClick={() => {
                      setQuery(suggestion);
                      const params = new URLSearchParams({ q: suggestion });
                      router.push(`/search?${params}`);
                    }}
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container py-6">
        {/* 分类筛选 */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {category.emoji && <span className="mr-1">{category.emoji}</span>}
              {category.label}
            </button>
          ))}
        </div>

        {/* 排序选项 */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">排序：</span>
          <button
            onClick={() => handleSortChange('latest')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              sortBy === 'latest'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-primary/10'
            }`}
          >
            最新
          </button>
          <button
            onClick={() => handleSortChange('hottest')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              sortBy === 'hottest'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-primary/10'
            }`}
          >
            最热
          </button>
        </div>

        {/* 搜索结果 */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              找到 {total} 条结果
            </div>
            {results.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => {}}
                isLiked={false}
              />
            ))}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPage(page - 1);
                    fetchResults(query, selectedCategory, sortBy, page - 1);
                  }}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <span className="px-4 py-2">
                  第 {page} / {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPage(page + 1);
                    fetchResults(query, selectedCategory, sortBy, page + 1);
                  }}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        ) : query || selectedCategory !== 'all' ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">
                {query ? `未找到"${query}"相关结果` : '暂无内容'}
              </h3>
              <p className="text-muted-foreground">
                {query ? '试试其他关键词或更换分类' : '选择分类或输入关键词开始搜索'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">开始搜索</h3>
              <p className="text-muted-foreground">
                输入关键词或选择分类查找帖子
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SearchContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <SearchContentInner />
    </Suspense>
  );
}

export default function SearchPage() {
  return (
    <ToastProvider>
      <SearchContent />
    </ToastProvider>
  );
}
