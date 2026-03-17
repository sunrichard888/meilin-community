"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  role: string;
  created_at?: string;
}

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, nickname: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    // 监听认证状态变化
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
        // 如果 users 表中没有记录，从 auth.user 创建基本用户对象
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

      if (error) throw error;
      if (data.user) {
        await loadUser(data.user.id);
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || '登录失败' };
    }
  }

  async function signUp(email: string, password: string, nickname: string) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      return { 
        error: null,
        needsEmailConfirmation: true 
      };
    } catch (error: any) {
      return { error: error.message || '注册失败' };
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { error: '用户未登录' };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        return { error: '当前密码错误' };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: error.message || '密码更新失败' };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || '密码更新失败' };
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, changePassword }}>
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
