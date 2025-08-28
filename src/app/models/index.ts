export interface User {
  id: string;
  empId: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: string ;
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

export interface RegisterResponse {
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
  name: string;
  userid:string;
  description: string;
  teamId: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedMembers?:{
      id: string;
      name: string;
      empId:string;
    }[];
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  createdBy: string;
  createdByName?: string;
  createdByEmpId?:string;
  createdAt: string;
  targetDate: string | null;
  attachments: Attachment[];
  links?: ActivityLink[];
  remarks: Remark[];
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ActivityLink {
  id: string;
  url: string;
  title?: string;
  activityId: string;
  createdAt: string;
}

export interface Remark {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userEmpId: string;
  activityId:number;
  type:string;
  createdAt: string;
  // UI-only properties for editing
  isEditing?: boolean;
  editText?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedTeamId?: number;
  relatedActivityId?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    empId: string;
    name: string;
    role: string;
  };
  relatedTeam?: any;
  relatedActivity?: any;
  unread: boolean;
  
  // Computed properties for backward compatibility
  read?: boolean;
  teamId?: number;
  activityId?: number;
}
