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
  members?: TeamMember[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  id:string;
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
  userid:string;
  description: string;
  teamId: string;
  assignedMembers?: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
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
  remark: string;
  user_id: string;
  user_name: string;
  created_at: string;
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
