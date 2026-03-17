"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";
import type { PrivacyPreset } from "@/lib/types/privacy";

interface PrivacyFormData {
  showCommunityName: boolean;
  showBuildingInfo: boolean;
  showIntroduction: boolean;
  showNickname: boolean;
  allowDirectMessages: boolean;
  allowComments: boolean;
  allowMentions: boolean;
  notifyNewComments: boolean;
  notifyNewLikes: boolean;
  notifyNewFollowers: boolean;
  notifyCommunityUpdates: boolean;
  privacyPreset: PrivacyPreset;
}

const DEFAULT_SETTINGS: PrivacyFormData = {
  showCommunityName: true,
  showBuildingInfo: false,  // 默认隐藏楼栋信息（Richard Bartle 建议）
  showIntroduction: true,
  showNickname: true,
  allowDirectMessages: true,
  allowComments: true,
  allowMentions: true,
  notifyNewComments: true,
  notifyNewLikes: true,
  notifyNewFollowers: true,
  notifyCommunityUpdates: true,
  privacyPreset: 'custom',
};

function PrivacySettingsForm() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState<PrivacyFormData>(DEFAULT_SETTINGS);

  // 获取当前设置
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchSettings();
  }, [user]);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/privacy-settings");
      const data = await response.json();

      if (data.data) {
        setFormData({
          showCommunityName: data.data.show_community_name,
          showBuildingInfo: data.data.show_building_info,
          showIntroduction: data.data.show_introduction,
          showNickname: data.data.show_nickname,
          allowDirectMessages: data.data.allow_direct_messages,
          allowComments: data.data.allow_comments,
          allowMentions: data.data.allow_mentions,
          notifyNewComments: data.data.notify_new_comments,
          notifyNewLikes: data.data.notify_new_likes,
          notifyNewFollowers: data.data.notify_new_followers,
          notifyCommunityUpdates: data.data.notify_community_updates,
          privacyPreset: data.data.privacy_preset,
        });
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    } finally {
      setFetching(false);
    }
  }

  const handleToggleChange = (field: keyof PrivacyFormData, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePresetChange = (preset: PrivacyPreset) => {
    // 根据预设应用默认值
    const presets: Record<PrivacyPreset, Partial<PrivacyFormData>> = {
      public: {
        showCommunityName: true,
        showBuildingInfo: true,
        showIntroduction: true,
        showNickname: true,
        allowDirectMessages: true,
        allowComments: true,
        allowMentions: true,
      },
      neighbors_only: {
        showCommunityName: true,
        showBuildingInfo: false,
        showIntroduction: true,
        showNickname: true,
        allowDirectMessages: true,
        allowComments: true,
        allowMentions: true,
      },
      private: {
        showCommunityName: false,
        showBuildingInfo: false,
        showIntroduction: false,
        showNickname: false,
        allowDirectMessages: false,
        allowComments: false,
        allowMentions: false,
      },
      custom: {},
    };

    setFormData(prev => ({ ...prev, ...presets[preset], privacyPreset: preset }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/privacy-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          show_community_name: formData.showCommunityName,
          show_building_info: formData.showBuildingInfo,
          show_introduction: formData.showIntroduction,
          show_nickname: formData.showNickname,
          allow_direct_messages: formData.allowDirectMessages,
          allow_comments: formData.allowComments,
          allow_mentions: formData.allowMentions,
          notify_new_comments: formData.notifyNewComments,
          notify_new_likes: formData.notifyNewLikes,
          notify_new_followers: formData.notifyNewFollowers,
          notify_community_updates: formData.notifyCommunityUpdates,
          privacy_preset: formData.privacyPreset,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "保存失败");
      }

      showToast("隐私设置已保存", "success");
      setHasChanges(false);
      
      // 显示具体保存的设置（Don Norman 建议）
      const buildingInfoStatus = formData.showBuildingInfo ? "公开" : "隐藏";
      showToast(`楼栋信息：${buildingInfoStatus} ✓`, "success");
    } catch (error: any) {
      showToast(error.message || "保存失败", "error");
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
          <h1 className="text-xl font-bold">🔒 隐私设置</h1>
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
              <CardTitle>隐私控制</CardTitle>
              <CardDescription>
                管理您的个人信息可见性和交互权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                💡 建议：默认设置已保护您的隐私，您可以根据需要调整
              </p>
            </CardContent>
          </Card>

          {/* 隐私预设 */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>快速预设</CardTitle>
                <CardDescription>
                  选择适合您的隐私级别
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePresetChange('public')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.privacyPreset === 'public'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium">🌍 公开</div>
                    <div className="text-xs text-muted-foreground">
                      所有人可见
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('neighbors_only')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.privacyPreset === 'neighbors_only'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium">🏘️ 仅邻居</div>
                    <div className="text-xs text-muted-foreground">
                      认证邻居可见
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('private')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.privacyPreset === 'private'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium">🔒 私密</div>
                    <div className="text-xs text-muted-foreground">
                      仅自己可见
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('custom')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.privacyPreset === 'custom'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium">⚙️ 自定义</div>
                    <div className="text-xs text-muted-foreground">
                      手动配置
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 个人信息可见性 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>个人信息可见性</CardTitle>
                <CardDescription>
                  控制谁能看到您的个人信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ToggleRow
                  label="小区名称"
                  description="显示您所在的小区"
                  checked={formData.showCommunityName}
                  onCheckedChange={(v) => handleToggleChange('showCommunityName', v)}
                />
                <ToggleRow
                  label="楼栋信息"
                  description="显示您的楼栋号（建议隐藏）"
                  checked={formData.showBuildingInfo}
                  onCheckedChange={(v) => handleToggleChange('showBuildingInfo', v)}
                />
                <ToggleRow
                  label="自我介绍"
                  description="显示您的个人介绍"
                  checked={formData.showIntroduction}
                  onCheckedChange={(v) => handleToggleChange('showIntroduction', v)}
                />
                <ToggleRow
                  label="昵称"
                  description="显示您的昵称"
                  checked={formData.showNickname}
                  onCheckedChange={(v) => handleToggleChange('showNickname', v)}
                />
              </CardContent>
            </Card>

            {/* 交互权限 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>交互权限</CardTitle>
                <CardDescription>
                  控制其他用户如何与您互动
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ToggleRow
                  label="允许私信"
                  description="允许其他用户给您发送私信"
                  checked={formData.allowDirectMessages}
                  onCheckedChange={(v) => handleToggleChange('allowDirectMessages', v)}
                />
                <ToggleRow
                  label="允许评论"
                  description="允许其他用户评论您的内容"
                  checked={formData.allowComments}
                  onCheckedChange={(v) => handleToggleChange('allowComments', v)}
                />
                <ToggleRow
                  label="允许被@"
                  description="允许其他用户在内容中@您"
                  checked={formData.allowMentions}
                  onCheckedChange={(v) => handleToggleChange('allowMentions', v)}
                />
              </CardContent>
            </Card>

            {/* 通知设置 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>通知设置</CardTitle>
                <CardDescription>
                  选择您想接收的通知类型
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ToggleRow
                  label="新评论"
                  description="有人评论您的内容时"
                  checked={formData.notifyNewComments}
                  onCheckedChange={(v) => handleToggleChange('notifyNewComments', v)}
                />
                <ToggleRow
                  label="新点赞"
                  description="有人点赞您的内容时"
                  checked={formData.notifyNewLikes}
                  onCheckedChange={(v) => handleToggleChange('notifyNewLikes', v)}
                />
                <ToggleRow
                  label="新关注"
                  description="有人关注您时"
                  checked={formData.notifyNewFollowers}
                  onCheckedChange={(v) => handleToggleChange('notifyNewFollowers', v)}
                />
                <ToggleRow
                  label="社区公告"
                  description="小区重要通知和公告"
                  checked={formData.notifyCommunityUpdates}
                  onCheckedChange={(v) => handleToggleChange('notifyCommunityUpdates', v)}
                />
              </CardContent>
            </Card>

            {/* 保存按钮 */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || !hasChanges}
              >
                {loading ? "保存中..." : "保存设置"}
              </Button>
              {!hasChanges && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  修改设置后点击保存
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Toggle 开关组件（符合 Don Norman 的 44px 触摸目标建议）
interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-1">
        <Label className="text-base font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={`
          relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full 
          transition-colors focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2
          ${checked ? 'bg-primary' : 'bg-input'}
        `}
      >
        <span
          className={`
            pointer-events-none block h-6 w-6 rounded-full bg-background shadow-lg 
            ring-0 transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}

export default function PrivacySettingsPage() {
  return (
    <ToastProvider>
      <PrivacySettingsForm />
    </ToastProvider>
  );
}
