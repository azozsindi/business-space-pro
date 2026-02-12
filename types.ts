export type UserRole = 'super-admin' | 'admin' | 'manager' | 'employee';

export interface Permissions {
  // صلاحيات المستخدمين
  canCreateUser: boolean;
  canEditUser: boolean;
  canDeleteUser: boolean;
  canChangeRoles: boolean;
  
  // صلاحيات المساحات
  canCreateSpace: boolean;
  canEditSpace: boolean;
  canDeleteSpace: boolean;
  
  // صلاحيات المحتوى
  canEditOthersTasks: boolean;
  canDeleteOthersTasks: boolean;
  canViewAllSpaces: boolean;
  
  // صلاحيات النظام
  canAccessSettings: boolean;
  canExportData: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  spaceId: string;
  permissions: Permissions; // الصلاحيات المفصلة هنا
}

// ... بقية الأنواع (Space, Task, etc.) تبقى كما هي
