"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";

function NeighborProfileForm() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // 表单状态
  const [formData, setFormData] = useState({
    communityName: "",
    buildingNumber: "",
    unitNumber: "",
    roomNumber: "",
    introduction: "",
  });

  // 错误状态
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 获取已有信息
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      const response = await fetch("/api/neighbor/profile");
      const data = await response.json();

      if (data.data) {
        setFormData({
          communityName: data.data.communityName || "",
          buildingNumber: data.data.buildingNumber || "",
          unitNumber: data.data.unitNumber || "",
          roomNumber: data.data.roomNumber || "",
          introduction: data.data.introduction || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setFetching(false);
    }
  }

  // 验证字段
  const validateField = (name: string, value: string): string | null => {
    const rules: Record<string, any> = {
      communityName: { required: true, minLength: 2, maxLength: 50, pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-]+$/ },
      buildingNumber: { required: true, pattern: /^([1-9]\d{0,2}|[A-Z])$/ },
      unitNumber: { required: true, pattern: /^[1-9]\d?$/ },
      roomNumber: { required: true, pattern: /^\d{1,4}$/ },
      introduction: { required: false, maxLength: 500 },
    };

    const rule = rules[name];
    if (!rule) return null;

    if (rule.required && (!value || value.trim() === "")) {
      return "此字段为必填项";
    }
    if (value && rule.minLength && value.length < rule.minLength) {
      return `至少${rule.minLength}个字符`;
    }
    if (value && rule.maxLength && value.length > rule.maxLength) {
      return `不超过${rule.maxLength}个字符`;
    }
    if (value && rule.pattern && !rule.pattern.test(value)) {
      return "格式不正确";
    }
    return null;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 实时验证
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || "",
    }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // 验证所有字段
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("请填写正确的信息", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/neighbor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "提交失败");
      }

      showToast("提交成功！请等待管理员审核", "success");
      
      // 跳转到状态页面
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      showToast(error.message || "提交失败", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    showToast("已退出登录", "success");
    router.push("/");
  };

  if (!user || fetching) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">🏠 邻里认证</h1>
          <Button variant="ghost" onClick={handleSignOut}>
            🚪 退出登录
          </Button>
        </div>
      </header>

      <div className="container py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 说明卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>认证说明</CardTitle>
              <CardDescription>
                完成邻里认证后，您可以：
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 查看同小区邻居的动态</li>
                <li>• 参与社区活动和讨论</li>
                <li>• 发布邻里互助信息</li>
                <li>• 您的详细地址信息仅管理员可见</li>
              </ul>
            </CardContent>
          </Card>

          {/* 表单卡片 */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>
                  请填写您的小区和住址信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 小区名称 */}
                <div className="space-y-2">
                  <Label htmlFor="communityName">
                    小区名称 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="communityName"
                    name="communityName"
                    value={formData.communityName}
                    onChange={handleInputChange}
                    placeholder="请输入小区名称"
                    className={errors.communityName ? "border-destructive" : ""}
                  />
                  {errors.communityName && (
                    <p className="text-xs text-destructive">{errors.communityName}</p>
                  )}
                </div>

                {/* 详细地址 */}
                <div className="space-y-2">
                  <Label>详细地址 <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Input
                        name="buildingNumber"
                        value={formData.buildingNumber}
                        onChange={handleInputChange}
                        placeholder="楼栋"
                        className={errors.buildingNumber ? "border-destructive" : ""}
                      />
                      {errors.buildingNumber && (
                        <p className="text-xs text-destructive">{errors.buildingNumber}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        name="unitNumber"
                        value={formData.unitNumber}
                        onChange={handleInputChange}
                        placeholder="单元"
                        className={errors.unitNumber ? "border-destructive" : ""}
                      />
                      {errors.unitNumber && (
                        <p className="text-xs text-destructive">{errors.unitNumber}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleInputChange}
                        placeholder="房号"
                        className={errors.roomNumber ? "border-destructive" : ""}
                      />
                      {errors.roomNumber && (
                        <p className="text-xs text-destructive">{errors.roomNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 自我介绍 */}
                <div className="space-y-2">
                  <Label htmlFor="introduction">自我介绍</Label>
                  <textarea
                    id="introduction"
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleInputChange}
                    placeholder="介绍一下自己，让邻居更了解你（可选）"
                    rows={4}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="flex justify-end">
                    <p className="text-xs text-muted-foreground">
                      {formData.introduction.length}/500
                    </p>
                  </div>
                  {errors.introduction && (
                    <p className="text-xs text-destructive">{errors.introduction}</p>
                  )}
                </div>

                {/* 提交按钮 */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "提交中..." : "提交认证"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    提交后请等待管理员审核，审核结果将通过站内信通知
                  </p>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NeighborProfilePage() {
  return (
    <ToastProvider>
      <NeighborProfileForm />
    </ToastProvider>
  );
}
