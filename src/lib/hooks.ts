"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { Post, Comment, Message } from './types';

// 获取动态列表
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users (
            id,
            nickname,
            avatar,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPosts(data as Post[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPost = useCallback(async (content: string, images?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          images,
        })
        .select()
        .single();

      if (error) throw error;
      fetchPosts();
      return { data, error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }, [fetchPosts]);

  const likePost = useCallback(async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 检查是否已点赞
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existing) {
        // 取消点赞
        await supabase.from('likes').delete().eq('id', existing.id);
      } else {
        // 点赞
        await supabase.from('likes').insert({ user_id: user.id, post_id: postId });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, addPost, likePost, refresh: fetchPosts };
}

// 获取评论
export function useComments(postId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users (
            id,
            nickname,
            avatar,
            role
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as Comment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content: string) => {
    if (!postId) return { error: 'Invalid post' };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      fetchComments();
      return { data, error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }, [postId, fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, addComment, refresh: fetchComments };
}

// 获取消息
export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (toUserId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      fetchMessages();
      return { data, error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, sendMessage, refresh: fetchMessages };
}
