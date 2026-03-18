'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export interface PostData {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  community_name?: string;
  building_number?: string;
  is_pinned: boolean;
  created_at: string;
  user?: {
    nickname: string;
    avatar?: string;
  };
}

export interface CommentData {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    nickname: string;
    avatar?: string;
  };
}

export interface CreateCommentResult {
  success: boolean;
  data?: CommentData;
  error?: string;
}

export interface CreatePostResult {
  success: boolean;
  data?: PostData;
  error?: string;
}

/**
 * 创建新帖子
 */
export async function createPost(
  content: string,
  images: string[] = [],
  token: string
): Promise<CreatePostResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 验证 token 获取用户
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return { success: false, error: '请先登录' };
    }

    // 验证内容
    if (!content || content.trim().length === 0) {
      return { success: false, error: '内容不能为空' };
    }

    if (content.length > 1000) {
      return { success: false, error: '内容不能超过 1000 字' };
    }

    // 创建帖子（触发器会自动填充小区/楼栋信息）
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        images,
        likes_count: 0,
        comments_count: 0,
      })
      .select(`
        *,
        user:users (
          nickname,
          avatar
        )
      `)
      .single();

    if (error) {
      console.error('[createPost] Database error:', error);
      return { success: false, error: '发布失败，请稍后重试' };
    }

    // 重新验证 feed 页面
    revalidatePath('/feed');

    return { 
      success: true, 
      data: data as PostData 
    };
  } catch (error: any) {
    console.error('[createPost] Error:', error);
    return { success: false, error: error.message || '发布失败' };
  }
}

/**
 * 获取帖子列表
 */
export async function getPosts(options?: {
  communityName?: string;
  buildingNumber?: string;
  limit?: number;
  offset?: number;
}): Promise<PostData[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users (
          nickname,
          avatar
        )
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    // 小区过滤
    if (options?.communityName) {
      query = query.eq('community_name', options.communityName);
    }

    // 楼栋过滤
    if (options?.buildingNumber) {
      query = query.eq('building_number', options.buildingNumber);
    }

    // 分页
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset || 0) + (options?.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getPosts] Database error:', error);
      return [];
    }

    return data as PostData[];
  } catch (error: any) {
    console.error('[getPosts] Error:', error);
    return [];
  }
}

/**
 * 删除帖子
 */
export async function deletePost(postId: string, token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return { success: false, error: '请先登录' };
    }

    // 验证帖子所有权
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post || post.user_id !== user.id) {
      return { success: false, error: '无权删除此帖子' };
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('[deletePost] Database error:', error);
      return { success: false, error: '删除失败' };
    }

    revalidatePath('/feed');

    return { success: true };
  } catch (error: any) {
    console.error('[deletePost] Error:', error);
    return { success: false, error: error.message || '删除失败' };
  }
}

/**
 * 点赞/取消点赞
 */
export async function toggleLike(postId: string, token: string): Promise<{ success: boolean; liked?: boolean; error?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return { success: false, error: '请先登录' };
    }

    // 检查是否已点赞
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // 取消点赞
      await supabase.from('likes').delete().eq('id', existingLike.id);
      return { success: true, liked: false };
    } else {
      // 点赞
      await supabase.from('likes').insert({
        post_id: postId,
        user_id: user.id,
      });
      return { success: true, liked: true };
    }
  } catch (error: any) {
    console.error('[toggleLike] Error:', error);
    return { success: false, error: error.message || '操作失败' };
  }
}

/**
 * 获取帖子评论列表
 */
export async function getComments(postId: string): Promise<CommentData[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users (
          nickname,
          avatar
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[getComments] Database error:', error);
      return [];
    }

    return data as CommentData[];
  } catch (error: any) {
    console.error('[getComments] Error:', error);
    return [];
  }
}

/**
 * 创建评论
 */
export async function createComment(
  postId: string,
  content: string,
  token: string
): Promise<CreateCommentResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return { success: false, error: '请先登录' };
    }

    // 验证内容
    if (!content || content.trim().length === 0) {
      return { success: false, error: '评论内容不能为空' };
    }

    if (content.length > 500) {
      return { success: false, error: '评论内容不能超过 500 字' };
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      })
      .select(`
        *,
        user:users (
          nickname,
          avatar
        )
      `)
      .single();

    if (error) {
      console.error('[createComment] Database error:', error);
      return { success: false, error: '评论失败，请稍后重试' };
    }

    revalidatePath('/feed');

    return { 
      success: true, 
      data: data as CommentData 
    };
  } catch (error: any) {
    console.error('[createComment] Error:', error);
    return { success: false, error: error.message || '评论失败' };
  }
}

/**
 * 删除评论
 */
export async function deleteComment(commentId: string, token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return { success: false, error: '请先登录' };
    }

    // 验证评论所有权
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!comment || comment.user_id !== user.id) {
      return { success: false, error: '无权删除此评论' };
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('[deleteComment] Database error:', error);
      return { success: false, error: '删除失败' };
    }

    revalidatePath('/feed');

    return { success: true };
  } catch (error: any) {
    console.error('[deleteComment] Error:', error);
    return { success: false, error: error.message || '删除失败' };
  }
}
