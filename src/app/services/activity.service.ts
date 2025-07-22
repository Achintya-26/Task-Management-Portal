import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = 'http://localhost:3000/api/activities';

  constructor(private http: HttpClient) {}

  getActivitiesForTeam(teamId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/team/${teamId}`);
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
    return this.http.get<Activity>(`${this.apiUrl}/${activityId}`);
  }
}
