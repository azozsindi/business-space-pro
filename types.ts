// types.ts

export type UserRole = 'super-admin' | 'admin' | 'manager' | 'employee';

export interface UserPermissions {
  canManageUsers: boolean;
  canCreateSpaces: boolean;
  canViewAllReports: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  spaceId: string;
  permissions: UserPermissions;
  avatar?: string;
  password?: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  time?: string;
}

// الواجهة الجديدة للوسائط (ضرورية لدعم الصوت والكاميرا والملفات)
export interface MediaItem {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string; // Base64 للصور/الصوت أو رابط الملف
  name: string;
  size?: string;
  date: string;
}

export interface DayData {
  id: string; // Format: YYYY-MM-DD
  spaceId: string;
  notes: string;
  tasks: Task[];
  media: MediaItem[]; // تم التحديث من string[] إلى MediaItem[]
}

export interface Space {
  id: string;
  name: string;
  primaryColor: string;
  managerId?: string;
  createdAt: string;
  userLimit?: number; 
}

export interface SystemSettings {
  primaryColor: string;
  brandName: string;
  allowUserSignup: boolean;
}

export interface CalendarState {
  [spaceId: string]: {
    [dateId: string]: DayData;
  };
}
