"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider, useToast } from "@/components/ui/toast";

interface Report {
  id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  post?: {
    id: string;
    content: string;
  };
  reporter?: {
    nickname: string;
  };
  reported_user?: {
    nickname: string;
  };
}

function ModerationInner() {
  const { showToast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'rejected'>('pending');

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`/api/admin/reports?status=${filterStatus}`, { headers: headers as Record<string, string> });
      const data = await res.json();

      if (res.ok) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string, action: 'delete' | 'ignore') => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        } as Record<string, string>,
        body: JSON.stringify({ action }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast(action === 'delete' ? '已删除帖子' : '已忽略举报', 'success');
        fetchReports();
      } else {
        showToast(result.error || '操作失败', 'error');
      }
    } catch (error) {
      console.error('Resolve report error:', error);
      showToast('操作失败', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">← 返回</Link>
            <h1 className="text-xl font-bold">⚠️ 内容审核</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary">
              仪表盘
            </Link>
            <Link href="/admin/users" className="text-sm font-medium hover:text-primary">
              用户管理
            </Link>
            <Link href="/admin/announcements" className="text-sm font-medium hover:text-primary">
              公告管理
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-6">
        {/* 筛选栏 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10'
                }`}
              >
                待处理
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'resolved'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10'
                }`}
              >
                已处理
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10'
                }`}
              >
                已拒绝
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 举报列表 */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status === 'pending' ? '⏳ 待处理' :
                           report.status === 'resolved' ? '✅ 已处理' :
                           '❌ 已拒绝'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          举报时间：{new Date(report.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="mb-1">
                        <span className="text-muted-foreground">举报原因：</span>
                        {report.reason}
                      </div>
                      {report.post && (
                        <div className="mb-1">
                          <span className="text-muted-foreground">被举报内容：</span>
                          <span className="line-clamp-2">{report.post.content}</span>
                        </div>
                      )}
                      {report.reporter && (
                        <div className="text-xs text-muted-foreground">
                          举报人：{report.reporter.nickname}
                        </div>
                      )}
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleResolve(report.id, 'delete')}
                        >
                          删除帖子并处理
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(report.id, 'ignore')}
                        >
                          忽略举报
                        </Button>
                        {report.post && (
                          <Link href={`/posts/${report.post.id}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              查看详情
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-muted-foreground">
                {filterStatus === 'pending' ? '没有待处理的举报' : '暂无数据'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Moderation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <ModerationInner />
    </Suspense>
  );
}

export default function ModerationPage() {
  return (
    <ToastProvider>
      <Moderation />
    </ToastProvider>
  );
}
