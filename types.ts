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
  password?: string; // اختياري لأغراض العرض
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  time?: string;
}

export interface DayData {
  id: string; // Format: YYYY-MM-DD
  spaceId: string;
  notes: string;
  tasks: Task[];
  media?: string[]; // روابط الصور أو الملفات
}

export interface Space {
  id: string;
  name: string;
  primaryColor: string;
  managerId?: string;
  createdAt: string;
  userLimit?: number; // الحقل الجديد (اختياري لتجنب أخطاء البيانات القديمة)
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
