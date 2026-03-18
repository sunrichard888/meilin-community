"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SearchSuggestion {
  type: string;
  id: string;
  text: string;
  extra_info?: string;
}

export default function SearchBar({ placeholder = "搜索帖子、用户..." }: { placeholder?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 加载搜索建议
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`);
          const result = await response.json();
          
          if (response.ok && result.success) {
            setSuggestions(result.data || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('加载搜索建议失败:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'post') {
      router.push(`/posts/${suggestion.id}`);
    } else if (suggestion.type === 'user') {
      router.push(`/users/${suggestion.id}`);
    }
    setShowSuggestions(false);
  };

  const getIcon = (type: string) => {
    return type === 'post' ? '📝' : '👤';
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="pr-12"
        />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
        >
          🔍
        </Button>
      </form>

      {/* 搜索建议 */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <>
          {/* 点击外部关闭 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowSuggestions(false)}
          />
          <Card className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto z-50 shadow-lg border-primary/10 animate-scale-in">
            {loading ? (
              <div className="py-4 text-center text-muted-foreground text-sm">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                搜索中...
              </div>
            ) : (
              <div className="divide-y">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">{getIcon(suggestion.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.extra_info && (
                        <div className="text-xs text-muted-foreground">
                          {suggestion.extra_info}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.type === 'post' ? '帖子' : '用户'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
