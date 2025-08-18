import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../services/auth.service';
import { TeamService } from '../../services/team.service';
import { ActivityService } from '../../services/activity.service';
import { SocketService } from '../../services/socket.service';
import { Team, Activity, User } from '../../models';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Welcome back, {{ (authService.currentUser$ | async)?.name || currentUser?.name }}!</h1>
        <p class="subtitle">Here's an overview of your tasks and teams</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon teams">groups</mat-icon>
              <div class="stat-info">
                <h2>{{ teams.length }}</h2>
                <p>Teams</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon activities">assignment</mat-icon>
              <div class="stat-info">
                <h2>{{ totalActivities }}</h2>
                <p>Total Activities</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon pending">schedule</mat-icon>
              <div class="stat-info">
                <h2>{{ pendingActivities }}</h2>
                <p>Pending</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon completed">check_circle</mat-icon>
              <div class="stat-info">
                <h2>{{ completedActivities }}</h2>
                <p>Completed</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- My Teams -->
      <div class="section">
        <div class="section-header">
          <h2>My Teams</h2>
          <button mat-button routerLink="/teams" color="primary">
            View All
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>

        <div class="teams-grid" *ngIf="teams.length > 0; else noTeams">
          <mat-card 
            *ngFor="let team of teams.slice(0, 4)" 
            class="team-card"
            [routerLink]="['/teams', team.id]"
          >
            <mat-card-header>
              <mat-icon mat-card-avatar>group</mat-icon>
              <mat-card-title>{{ team.name }}</mat-card-title>
              <mat-card-subtitle>{{ team.members?.length || 0 }} members</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="team-description">{{ team.description || 'No description available' }}</p>
              <div class="team-progress">
                <span class="progress-label">Team Progress</span>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="getTeamProgress(team.id)"
                  color="primary">
                </mat-progress-bar>
                <span class="progress-value">{{ getTeamProgress(team.id) }}%</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <ng-template #noTeams>
          <mat-card class="empty-state">
            <mat-card-content>
              <mat-icon class="empty-icon">groups</mat-icon>
              <h3>No Teams Yet</h3>
              <p>You haven't been added to any teams yet. Contact your admin to get started.</p>
            </mat-card-content>
          </mat-card>
        </ng-template>
      </div>

      <!-- Recent Activities -->
      <div class="section">
        <div class="section-header">
          <h2>My Recent Activities</h2>
        </div>

        <div class="activities-list" *ngIf="recentActivities.length > 0; else noActivities">
          <mat-card 
            *ngFor="let activity of recentActivities.slice(0, 5)" 
            class="activity-card"
            [routerLink]="['/activities', activity.id]"
          >
            <mat-card-content>
              <div class="activity-content">
                <div class="activity-main">
                  <h3>{{ activity.name }}</h3>
                  <p class="activity-description">{{ activity.description }}</p>
                  <div class="activity-meta">
                    <mat-chip [class]="'status-' + activity.status">
                      {{ getStatusLabel(activity.status) }}
                    </mat-chip>
                    <span class="activity-date">
                      Due: {{ formatDate(activity.targetDate) }}
                    </span>
                  </div>
                </div>
                <div class="activity-actions">
                  <mat-icon class="activity-icon">assignment</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <ng-template #noActivities>
          <mat-card class="empty-state">
            <mat-card-content>
              <mat-icon class="empty-icon">assignment</mat-icon>
              <h3>No Activities Yet</h3>
              <p>No activities have been assigned to you yet.</p>
            </mat-card-content>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      margin-top: 64px;
    }

    .dashboard-header {
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
    }

    .stat-icon.teams { color: #2196f3; }
    .stat-icon.activities { color: #ff9800; }
    .stat-icon.pending { color: #f44336; }
    .stat-icon.completed { color: #4caf50; }

    .stat-info h2 {
      font-size: 36px;
      font-weight: 300;
      margin: 0;
      color: #333;
    }

    .stat-info p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h2 {
      font-size: 24px;
      font-weight: 400;
      margin: 0;
      color: #333;
    }

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .team-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .team-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .team-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .team-progress {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-label {
      font-size: 12px;
      color: #666;
      min-width: 80px;
    }

    .progress-value {
      font-size: 12px;
      color: #666;
      min-width: 30px;
    }

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .activity-card:hover {
      transform: translateX(4px);
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    }

    .activity-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activity-main {
      flex: 1;
    }

    .activity-main h3 {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 4px 0;
      color: #333;
    }

    .activity-description {
      font-size: 14px;
      color: #666;
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .activity-date {
      font-size: 12px;
      color: #666;
    }

    .activity-icon {
      color: #666;
    }

    .status-pending { background-color: #ff9800; color: white; }
    .status-in-progress { background-color: #2196f3; color: white; }
    .status-completed { background-color: #4caf50; color: white; }
    .status-on-hold { background-color: #f44336; color: white; }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      background: #fafafa;
    }

    .empty-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 20px;
      font-weight: 400;
      color: #666;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      font-size: 14px;
      color: #999;
      margin: 0;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .teams-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  teams: Team[] = [];
  activities: Activity[] = [];
  recentActivities: Activity[] = [];
  totalActivities = 0;
  pendingActivities = 0;
  completedActivities = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private teamService: TeamService,
    private activityService: ActivityService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
    
    this.loadDashboardData();
    this.setupSocketListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDashboardData() {
    // Load teams first, then activities for each team
    this.subscriptions.push(
      this.teamService.getTeams().subscribe(teams => {
        this.teams = teams;
        this.loadActivitiesForTeams();
      })
    );
  }

  loadActivitiesForTeams() {
    if (this.teams.length === 0) {
      return;
    }

    const activityRequests = this.teams.map(team => 
      this.activityService.getActivitiesForTeam(parseInt(team.id))
    );

    this.subscriptions.push(
      forkJoin(activityRequests).subscribe(activitiesArrays => {
        this.activities = activitiesArrays.flat();
        this.calculateStats();
        this.loadRecentActivities();
      })
    );
  }

  calculateStats() {
    this.totalActivities = this.activities.length;
    this.pendingActivities = this.activities.filter(a => a.status === 'pending').length;
    this.completedActivities = this.activities.filter(a => a.status === 'completed').length;
  }

  loadRecentActivities() {
    const currentUserId = this.currentUser?.id;
    if (!currentUserId) return;

    this.recentActivities = this.activities
      .filter(activity => activity.assignedMembers?.map(m => m.id).includes(currentUserId) || false)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTeamProgress(teamId: string): number {
    const teamActivities = this.activities.filter(a => a.teamId === teamId);
    if (teamActivities.length === 0) return 0;
    
    const completedCount = teamActivities.filter(a => a.status === 'completed').length;
    return Math.round((completedCount / teamActivities.length) * 100);
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'on-hold': 'On Hold'
    };
    return statusLabels[status] || status;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  }

  setupSocketListeners() {
    this.socketService.connect();
    
    // Join all user teams for real-time updates
    this.teams.forEach(team => {
      this.socketService.joinTeam(team.id);
    });

    // Listen for real-time updates
    this.subscriptions.push(
      this.socketService.onActivityCreated().subscribe(() => {
        this.loadDashboardData();
      }),
      this.socketService.onActivityUpdated().subscribe(() => {
        this.loadDashboardData();
      }),
      this.socketService.onTeamUpdated().subscribe(() => {
        this.loadDashboardData();
      })
    );
  }
}
