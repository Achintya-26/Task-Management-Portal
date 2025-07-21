import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../services/team.service';
import { ActivityService } from '../../services/activity.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Team, Activity, User } from '../../models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatTableModule,
    MatMenuModule
  ],
  template: `
    <div class="team-details-container" *ngIf="team">
      <!-- Header -->
      <div class="team-header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        
        <div class="header-content">
          <div class="team-info">
            <h1>{{ team.name }}</h1>
            <p class="team-description">{{ team.description || 'No description available' }}</p>
            <div class="team-meta">
              <mat-chip-listbox>
                <mat-chip>{{ team.members.length }} Members</mat-chip>
                <mat-chip>{{ activities.length }} Activities</mat-chip>
                <mat-chip [class]="'progress-' + getProgressLevel()">
                  {{ getTeamProgress() }}% Complete
                </mat-chip>
              </mat-chip-listbox>
            </div>
          </div>
        </div>

        <div class="header-actions" *ngIf="isAdmin">
          <button mat-raised-button color="primary" (click)="openCreateActivityDialog()">
            <mat-icon>add</mat-icon>
            Add Activity
          </button>
          <button mat-button [matMenuTriggerFor]="teamMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #teamMenu="matMenu">
            <button mat-menu-item (click)="openAddMembersDialog()">
              <mat-icon>person_add</mat-icon>
              <span>Add Members</span>
            </button>
            <button mat-menu-item (click)="openEditTeamDialog()">
              <mat-icon>edit</mat-icon>
              <span>Edit Team</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Content Tabs -->
      <mat-tab-group class="content-tabs">
        <!-- Activities Tab -->
        <mat-tab label="Activities">
          <div class="tab-content">
            <div class="activities-header">
              <h2>Team Activities</h2>
              <div class="activity-filters">
                <button 
                  mat-chip 
                  [class.selected]="selectedStatus === ''"
                  (click)="setStatusFilter('')"
                >
                  All
                </button>
                <button 
                  mat-chip 
                  [class.selected]="selectedStatus === 'pending'"
                  (click)="setStatusFilter('pending')"
                >
                  Pending
                </button>
                <button 
                  mat-chip 
                  [class.selected]="selectedStatus === 'in_progress'"
                  (click)="setStatusFilter('in_progress')"
                >
                  In Progress
                </button>
                <button 
                  mat-chip 
                  [class.selected]="selectedStatus === 'completed'"
                  (click)="setStatusFilter('completed')"
                >
                  Completed
                </button>
                <button 
                  mat-chip 
                  [class.selected]="selectedStatus === 'on_hold'"
                  (click)="setStatusFilter('on_hold')"
                >
                  On Hold
                </button>
              </div>
            </div>

            <div class="activities-list" *ngIf="filteredActivities.length > 0; else noActivities">
              <mat-card 
                *ngFor="let activity of filteredActivities" 
                class="activity-card"
                [routerLink]="['/activities', activity.id]"
              >
                <mat-card-header>
                  <mat-icon mat-card-avatar [class]="'status-icon-' + activity.status">
                    {{ getActivityIcon(activity.status) }}
                  </mat-icon>
                  <mat-card-title>{{ activity.title }}</mat-card-title>
                  <mat-card-subtitle>
                    Created {{ formatDate(activity.createdAt) }}
                    <span *ngIf="activity.targetDate"> • Due {{ formatDate(activity.targetDate) }}</span>
                  </mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <p class="activity-description">{{ activity.description }}</p>
                  
                  <div class="activity-details">
                    <div class="detail-item">
                      <mat-icon>people</mat-icon>
                      <span>{{ getAssignedMembersText(activity.assignedMembers) }}</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>attachment</mat-icon>
                      <span>{{ activity.attachments.length }} attachment(s)</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>comment</mat-icon>
                      <span>{{ activity.remarks.length }} remark(s)</span>
                    </div>
                  </div>

                  <div class="activity-status">
                    <mat-chip [class]="'status-' + activity.status">
                      {{ getStatusLabel(activity.status) }}
                    </mat-chip>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button color="primary" [routerLink]="['/activities', activity.id]">
                    View Details
                  </button>
                  <button 
                    mat-button 
                    *ngIf="canUpdateActivity(activity)" 
                    [matMenuTriggerFor]="activityMenu"
                    (click)="$event.stopPropagation()"
                  >
                    Update Status
                  </button>
                  <mat-menu #activityMenu="matMenu">
                    <button mat-menu-item (click)="updateActivityStatus(activity.id, 'pending')">
                      Mark as Pending
                    </button>
                    <button mat-menu-item (click)="updateActivityStatus(activity.id, 'in_progress')">
                      Mark as In Progress
                    </button>
                    <button mat-menu-item (click)="updateActivityStatus(activity.id, 'completed')">
                      Mark as Completed
                    </button>
                    <button mat-menu-item (click)="updateActivityStatus(activity.id, 'on_hold')">
                      Mark as On Hold
                    </button>
                  </mat-menu>
                </mat-card-actions>
              </mat-card>
            </div>

            <ng-template #noActivities>
              <mat-card class="empty-state">
                <mat-card-content>
                  <mat-icon class="empty-icon">assignment</mat-icon>
                  <h3>No Activities</h3>
                  <p *ngIf="selectedStatus">No activities found with the selected status.</p>
                  <p *ngIf="!selectedStatus">This team doesn't have any activities yet.</p>
                  <button 
                    *ngIf="isAdmin && !selectedStatus" 
                    mat-raised-button 
                    color="primary" 
                    (click)="openCreateActivityDialog()"
                  >
                    Create First Activity
                  </button>
                </mat-card-content>
              </mat-card>
            </ng-template>
          </div>
        </mat-tab>

        <!-- Members Tab -->
        <mat-tab label="Members">
          <div class="tab-content">
            <div class="members-header">
              <h2>Team Members</h2>
              <button 
                *ngIf="isAdmin" 
                mat-raised-button 
                color="primary" 
                (click)="openAddMembersDialog()"
              >
                <mat-icon>person_add</mat-icon>
                Add Member
              </button>
            </div>

            <div class="members-grid">
              <mat-card *ngFor="let member of team.members" class="member-card">
                <mat-card-content>
                  <div class="member-info">
                    <div class="member-avatar">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div class="member-details">
                      <h3>{{ member.name }}</h3>
                      <p class="member-id">{{ member.empId }}</p>
                      <p class="member-joined">Joined {{ formatDate(member.addedAt) }}</p>
                    </div>
                  </div>
                  <div class="member-stats">
                    <div class="stat-item">
                      <span class="stat-label">Assigned Activities</span>
                      <span class="stat-value">{{ getMemberActivityCount(member.userId) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Completed</span>
                      <span class="stat-value">{{ getMemberCompletedCount(member.userId) }}</span>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions *ngIf="isAdmin">
                  <button 
                    mat-button 
                    color="warn" 
                    (click)="removeMember(member.userId)"
                  >
                    Remove
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <div class="loading-state" *ngIf="!team">
      <mat-icon>groups</mat-icon>
      <p>Loading team details...</p>
    </div>
  `,
  styles: [`
    .team-details-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      margin-top: 64px;
    }

    .team-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 32px;
      padding: 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .back-button {
      margin-top: 8px;
    }

    .header-content {
      flex: 1;
    }

    .team-info h1 {
      font-size: 28px;
      font-weight: 400;
      margin: 0 0 8px 0;
      color: #333;
    }

    .team-description {
      font-size: 16px;
      color: #666;
      margin: 0 0 16px 0;
    }

    .team-meta .mat-chip {
      margin-right: 8px;
    }

    .progress-high { background-color: #4caf50; color: white; }
    .progress-medium { background-color: #ff9800; color: white; }
    .progress-low { background-color: #f44336; color: white; }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .content-tabs {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 24px;
    }

    .activities-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .activities-header h2 {
      font-size: 20px;
      font-weight: 400;
      margin: 0;
      color: #333;
    }

    .activity-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .activity-filters button[mat-chip] {
      cursor: pointer;
      transition: all 0.2s;
    }

    .activity-filters button[mat-chip].selected {
      background-color: #2196f3;
      color: white;
    }

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .activity-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .status-icon-pending { color: #ff9800; }
    .status-icon-in_progress { color: #2196f3; }
    .status-icon-completed { color: #4caf50; }
    .status-icon-on_hold { color: #f44336; }

    .activity-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .activity-details {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #666;
    }

    .detail-item mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .activity-status {
      margin-bottom: 8px;
    }

    .status-pending { background-color: #ff9800; color: white; }
    .status-in_progress { background-color: #2196f3; color: white; }
    .status-completed { background-color: #4caf50; color: white; }
    .status-on_hold { background-color: #f44336; color: white; }

    .members-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .members-header h2 {
      font-size: 20px;
      font-weight: 400;
      margin: 0;
      color: #333;
    }

    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .member-card {
      height: 100%;
    }

    .member-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .member-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .member-details h3 {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 4px 0;
      color: #333;
    }

    .member-id {
      font-size: 12px;
      color: #666;
      margin: 0 0 2px 0;
    }

    .member-joined {
      font-size: 11px;
      color: #999;
      margin: 0;
    }

    .member-stats {
      display: flex;
      justify-content: space-between;
    }

    .stat-item {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 11px;
      color: #666;
      margin-bottom: 4px;
    }

    .stat-value {
      display: block;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      background: #fafafa;
    }

    .empty-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 18px;
      font-weight: 400;
      color: #666;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      font-size: 14px;
      color: #999;
      margin: 0 0 24px 0;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #666;
    }

    .loading-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .team-details-container {
        padding: 16px;
      }

      .team-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .activities-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .members-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .members-grid {
        grid-template-columns: 1fr;
      }

      .activity-details {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class TeamDetailsComponent implements OnInit, OnDestroy {
  team: Team | null = null;
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  selectedStatus = '';
  isAdmin = false;
  currentUser: User | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private activityService: ActivityService,
    private authService: AuthService,
    private socketService: SocketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
    
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        const teamId = params['id'];
        if (teamId) {
          this.loadTeamDetails(teamId);
          this.loadActivities(teamId);
          this.setupSocketListeners(teamId);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTeamDetails(teamId: string) {
    this.subscriptions.push(
      this.teamService.getTeamById(teamId).subscribe({
        next: (team) => {
          this.team = team;
        },
        error: (error) => {
          this.snackBar.open('Failed to load team details', 'Close', { duration: 3000 });
          this.router.navigate(['/teams']);
        }
      })
    );
  }

  loadActivities(teamId: string) {
    this.subscriptions.push(
      this.activityService.getActivitiesForTeam(teamId).subscribe(activities => {
        this.activities = activities;
        this.filterActivities();
      })
    );
  }

  setupSocketListeners(teamId: string) {
    this.socketService.joinTeam(teamId);
    
    this.subscriptions.push(
      this.socketService.onActivityCreated().subscribe(() => {
        this.loadActivities(teamId);
      }),
      this.socketService.onActivityUpdated().subscribe(() => {
        this.loadActivities(teamId);
      }),
      this.socketService.onTeamUpdated().subscribe(() => {
        this.loadTeamDetails(teamId);
      })
    );
  }

  filterActivities() {
    if (!this.selectedStatus) {
      this.filteredActivities = this.activities;
    } else {
      this.filteredActivities = this.activities.filter(
        activity => activity.status === this.selectedStatus
      );
    }
  }

  setStatusFilter(status: string) {
    this.selectedStatus = status;
    this.filterActivities();
  }

  getTeamProgress(): number {
    if (this.activities.length === 0) return 0;
    const completedCount = this.activities.filter(a => a.status === 'completed').length;
    return Math.round((completedCount / this.activities.length) * 100);
  }

  getProgressLevel(): string {
    const progress = this.getTeamProgress();
    if (progress >= 70) return 'high';
    if (progress >= 30) return 'medium';
    return 'low';
  }

  getActivityIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'schedule',
      'in_progress': 'play_circle',
      'completed': 'check_circle',
      'on_hold': 'pause_circle'
    };
    return icons[status] || 'help';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'on_hold': 'On Hold'
    };
    return labels[status] || status;
  }

  getAssignedMembersText(assignedMembers: string[]): string {
    if (!this.team) return '';
    
    const memberNames = assignedMembers
      .map(id => this.team!.members.find(m => m.userId === id)?.name)
      .filter(name => name);
    
    if (memberNames.length === 0) return 'No assignees';
    if (memberNames.length === 1) return memberNames[0]!;
    if (memberNames.length <= 3) return memberNames.join(', ');
    return `${memberNames.slice(0, 2).join(', ')} +${memberNames.length - 2} more`;
  }

  getMemberActivityCount(userId: string): number {
    return this.activities.filter(a => a.assignedMembers.includes(userId)).length;
  }

  getMemberCompletedCount(userId: string): number {
    return this.activities.filter(a => 
      a.assignedMembers.includes(userId) && a.status === 'completed'
    ).length;
  }

  canUpdateActivity(activity: Activity): boolean {
    return this.isAdmin || 
           (this.currentUser !== null && activity.assignedMembers.includes(this.currentUser.id));
  }

  updateActivityStatus(activityId: string, status: string) {
    this.subscriptions.push(
      this.activityService.updateActivityStatus(activityId, status).subscribe({
        next: () => {
          this.snackBar.open('Activity status updated', 'Close', { duration: 3000 });
          this.loadActivities(this.team!.id);
        },
        error: (error) => {
          this.snackBar.open('Failed to update activity status', 'Close', { duration: 3000 });
        }
      })
    );
  }

  removeMember(userId: string) {
    if (!this.team) return;
    
    this.subscriptions.push(
      this.teamService.removeMemberFromTeam(this.team.id, userId).subscribe({
        next: () => {
          this.snackBar.open('Member removed from team', 'Close', { duration: 3000 });
          this.loadTeamDetails(this.team!.id);
        },
        error: (error) => {
          this.snackBar.open('Failed to remove member', 'Close', { duration: 3000 });
        }
      })
    );
  }

  goBack() {
    this.router.navigate(['/teams']);
  }

  openCreateActivityDialog() {
    // This would open a dialog to create new activity
    this.snackBar.open('Create activity dialog not implemented yet', 'Close', { duration: 3000 });
  }

  openAddMembersDialog() {
    // This would open a dialog to add members
    this.snackBar.open('Add members dialog not implemented yet', 'Close', { duration: 3000 });
  }

  openEditTeamDialog() {
    // This would open a dialog to edit team
    this.snackBar.open('Edit team dialog not implemented yet', 'Close', { duration: 3000 });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
}
