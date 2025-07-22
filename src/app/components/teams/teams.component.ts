import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { ActivityService } from '../../services/activity.service';
import { AuthService } from '../../services/auth.service';
import { Team, Activity } from '../../models';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="teams-container">
      <div class="teams-header">
        <div class="header-content">
          <h1>My Teams</h1>
          <p class="subtitle">Manage your team activities and collaboration</p>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search teams</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="filterTeams()" placeholder="Search by name...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <div class="teams-grid" *ngIf="filteredTeams.length > 0; else noTeams">
        <mat-card 
          *ngFor="let team of filteredTeams" 
          class="team-card"
          [routerLink]="['/teams', team.id]"
        >
          <mat-card-header>
            <div class="team-avatar" mat-card-avatar>
              <mat-icon>group</mat-icon>
            </div>
            <mat-card-title>{{ team.name }}</mat-card-title>
            <mat-card-subtitle>{{ team.members?.length || 0 }} member{{ (team.members?.length || 0) !== 1 ? 's' : '' }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="team-description">
              {{ team.description || 'No description available' }}
            </p>

            <div class="team-stats">
              <div class="stat-item">
                <mat-icon>assignment</mat-icon>
                <span>{{ getTeamActivityCount(team.id) }} activities</span>
              </div>
              <div class="stat-item">
                <mat-icon>schedule</mat-icon>
                <span>{{ getPendingCount(team.id) }} pending</span>
              </div>
            </div>

            <div class="team-progress">
              <div class="progress-header">
                <span class="progress-label">Progress</span>
                <span class="progress-value">{{ getTeamProgress(team.id) }}%</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="getTeamProgress(team.id)"
                [color]="getProgressColor(getTeamProgress(team.id))">
              </mat-progress-bar>
            </div>

            <div class="team-members">
              <div class="members-header">
                <span>Members:</span>
              </div>
              <div class="members-list">
                <mat-chip-listbox>
                  <mat-chip 
                    *ngFor="let member of team.members?.slice(0, 3) || []"
                    class="member-chip"
                  >
                    {{ member.name }}
                  </mat-chip>
                  <mat-chip 
                    *ngIf="(team.members?.length || 0) > 3"
                    class="more-chip"
                  >
                    +{{ (team.members?.length || 0) - 3 }} more
                  </mat-chip>
                </mat-chip-listbox>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button 
              mat-button 
              color="primary"
              [routerLink]="['/teams', team.id]"
              (click)="$event.stopPropagation()"
            >
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
            <div class="last-updated">
              Updated {{ formatDate(team.updatedAt) }}
            </div>
          </mat-card-actions>
        </mat-card>
      </div>

      <ng-template #noTeams>
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon class="empty-icon">groups</mat-icon>
            <h2>No Teams Found</h2>
            <p *ngIf="searchQuery">
              No teams match your search criteria. Try a different search term.
            </p>
            <p *ngIf="!searchQuery">
              You haven't been added to any teams yet. Contact your admin to get started.
            </p>
            <button 
              *ngIf="searchQuery" 
              mat-button 
              color="primary" 
              (click)="clearSearch()"
            >
              Clear Search
            </button>
          </mat-card-content>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .teams-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      margin-top: 64px;
    }

    .teams-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 24px;
    }

    .header-content h1 {
      font-size: 32px;
      font-weight: 300;
      margin: 0 0 8px 0;
      color: #333;
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .search-field {
      min-width: 300px;
    }

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .team-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .team-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .team-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 40px;
      height: 40px;
    }

    .team-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 40px;
    }

    .team-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #666;
    }

    .stat-item mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .team-progress {
      margin-bottom: 16px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .progress-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .progress-value {
      font-size: 12px;
      color: #333;
      font-weight: 500;
    }

    .team-members {
      margin-bottom: 8px;
    }

    .members-header {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .members-list {
      overflow: hidden;
    }

    .member-chip {
      font-size: 11px;
      height: 24px;
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .more-chip {
      font-size: 11px;
      height: 24px;
      background-color: #f5f5f5;
      color: #666;
    }

    mat-card-content {
      flex: 1;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .last-updated {
      font-size: 11px;
      color: #999;
    }

    .empty-state {
      text-align: center;
      padding: 64px 24px;
      background: #fafafa;
    }

    .empty-icon {
      font-size: 80px;
      height: 80px;
      width: 80px;
      color: #ddd;
      margin-bottom: 24px;
    }

    .empty-state h2 {
      font-size: 24px;
      font-weight: 300;
      color: #666;
      margin: 0 0 16px 0;
    }

    .empty-state p {
      font-size: 14px;
      color: #999;
      margin: 0 0 24px 0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (max-width: 768px) {
      .teams-container {
        padding: 16px;
      }

      .teams-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .search-field {
        min-width: auto;
        width: 100%;
      }

      .teams-grid {
        grid-template-columns: 1fr;
      }

      .team-stats {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class TeamsComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  activities: Activity[] = [];
  searchQuery = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private teamService: TeamService,
    private activityService: ActivityService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTeams();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTeams() {
    this.subscriptions.push(
      this.teamService.getTeams().subscribe(teams => {
        this.teams = teams;
        this.filteredTeams = teams;
        this.loadActivitiesForTeams();
      })
    );
  }

  loadActivitiesForTeams() {
    if (this.teams.length === 0) {
      return;
    }

    const activityRequests = this.teams.map(team => 
      this.activityService.getActivitiesForTeam(team.id)
    );

    this.subscriptions.push(
      forkJoin(activityRequests).subscribe(activitiesArrays => {
        this.activities = activitiesArrays.flat();
      })
    );
  }

  filterTeams() {
    if (!this.searchQuery.trim()) {
      this.filteredTeams = this.teams;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredTeams = this.teams.filter(team => 
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query) ||
      team.members?.some(member => member.name.toLowerCase().includes(query)) || false
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterTeams();
  }

  getTeamActivityCount(teamId: string): number {
    return this.activities.filter(activity => activity.teamId === teamId).length;
  }

  getPendingCount(teamId: string): number {
    return this.activities.filter(activity => 
      activity.teamId === teamId && activity.status === 'pending'
    ).length;
  }

  getTeamProgress(teamId: string): number {
    const teamActivities = this.activities.filter(activity => activity.teamId === teamId);
    if (teamActivities.length === 0) return 0;
    
    const completedCount = teamActivities.filter(activity => activity.status === 'completed').length;
    return Math.round((completedCount / teamActivities.length) * 100);
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'primary';
    if (progress >= 50) return 'accent';
    return 'warn';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
}
