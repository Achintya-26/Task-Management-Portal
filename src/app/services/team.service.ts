import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:3000/api/teams';

  constructor(private http: HttpClient) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  createTeam(teamData: { name: string; description: string; domainId: string; initialMembers?: string[] }): Observable<any> {
    return this.http.post(this.apiUrl, teamData);
  }

  getTeamById(teamId: string): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${teamId}`);
  }

  addMembers(teamId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${teamId}/members`, { userIds });
  }

  removeMemberFromTeam(teamId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${teamId}/members/${userId}`);
  }

  deleteTeam(teamId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${teamId}`);
  }
}
