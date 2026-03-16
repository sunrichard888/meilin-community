"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, nickname: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 监听认证变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setUser(data as User);
      } else {
        // 如果 users 表中没有记录，创建一个基本用户对象
        const { data: authData } = await supabase.auth.getUser(userId);
        if (authData?.user) {
          setUser({
            id: authData.user.id,
            email: authData.user.email || '',
            nickname: authData.user.user_metadata?.nickname || '新用户',
            role: 'user',
            created_at: authData.user.created_at || new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 记录详细错误日志
        console.error('SignIn Error:', {
          message: error.message,
          code: error.code,
          status: error.status,
        });
        throw error;
      }
      if (data.user) {
        // 等待用户数据加载完成，确保 user 状态已更新
        await loadUser(data.user.id);
        // 额外等待 React 状态更新传播
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || '登录失败' };
    }
  }

  async function signUp(email: string, password: string, nickname: string) {
    try {
      // 调用服务端 API 进行注册（绕过 RLS）
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      // 注册成功后，不自动登录，提示用户检查邮箱
      // 用户需要点击邮件中的确认链接后才能登录
      return { 
        error: null,
        needsEmailConfirmation: true 
      };
    } catch (error: any) {
      return { error: error.message || '注册失败' };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
