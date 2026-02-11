
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  dueDate?: string;
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name: string;
  createdAt: string;
}

export interface DayData {
  id: string; // ISO date string
  spaceId: string; // The ID of the organization/manager space
  notes: string;
  tasks: Task[];
  media: MediaFile[];
}

export interface Space {
  id: string;
  name: string;
  managerId: string;
  createdAt: string;
}

export interface CalendarState {
  // Keyed by spaceId, then by date
  [spaceId: string]: {
    [date: string]: DayData;
  };
}

export interface UserPermissions {
  canEdit: boolean;
  canViewMedia: boolean;
  canViewTasks: boolean;
  canManageUsers: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'super-admin' | 'admin' | 'user'; // super-admin is Azoos
  spaceId: string; // Every user belongs to a specific space
  password?: string;
  permissions: UserPermissions;
}
