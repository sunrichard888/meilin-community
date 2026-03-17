/**
 * 隐私设置类型定义
 */

export type PrivacyPreset = 'public' | 'neighbors_only' | 'private' | 'custom';

export interface PrivacySettings {
  // 个人信息可见性
  show_community_name: boolean;
  show_building_info: boolean;
  show_introduction: boolean;
  show_nickname: boolean;

  // 交互权限
  allow_direct_messages: boolean;
  allow_comments: boolean;
  allow_mentions: boolean;

  // 通知设置
  notify_new_comments: boolean;
  notify_new_likes: boolean;
  notify_new_followers: boolean;
  notify_community_updates: boolean;

  // 隐私预设
  privacy_preset: PrivacyPreset;
}

export interface PrivacySettingsFormData {
  // 个人信息可见性
  showCommunityName: boolean;
  showBuildingInfo: boolean;
  showIntroduction: boolean;
  showNickname: boolean;

  // 交互权限
  allowDirectMessages: boolean;
  allowComments: boolean;
  allowMentions: boolean;

  // 通知设置
  notifyNewComments: boolean;
  notifyNewLikes: boolean;
  notifyNewFollowers: boolean;
  notifyCommunityUpdates: boolean;

  // 隐私预设
  privacyPreset: PrivacyPreset;
}

// API 响应类型
export interface PrivacySettingsResponse {
  success: boolean;
  data?: PrivacySettings;
  error?: string;
}
