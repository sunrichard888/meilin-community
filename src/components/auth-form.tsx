"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// 错误文案映射
const errorMessages: Record<string, string> = {
  "Invalid login credentials": "邮箱或密码错误，请重试",
  "User already registered": "该邮箱已注册，请直接登录",
  "Invalid email": "邮箱格式不正确",
  "Password should be at least 6 characters": "密码至少 6 位",
  "Network error": "网络连接失败，请检查网络后重试",
};

interface AuthFormData {
  email: string;
  password: string;
  nickname?: string;
}

interface AuthFormProps {
  type: "login" | "register";
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 自动聚焦
  useEffect(() => {
    const input = document.getElementById("email");
    input?.focus();
  }, []);

  // 密码强度计算
  useEffect(() => {
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  // 邮箱实时验证
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("请输入有效的邮箱地址");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      if (type === "login") {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, formData.nickname || "新邻居");
      }

      if (result?.error) {
        // 错误文案人性化处理
        const friendlyMessage = errorMessages[result.error] || result.error;
        setError(friendlyMessage);
      } else {
        // 成功跳转
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      const friendlyMessage = errorMessages[err.message] || "操作失败，请稍后重试";
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const isLogin = type === "login";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      {/* Logo 和品牌标语 */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white font-bold text-2xl shadow-lg">
            美
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          美邻网
        </h1>
        <p className="text-muted-foreground mt-2">
          {isLogin ? "欢迎回家" : "加入温暖的邻里社区"}
        </p>
      </div>

      {/* 欢迎横幅 */}
      <div className="w-full max-w-md mb-6">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-4 rounded-lg flex items-center gap-3">
          <span className="text-3xl">👋</span>
          <div>
            <p className="font-medium text-sm">
              {isLogin ? "好久不见！" : "欢迎加入！"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isLogin 
                ? "登录后查看邻里动态" 
                : "注册后可查看邻里动态、参与活动"}
            </p>
          </div>
        </div>
      </div>

      {/* 登录/注册表单 */}
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl text-center">
            {isLogin ? "登录账号" : "创建账号"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? "输入邮箱和密码继续" 
              : "填写以下信息完成注册"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 错误提示 */}
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-start gap-2" role="alert">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* 昵称（仅注册） */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="nickname">
                  昵称
                </label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="如何称呼你"
                  required={!isLogin}
                  autoComplete="nickname"
                />
              </div>
            )}

            {/* 邮箱 */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  validateEmail(e.target.value);
                }}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <span>⚠️</span> {emailError}
                </p>
              )}
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">
                  密码
                </label>
                {!isLogin && passwordStrength > 0 && (
                  <span className="text-xs text-muted-foreground">
                    强度：{"🔴".repeat(passwordStrength)}
                  </span>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isLogin ? "输入密码" : "至少 6 位"}
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              {!isLogin && formData.password.length > 0 && passwordStrength < 3 && (
                <p className="text-xs text-muted-foreground">
                  建议：8 位以上，包含大小写字母和数字
                </p>
              )}
              {isLogin && (
                <div className="text-right">
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    忘记密码？
                  </Link>
                </div>
              )}
            </div>

            {/* 提交按钮 */}
            <Button 
              type="submit" 
              className="w-full rounded-full" 
              disabled={loading || (isLogin && !formData.email || !formData.password)}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {isLogin ? "登录中..." : "注册中..."}
                </span>
              ) : (
                isLogin ? "登录" : "创建账号"
              )}
            </Button>
          </form>

          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或使用以下方式
              </span>
            </div>
          </div>

          {/* 社交登录（占位） */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" disabled>
              <span className="mr-2">💬</span> 微信
            </Button>
            <Button variant="outline" className="w-full" disabled>
              <span className="mr-2">📱</span> 手机号
            </Button>
          </div>

          {/* 切换登录/注册 */}
          <div className="text-center text-sm">
            {isLogin ? (
              <p className="text-muted-foreground">
                还没有账号？{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  立即注册
                </Link>
              </p>
            ) : (
              <p className="text-muted-foreground">
                已有账号？{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  立即登录
                </Link>
              </p>
            )}
          </div>

          {/* 社交证明 */}
          <div className="text-center text-xs text-muted-foreground pt-2 border-t">
            🌟 已有 1,234 位邻居加入美邻网
          </div>
        </CardContent>
      </Card>

      {/* 底部链接 */}
      <div className="mt-8 flex gap-4 text-xs text-muted-foreground">
        <Link href="/terms" className="hover:text-foreground">
          服务条款
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          隐私政策
        </Link>
        <Link href="/help" className="hover:text-foreground">
          帮助中心
        </Link>
      </div>
    </div>
  );
}
