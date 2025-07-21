export interface User {
  id: string;
  empId: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface LoginRequest {
  empId: string;
  password: string;
}

export interface RegisterRequest {
  empId: string;
  name: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  domainId: string;
  members: TeamMember[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  empId: string;
  name: string;
  addedAt: string;
}

export interface Domain {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  teamId: string;
  assignedMembers: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  createdBy: string;
  createdAt: string;
  targetDate: string | null;
  attachments: Attachment[];
  remarks: Remark[];
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  uploadedAt: string;
}

export interface Remark {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  teamId?: string;
  activityId?: string;
  read: boolean;
  createdAt: string;
}
