import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Activity } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = 'http://localhost:3000/api/activities';

  constructor(private http: HttpClient) {}

  getActivitiesForTeam(teamId: number): Observable<Activity[]> {
    return this.http.get<any[]>(`${this.apiUrl}/team/${teamId}`).pipe(
      map(activities => activities.map(activity => ({
        ...activity,
        assignedMembers: activity.assignedMembers || [],
        attachments: activity.attachments || [],
        links: activity.links || [],
        remarks: activity.remarks || [],
        priority: activity.priority || 'medium',
        createdAt: activity.created_at || activity.createdAt,
        updatedAt: activity.updated_at || activity.updatedAt,
        targetDate: activity.target_date || activity.targetDate,
        createdByName: activity.creatorName || 'Unknown User',
        createdByEmpId: activity.creatorEmpId || 'Unknown Emp ID'
      })))
    );
  }

  createActivity(activityData: FormData | any): Observable<any> {
    return this.http.post(this.apiUrl, activityData);
  }

  createActivityWithData(activityData: any): Observable<any> {
    return this.http.post(this.apiUrl, activityData);
  }

  updateActivityStatus(activityId: number, status: string, remarks?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${activityId}/status`, { status, remarks });
  }

  updateActivity(activityId: number, activityData: FormData | any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${activityId}`, activityData);
  }

  addRemarkToActivity(activityId: number, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${activityId}/remarks`, { text });
  }

  updateRemark(remarkId: string, text: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/remarks/${remarkId}`, { text });
  }

  deleteRemark(remarkId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remarks/${remarkId}`);
  }

  deleteActivity(activityId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${activityId}`);
  }

  downloadAttachment(attachmentName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${attachmentName}`, { 
      responseType: 'blob',
      observe: 'body'
    });
  }

  getActivityById(activityId: number): Observable<Activity> {
    return this.http.get<any>(`${this.apiUrl}/${activityId}`).pipe(
      map(activity => ({
        ...activity,
        assignedMembers: activity.assignedMembers || [],
        attachments: activity.attachments || [],
        links: activity.links || [],
        remarks: activity.remarks || [],
        priority: activity.priority || 'medium',
        createdAt: activity.created_at || activity.createdAt,
        updatedAt: activity.updated_at || activity.updatedAt,
        targetDate: activity.target_date || activity.targetDate,
        createdByName: activity.creatorName || 'Unknown User',
        createdByEmpId: activity.creatorEmpId || 'Unknown Emp ID'
      }))
    );
  }
}
