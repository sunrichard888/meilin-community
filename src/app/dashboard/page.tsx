"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";

// 设置项组件
function SettingSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

// 头像上传组件
function AvatarEditor({ user }: { user: any }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
          {preview ? (
            <img src={preview} alt="头像预览" className="h-full w-full object-cover" />
          ) : (
            user?.nickname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"
          )}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <Button variant="outline" size="sm">
          更换头像
        </Button>
        <p className="text-xs text-muted-foreground">
          支持 JPG、PNG 格式，最大 2MB
        </p>
      </div>
    </div>
  );
}

// 修改密码组件
function ChangePassword({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { changePassword: updatePassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showToast("两次输入的密码不一致", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("密码至少 6 位", "error");
      return;
    }

    setLoading(true);
    
    const { error } = await updatePassword!(currentPassword, newPassword);
    
    if (error) {
      showToast(error, "error");
    } else {
      showToast("密码修改成功，请使用新密码登录", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">当前密码</Label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="输入当前密码"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">新密码</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="至少 6 位"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">确认新密码</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="再次输入新密码"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "修改中..." : "修改密码"}
      </Button>
    </form>
  );
}

// 账号信息组件
function AccountInfo({ user }: { user: any }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>邮箱</Label>
        <Input value={user?.email || ""} disabled />
        <p className="text-xs text-muted-foreground">
          邮箱用于账号找回和重要通知
        </p>
      </div>
      <div className="grid gap-2">
        <Label>手机号</Label>
        <div className="flex gap-2">
          <Input value="未绑定" disabled className="flex-1" />
          <Button variant="outline" size="sm">
            绑定手机
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          绑定手机可增强账号安全
        </p>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("account");

  // 未登录重定向
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSignOut = () => {
    signOut();
    showToast("已退出登录", "success");
    router.push("/");
  };

  const menuItems = [
    { id: "account", label: "账号安全", icon: "🔐" },
    { id: "profile", label: "邻里信息", icon: "🏠", href: "/neighbor" },
    { id: "privacy", label: "隐私设置", icon: "🔒", href: "/privacy-settings" },
    { id: "content", label: "内容管理", icon: "📝", comingSoon: true },
    { id: "notification", label: "通知设置", icon: "🔔", comingSoon: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">个人设置</h1>
          <Button variant="ghost" onClick={handleSignOut}>
            🚪 退出登录
          </Button>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左侧导航 */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id && !item.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    } ${item.href ? "cursor-pointer" : item.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                    {item.comingSoon && !item.href && (
                      <span className="ml-2 text-xs text-muted-foreground">开发中</span>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* 右侧内容 */}
          <main className="flex-1">
            {activeTab === "account" && (
              <div className="space-y-6">
                {/* 头像编辑 */}
                <Card>
                  <CardHeader>
                    <CardTitle>头像</CardTitle>
                    <CardDescription>
                      上传真实头像可增强邻里信任
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AvatarEditor user={user} />
                  </CardContent>
                </Card>

                {/* 账号信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle>账号信息</CardTitle>
                    <CardDescription>
                      管理你的账号安全设置
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AccountInfo user={user} />
                  </CardContent>
                </Card>

                {/* 修改密码 */}
                <Card>
                  <CardHeader>
                    <CardTitle>修改密码</CardTitle>
                    <CardDescription>
                      定期修改密码可增强账号安全
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChangePassword user={user} />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>🏠 邻里信息</CardTitle>
                  <CardDescription>
                    功能开发中，敬请期待...
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <p className="text-muted-foreground">
                    小区认证、楼栋信息、自我介绍等功能即将上线
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === "privacy" && (
              <Card>
                <CardHeader>
                  <CardTitle>🔒 隐私设置</CardTitle>
                  <CardDescription>
                    功能开发中，敬请期待...
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🔐</div>
                  <p className="text-muted-foreground">
                    动态可见范围、私信权限、房号显示控制等功能即将上线
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === "content" && (
              <Card>
                <CardHeader>
                  <CardTitle>📝 内容管理</CardTitle>
                  <CardDescription>
                    功能开发中，敬请期待...
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-muted-foreground">
                    我的帖子、我的收藏、草稿箱等功能即将上线
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === "notification" && (
              <Card>
                <CardHeader>
                  <CardTitle>🔔 通知设置</CardTitle>
                  <CardDescription>
                    功能开发中，敬请期待...
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-muted-foreground">
                    通知总控、私信通知、社区公告等功能即将上线
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
