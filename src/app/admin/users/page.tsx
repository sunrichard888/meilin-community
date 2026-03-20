"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider, useToast } from "@/components/ui/toast";

interface User {
  id: string;
  nickname: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  created_at: string;
}

function UserManagementInner() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login?redirect=/admin/users';
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const res = await fetch('/api/admin/users', { headers });
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = '/login?redirect=/admin/users';
        return;
      }

      if (res.ok) {
        setUsers(data.users || []);
      } else {
        showToast(data.error || '获取用户列表失败', 'error');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      showToast('获取用户列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const newRole = currentRole === 'admin' ? 'user' : 'admin';

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast(`已${newRole === 'admin' ? '提升' : '降级'}为${newRole === 'admin' ? '管理员' : '普通用户'}`, 'success');
        fetchUsers();
      } else {
        showToast(result.error || '操作失败', 'error');
      }
    } catch (error) {
      console.error('Toggle role error:', error);
      showToast('操作失败', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, nickname: string) => {
    if (!confirm(`确定要删除用户 "${nickname}" 吗？此操作不可恢复！`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast('用户已删除', 'success');
        fetchUsers();
      } else {
        showToast(result.error || '删除失败', 'error');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      showToast('删除失败', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold">← 返回</Link>
              <h1 className="text-xl font-bold">👥 用户管理</h1>
            </div>
          </div>
        </header>
        <div className="container py-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">← 返回</Link>
            <h1 className="text-xl font-bold">👥 用户管理</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary">
              仪表盘
            </Link>
            <Link href="/admin/moderation" className="text-sm font-medium hover:text-primary">
              内容审核
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
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="搜索用户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">全部用户</option>
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 用户列表 */}
        {filteredUsers.length > 0 ? (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.nickname}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.nickname[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.nickname}</h3>
                          {user.role === 'admin' && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              管理员
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          加入于 {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRole(user.id, user.role)}
                      >
                        {user.role === 'admin' ? '降级为普通用户' : '提升为管理员'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.nickname)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-muted-foreground">暂无用户</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <ToastProvider>
      <UserManagementInner />
    </ToastProvider>
  );
}
