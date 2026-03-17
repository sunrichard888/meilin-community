"use client";

import { useState, useEffect } from "react";
import { getAllReports, updateReportStatus, REPORT_REASONS, REPORT_STATUS_LABELS, ReportStatus, ReportReason, ReportData } from "@/actions/reports";

interface AdminReport extends ReportData {
  reporter?: { nickname: string };
  post?: {
    content: string;
    created_at: string;
    post_user?: { nickname: string };
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [filterStatus]);

  const loadReports = async () => {
    setLoading(true);
    setError("");
    
    // 注意：实际使用中需要从认证上下文获取 token
    const token = localStorage.getItem('sb-token') || '';
    
    const data = await getAllReports(token, filterStatus === "all" ? undefined : filterStatus);
    setReports(data);
    setLoading(false);
  };

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    setUpdatingId(reportId);
    
    const token = localStorage.getItem('sb-token') || '';
    const result = await updateReportStatus(reportId, newStatus, '', token);
    
    if (result.success) {
      await loadReports();
    } else {
      setError(result.error || "更新失败");
    }
    
    setUpdatingId(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">举报管理后台</h1>

        {/* 筛选器 */}
        <div className="mb-6 flex gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium">状态筛选：</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ReportStatus | "all")}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">全部</option>
              <option value="pending">待处理</option>
              <option value="reviewing">审核中</option>
              <option value="resolved">已处理</option>
              <option value="dismissed">已驳回</option>
            </select>
          </label>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        )}

        {/* 举报列表 */}
        {!loading && reports.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            暂无举报记录
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-card rounded-lg p-6 shadow-sm border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">
                        举报 ID: {report.id.slice(0, 8)}...
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {REPORT_STATUS_LABELS[report.status as ReportStatus]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      举报时间：{new Date(report.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>

                  {/* 状态操作 */}
                  <select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                    disabled={updatingId === report.id}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="pending">待处理</option>
                    <option value="reviewing">审核中</option>
                    <option value="resolved">已处理</option>
                    <option value="dismissed">已驳回</option>
                  </select>
                </div>

                {/* 举报详情 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">举报信息</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">原因：</span>{REPORT_REASONS[report.reason as ReportReason]}</p>
                      {report.description && (
                        <p><span className="text-muted-foreground">说明：</span>{report.description}</p>
                      )}
                      <p><span className="text-muted-foreground">举报人：</span>{report.reporter?.nickname || '未知'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">被举报帖子</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">作者：</span>{report.post?.post_user?.nickname || '未知'}</p>
                      <p><span className="text-muted-foreground">时间：</span>{report.post?.created_at ? new Date(report.post.created_at).toLocaleString('zh-CN') : '未知'}</p>
                      <p className="line-clamp-2">
                        <span className="text-muted-foreground">内容：</span>
                        {report.post?.content || '帖子已被删除'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
