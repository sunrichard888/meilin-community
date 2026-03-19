export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  category?: string;
  community_name?: string;
  building_number?: string;
  is_pinned?: boolean;
  created_at: string;
  user?: User;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}
