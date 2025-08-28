import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
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
    MatGridListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatRippleModule,
    MatMenuModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Hero Section with Enhanced Header -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="welcome-section">
            <h1 class="hero-title">Welcome back, {{ (authService.currentUser$ | async)?.name || currentUser?.name }}!</h1>
            <p class="hero-subtitle">{{ getGreetingMessage() }}</p>
          </div>
          <!-- <div class="quick-actions">
            <button mat-fab color="primary" matTooltip="Create New Activity" aria-label="Create Activity">
              <mat-icon>add</mat-icon>
            </button>
            <button mat-stroked-button color="primary" [matMenuTriggerFor]="quickMenu">
              <mat-icon>more_vert</mat-icon>
              Quick Actions
            </button>
            <mat-menu #quickMenu="matMenu">
              <button mat-menu-item routerLink="/teams">
                <mat-icon>groups</mat-icon>
                <span>View Teams</span>
              </button>
              <button mat-menu-item routerLink="/activities">
                <mat-icon>assignment</mat-icon>
                <span>View Activities</span>
              </button>
            </mat-menu>
          </div> -->
        </div>
      </div>

      <!-- Enhanced Stats Cards -->
      <div class="stats-section">
        <mat-card class="stat-card teams-card" matRipple>
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <mat-icon class="stat-icon">groups</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{ teams.length }}</h2>
                <p>Active Teams</p>
                <span class="stat-trend positive" *ngIf="teams.length > 0">
                  <mat-icon>trending_up</mat-icon>
                  Active
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card activities-card" matRipple>
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <mat-icon class="stat-icon">assignment</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{ totalActivities }}</h2>
                <p>Total Activities</p>
                <div class="mini-progress">
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="getOverallProgress()"
                    color="accent">
                  </mat-progress-bar>
                  <span class="progress-text">{{ getOverallProgress() }}% Complete</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card pending-card" matRipple>
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <mat-icon class="stat-icon" [matBadge]="pendingActivities > 0 ? pendingActivities : null" 
                          matBadgeColor="warn">schedule</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{ pendingActivities }}</h2>
                <p>Pending Tasks</p>
                <span class="stat-trend" [class.negative]="pendingActivities > 5" [class.positive]="pendingActivities <= 2">
                  <mat-icon>{{ pendingActivities > 5 ? 'warning' : 'check_circle' }}</mat-icon>
                  {{ getPendingStatus() }}
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card completed-card" matRipple>
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <mat-icon class="stat-icon">check_circle</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{ completedActivities }}</h2>
                <p>Completed</p>
                <span class="stat-trend positive">
                  <mat-icon>trending_up</mat-icon>
                  {{ getCompletionRate() }}% Rate
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- My Teams Section with Enhanced Design -->
      <div class="content-section">
        <div class="section-header">
          <div class="section-title">
            <mat-icon class="section-icon">groups</mat-icon>
            <h2>My Teams</h2>
            <mat-chip class="count-chip">{{ teams.length }}</mat-chip>
          </div>
          <button mat-raised-button routerLink="/teams" color="primary">
            View All Teams
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>

        <div class="teams-grid" *ngIf="teams.length > 0; else noTeams">
          <mat-card 
            *ngFor="let team of teams.slice(0, 6)" 
            class="team-card enhanced"
            [routerLink]="['/teams', team.id]"
            matRipple
          >
            <div class="card-header">
              <div class="team-avatar">
                <mat-icon>group</mat-icon>
              </div>
              <div class="team-info">
                <h3>{{ team.name }}</h3>
                <p>{{ team.members?.length || 0 }} members</p>
              </div>
              <div class="team-status">
                <mat-chip class="status-chip active">Active</mat-chip>
              </div>
            </div>
            
            <mat-divider></mat-divider>
            
            <mat-card-content>
              <p class="team-description">{{ team.description || 'No description available' }}</p>
              
              <div class="team-metrics">
                <div class="metric">
                  <span class="metric-label">Progress</span>
                  <div class="progress-container">
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="getTeamProgress(team.id)"
                      color="primary">
                    </mat-progress-bar>
                    <span class="progress-value">{{ getTeamProgress(team.id) }}%</span>
                  </div>
                </div>
                
                <div class="team-stats">
                  <div class="stat-item">
                    <mat-icon class="small-icon">assignment</mat-icon>
                    <span>{{ getTeamActivityCount(team.id) }}</span>
                  </div>
                  <div class="stat-item">
                    <mat-icon class="small-icon">schedule</mat-icon>
                    <span>{{ getTeamPendingCount(team.id) }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <ng-template #noTeams>
          <mat-card class="empty-state enhanced">
            <mat-card-content>
              <div class="empty-content">
                <mat-icon class="empty-icon">groups</mat-icon>
                <h3>No Teams Yet</h3>
                <p>You haven't been added to any teams yet. Contact your admin to get started.</p>
                <button mat-raised-button color="primary" routerLink="/teams">
                  Explore Teams
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </ng-template>
      </div>

      <!-- Recent Activities Section with Timeline Design -->
      <div class="content-section">
        <div class="section-header">
          <div class="section-title">
            <mat-icon class="section-icon">assignment</mat-icon>
            <h2>Recent Activities</h2>
            <mat-chip class="count-chip">{{ recentActivities.length }}</mat-chip>
          </div>
        </div>

        <div class="activities-timeline" *ngIf="recentActivities.length > 0; else noActivities">
          <div 
            *ngFor="let activity of recentActivities.slice(0, 8); let i = index" 
            class="activity-item"
            [routerLink]="['/activities', activity.id]"
            matRipple
          >
            <div class="timeline-marker">
              <div class="marker-dot" [class]="'status-' + activity.status"></div>
              <div class="marker-line" *ngIf="i < recentActivities.slice(0, 8).length - 1"></div>
            </div>
            
            <mat-card class="activity-card enhanced">
              <mat-card-content>
                <div class="activity-header">
                  <h4>{{ activity.name }}</h4>
                  <div class="activity-badges">
                    <mat-chip class="priority-chip" [class]="'priority-' + (activity.priority || 'medium')">
                      {{ getPriorityLabel(activity.priority) }}
                    </mat-chip>
                    <mat-chip class="status-chip" [class]="'status-' + activity.status">
                      {{ getStatusLabel(activity.status) }}
                    </mat-chip>
                  </div>
                </div>
                
                <p class="activity-description">{{ activity.description }}</p>
                
                <div class="activity-footer">
                  <div class="activity-meta">
                    <span class="due-date" [class]="getDueDateClass(activity.targetDate)">
                      <mat-icon class="small-icon">schedule</mat-icon>
                      {{ formatDate(activity.targetDate) }}
                    </span>
                    <span class="team-name">
                      <mat-icon class="small-icon">group</mat-icon>
                      {{ getTeamName(activity.teamId) }}
                    </span>
                  </div>
                  
                  <div class="activity-actions">
                    <button mat-icon-button matTooltip="View Details" (click)="$event.stopPropagation()">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <ng-template #noActivities>
          <mat-card class="empty-state enhanced">
            <mat-card-content>
              <div class="empty-content">
                <mat-icon class="empty-icon">assignment</mat-icon>
                <h3>No Activities Yet</h3>
                <p>No activities have been assigned to you yet.</p>
                <button mat-raised-button color="primary" routerLink="/activities">
                  Browse Activities
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      margin-top: 64px;
      background: #f8f9fa;
      min-height: calc(100vh - 64px);
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 48px 32px;
      border-radius: 16px;
      margin-bottom: 32px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .welcome-section {
      flex: 1;
    }

    .hero-title {
      font-size: 36px;
      font-weight: 300;
      margin: 0 0 12px 0;
    }

    .hero-subtitle {
      font-size: 18px;
      opacity: 0.9;
      margin: 0;
    }

    .quick-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    /* Enhanced Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .stat-card.teams-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-card.activities-card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-card.pending-card {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-card.completed-card {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 8px;
    }

    .stat-icon-wrapper {
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-info h2 {
      font-size: 42px;
      font-weight: 300;
      margin: 0 0 4px 0;
    }

    .stat-info p {
      font-size: 14px;
      margin: 0 0 8px 0;
      opacity: 0.9;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      opacity: 0.9;
    }

    .stat-trend mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .stat-trend.positive {
      color: #4caf50;
    }

    .stat-trend.negative {
      color: #f44336;
    }

    .mini-progress {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .mini-progress mat-progress-bar {
      flex: 1;
      height: 4px;
      border-radius: 2px;
    }

    .progress-text {
      font-size: 11px;
      opacity: 0.8;
      white-space: nowrap;
    }

    /* Content Sections */
    .content-section {
      margin-bottom: 40px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      background: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      color: #666eea;
      font-size: 24px;
      height: 24px;
      width: 24px;
    }

    .section-title h2 {
      font-size: 24px;
      font-weight: 500;
      margin: 0;
      color: #333;
    }

    .count-chip {
      background: #e3f2fd;
      color: #1976d2;
      font-size: 12px;
      font-weight: 500;
    }

    /* Enhanced Teams Grid */
    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .team-card.enhanced {
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid #e0e0e0;
    }

    .team-card.enhanced:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.1);
      border-color: #667eea;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px 16px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .team-avatar {
      background: #667eea;
      color: white;
      border-radius: 50%;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .team-info {
      flex: 1;
    }

    .team-info h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #333;
    }

    .team-info p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .status-chip {
      font-size: 11px;
      height: 24px;
    }

    .status-chip.active {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .team-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 20px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .team-metrics {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .metric-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .progress-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-container mat-progress-bar {
      flex: 1;
      height: 6px;
      border-radius: 3px;
    }

    .progress-value {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      min-width: 35px;
    }

    .team-stats {
      display: flex;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #666;
    }

    .small-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    /* Activities Timeline */
    .activities-timeline {
      display: flex;
      flex-direction: column;
      gap: 24px;
      position: relative;
    }

    .activity-item {
      display: flex;
      gap: 20px;
      cursor: pointer;
    }

    .timeline-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .marker-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .marker-dot.status-pending {
      background: #ff9800;
    }

    .marker-dot.status-in-progress {
      background: #2196f3;
    }

    .marker-dot.status-completed {
      background: #4caf50;
    }

    .marker-dot.status-on-hold {
      background: #f44336;
    }

    .marker-line {
      width: 2px;
      height: 60px;
      background: #e0e0e0;
      margin-top: 8px;
    }

    .activity-card.enhanced {
      flex: 1;
      border-radius: 12px;
      transition: all 0.3s ease;
      border: 1px solid #e0e0e0;
    }

    .activity-card.enhanced:hover {
      transform: translateX(8px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border-color: #667eea;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .activity-header h4 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: #333;
      flex: 1;
      margin-right: 16px;
    }

    .activity-badges {
      display: flex;
      gap: 8px;
    }

    .priority-chip {
      font-size: 10px;
      height: 20px;
    }

    .priority-chip.priority-high {
      background: #ffebee;
      color: #c62828;
    }

    .priority-chip.priority-medium {
      background: #fff3e0;
      color: #ef6c00;
    }

    .priority-chip.priority-low {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .activity-description {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
      margin: 0 0 16px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .activity-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activity-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .due-date, .team-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #666;
    }

    .due-date.overdue {
      color: #f44336;
    }

    .due-date.due-soon {
      color: #ff9800;
    }

    .due-date.due-later {
      color: #4caf50;
    }

    .activity-actions button {
      color: #667eea;
    }

    /* Status Chips */
    .status-chip {
      font-size: 11px;
      height: 24px;
    }

    .status-pending { 
      background-color: #fff3e0; 
      color: #ef6c00; 
    }
    
    .status-in-progress { 
      background-color: #e3f2fd; 
      color: #1976d2; 
    }
    
    .status-completed { 
      background-color: #e8f5e8; 
      color: #2e7d2e; 
    }
    
    .status-on-hold { 
      background-color: #ffebee; 
      color: #c62828; 
    }

    /* Empty States */
    .empty-state.enhanced {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 2px dashed #dee2e6;
      border-radius: 16px;
      text-align: center;
      padding: 60px 40px;
    }

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .empty-icon {
      font-size: 72px;
      height: 72px;
      width: 72px;
      color: #adb5bd;
      margin-bottom: 8px;
    }

    .empty-content h3 {
      font-size: 20px;
      font-weight: 500;
      color: #495057;
      margin: 0;
    }

    .empty-content p {
      font-size: 14px;
      color: #6c757d;
      margin: 0 0 24px 0;
      max-width: 300px;
      line-height: 1.5;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
        margin-top: 56px;
      }

      .hero-content {
        flex-direction: column;
        text-align: center;
        gap: 32px;
      }

      .hero-title {
        font-size: 28px;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .teams-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        padding: 16px 20px;
      }

      .activity-item {
        gap: 12px;
      }

      .timeline-marker {
        margin-top: 8px;
      }

      .marker-line {
        height: 40px;
      }
    }

    @media (max-width: 480px) {
      .stats-section {
        grid-template-columns: 1fr;
      }

      .hero-section {
        padding: 32px 24px;
      }

      .quick-actions {
        flex-direction: column;
        width: 100%;
        gap: 12px;
      }

      .activity-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .activity-badges {
        align-self: flex-end;
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

  getGreetingMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning! Ready to tackle your tasks?';
    } else if (hour < 17) {
      return 'Good afternoon! Keep up the great work!';
    } else {
      return 'Good evening! Time to wrap up your day.';
    }
  }

  getOverallProgress(): number {
    if (this.totalActivities === 0) return 0;
    return Math.round((this.completedActivities / this.totalActivities) * 100);
  }

  getPendingStatus(): string {
    if (this.pendingActivities === 0) return 'All caught up!';
    if (this.pendingActivities <= 2) return 'Under control';
    if (this.pendingActivities <= 5) return 'Getting busy';
    return 'High workload';
  }

  getCompletionRate(): number {
    if (this.totalActivities === 0) return 0;
    return Math.round((this.completedActivities / this.totalActivities) * 100);
  }

  getTeamActivityCount(teamId: string): number {
    return this.activities.filter(a => a.teamId === teamId).length;
  }

  getTeamPendingCount(teamId: string): number {
    return this.activities.filter(a => a.teamId === teamId && a.status === 'pending').length;
  }

  getTeamName(teamId: string): string {
    const team = this.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  }

  getDueDateClass(targetDate: string | null): string {
    if (!targetDate) return 'due-later';
    
    const due = new Date(targetDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'due-soon';
    return 'due-later';
  }

  loadDashboardData() {
    // Load teams first, then activities for each team
    this.subscriptions.push(
      this.teamService.getUserTeams().subscribe(teams => {
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

  getPriorityLabel(priority: string | undefined): string {
    const labels: { [key: string]: string } = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent'
    };
    return labels[priority || 'medium'] || 'Medium';
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
    // Disabled Socket.IO - using WebSocket notifications instead
    // this.socketService.connect();
    
    // Join all user teams for real-time updates
    // this.teams.forEach(team => {
    //   this.socketService.joinTeam(team.id);
    // });

    // Listen for real-time updates - now handled by NotificationService WebSocket
    // this.subscriptions.push(
    //   this.socketService.onActivityCreated().subscribe(() => {
    //     this.loadDashboardData();
    //   }),
    //   this.socketService.onActivityUpdated().subscribe(() => {
    //     this.loadDashboardData();
    //   }),
    //   this.socketService.onTeamUpdated().subscribe(() => {
    //     this.loadDashboardData();
    //   })
    // );
  }
}
