"use client";

import { useState } from "react";
import { createReport, REPORT_REASONS, ReportReason } from "@/actions/reports";

interface ReportButtonProps {
  postId: string;
  token: string;
  onReportSuccess?: () => void;
}

export default function ReportButton({ postId, token, onReportSuccess }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError("请选择举报原因");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await createReport(postId, selectedReason as ReportReason, description, token);

    if (result.success) {
      setIsOpen(false);
      setSelectedReason("");
      setDescription("");
      onReportSuccess?.();
    } else {
      setError(result.error || "举报失败");
    }

    setIsSubmitting(false);
  };

  return (
    <>
      {/* 举报按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-destructive transition-colors p-1"
        aria-label="举报此帖子"
        title="举报"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      </button>

      {/* 举报弹窗 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-dialog-title"
        >
          <div className="bg-background rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 id="report-dialog-title" className="text-lg font-semibold mb-4">
              举报此帖子
            </h2>

            <form onSubmit={handleSubmit}>
              {/* 举报原因 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  举报原因 <span className="text-destructive">*</span>
                </label>
                <div className="space-y-2">
                  {(Object.entries(REPORT_REASONS) as [ReportReason, string][]).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={value}
                        checked={selectedReason === value}
                        onChange={(e) => {
                          setSelectedReason(e.target.value as ReportReason);
                          setError("");
                        }}
                        className="flex-shrink-0"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 补充说明 */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  补充说明（可选）
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请提供更多详细信息，帮助我们更好地处理..."
                  className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                  {error}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedReason("");
                    setDescription("");
                    setError("");
                  }}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors"
                  disabled={isSubmitting}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "提交中..." : "提交举报"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
