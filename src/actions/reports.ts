'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'fraud' | 'other';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export interface ReportData {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface CreateReportResult {
  success: boolean;
  data?: ReportData;
  error?: string;
}

/**
 * 举报原因显示文本
 */
export const REPORT_REASONS: Record<ReportReason, string> = {
  spam: '垃圾广告',
  inappropriate: '不当内容',
  harassment: '骚扰欺凌',
  fraud: '诈骗信息',
  other: '其他原因',
};

/**
 * 举报状态显示文本
 */
export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: '待处理',
  reviewing: '审核中',
  resolved: '已处理',
  dismissed: '已驳回',
};

/**
 * 创建举报
 */
export async function createReport(
  postId: string,
  reason: ReportReason,
  description: string,
  token: string
): Promise<CreateReportResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 验证用户
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return { success: false, error: '请先登录' };
    }

    // 验证帖子是否存在
    const { data: post } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .single();

    if (!post) {
      return { success: false, error: '帖子不存在' };
    }

    // 不能举报自己的帖子
    if (post.user_id === user.id) {
      return { success: false, error: '不能举报自己的帖子' };
    }

    // 创建举报
    const { data, error } = await supabase
      .from('reports')
      .insert({
        post_id: postId,
        reporter_id: user.id,
        reason,
        description: description.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[createReport] Database error:', error);
      if (error.code === '23505') { // unique violation
        return { success: false, error: '您已经举报过此帖子' };
      }
      return { success: false, error: '举报失败，请稍后重试' };
    }

    return { success: true, data: data as ReportData };
  } catch (error: any) {
    console.error('[createReport] Error:', error);
    return { success: false, error: error.message || '举报失败' };
  }
}

/**
 * 获取用户的举报历史
 */
export async function getUserReports(token: string): Promise<ReportData[]> {
  try {
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return [];
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        post:posts (
          id,
          content,
          created_at
        )
      `)
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getUserReports] Database error:', error);
      return [];
    }

    return data as ReportData[];
  } catch (error: any) {
    console.error('[getUserReports] Error:', error);
    return [];
  }
}

/**
 * 管理员获取所有举报（需要管理员权限）
 */
export async function getAllReports(token: string, status?: ReportStatus): Promise<ReportData[]> {
  try {
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return [];
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 检查管理员权限
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      throw new Error('需要管理员权限');
    }

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reporter_id (
          nickname,
          avatar
        ),
        post:posts (
          id,
          content,
          user_id,
          created_at,
          post_user:users (
            nickname,
            avatar
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getAllReports] Database error:', error);
      return [];
    }

    return data as ReportData[];
  } catch (error: any) {
    console.error('[getAllReports] Error:', error);
    return [];
  }
}

/**
 * 管理员更新举报状态
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  adminNotes: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return { success: false, error: '请先登录' };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 检查管理员权限
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      return { success: false, error: '需要管理员权限' };
    }

    const { error } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes: adminNotes.trim() || null,
        resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null,
        resolved_by: status === 'resolved' || status === 'dismissed' ? user.id : null,
      })
      .eq('id', reportId);

    if (error) {
      console.error('[updateReportStatus] Database error:', error);
      return { success: false, error: '更新失败' };
    }

    revalidatePath('/admin/reports');

    return { success: true };
  } catch (error: any) {
    console.error('[updateReportStatus] Error:', error);
    return { success: false, error: error.message || '更新失败' };
  }
}
