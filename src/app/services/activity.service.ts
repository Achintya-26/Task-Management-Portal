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

  getActivitiesForTeam(teamId: string): Observable<Activity[]> {
    return this.http.get<any[]>(`${this.apiUrl}/team/${teamId}`).pipe(
      map(activities => activities.map(activity => ({
        ...activity,
        assignedMembers: activity.assigned_user_ids || [],
        attachments: activity.attachments || [],
        remarks: activity.remarks || [],
        createdAt: activity.created_at || activity.createdAt,
        updatedAt: activity.updated_at || activity.updatedAt,
        targetDate: activity.target_date || activity.targetDate
      })))
    );
  }

  createActivity(activityData: FormData | any): Observable<any> {
    return this.http.post(this.apiUrl, activityData);
  }

  createActivityWithData(activityData: any): Observable<any> {
    return this.http.post(this.apiUrl, activityData);
  }

  updateActivityStatus(activityId: string, status: string, remarks?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${activityId}/status`, { status, remarks });
  }

  addRemarkToActivity(activityId: string, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${activityId}/remarks`, { text });
  }

  getActivityById(activityId: string): Observable<Activity> {
    return this.http.get<any>(`${this.apiUrl}/${activityId}`).pipe(
      map(activity => ({
        ...activity,
        assignedMembers: activity.assigned_user_ids || [],
        attachments: activity.attachments || [],
        remarks: activity.remarks || [],
        createdAt: activity.created_at || activity.createdAt,
        updatedAt: activity.updated_at || activity.updatedAt,
        targetDate: activity.target_date || activity.targetDate
      }))
    );
  }
}
