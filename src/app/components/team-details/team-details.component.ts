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
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../services/team.service';
import { ActivityService } from '../../services/activity.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Team, Activity, User } from '../../models';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AddMembersDialogComponent } from '../dialogs/add-members-dialog/add-members-dialog.component';
import { CreateActivityDialogComponent } from '../dialogs/create-activity-dialog/create-activity-dialog.component';

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
                <mat-chip>{{ team.members?.length || 0 }} Members</mat-chip>
                <mat-chip>{{ activities.length }} Activities</mat-chip>
                <mat-chip [class]="'progress-' + getProgressLevel()">
                  {{ getTeamProgress() }}% Complete
                </mat-chip>
              </mat-chip-listbox>
            </div>
          </div>
        </div>

        <div class="header-actions" *ngIf="canCreateActivity$ | async">
          <button mat-raised-button color="primary" (click)="openCreateActivityDialog()">
            <mat-icon>add</mat-icon>
            Add Activity
          </button>
          <button mat-button [matMenuTriggerFor]="teamMenu" *ngIf="isAdmin$ | async">
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
                  [class.selected]="selectedStatus === 'in-progress'"
                  (click)="setStatusFilter('in-progress')"
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
                  [class.selected]="selectedStatus === 'on-hold'"
                  (click)="setStatusFilter('on-hold')"
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
                  <mat-card-title>{{ activity.name }}</mat-card-title>
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
                      <span>{{ getAttachmentsCount(activity) }} attachment(s)</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>comment</mat-icon>
                      <span>{{ getRemarksCount(activity) }} remark(s)</span>
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
                    *ngIf="canEditActivity(activity)" 
                    (click)="openEditActivityDialog(activity); $event.stopPropagation()"
                  >
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button 
                    mat-button 
                    color="warn"
                    *ngIf="canEditActivity(activity)" 
                    (click)="deleteActivity(activity); $event.stopPropagation()"
                  >
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                  <button 
                    mat-button 
                    *ngIf="canUpdateActivitySync(activity)" 
                    [matMenuTriggerFor]="activityMenu"
                    (click)="$event.stopPropagation()"
                  >
                    Update Status
                  </button>
                  <mat-menu #activityMenu="matMenu">
                    <button mat-menu-item (click)="updateActivityStatus(activity.id, 'pending')">
                      Mark as Pending
                    </button>
                    <button mat-menu-item (click)="updateActivityStatus(activity.id, 'in-progress')">
                      Mark as In Progress
                    </button>
                    <button mat-menu-item (click)="updateActivityStatus(activity.id, 'completed')">
                      Mark as Completed
                    </button>
                    <button mat-menu-item (click)="updateActivityStatus(activity.id, 'on-hold')">
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
                    *ngIf="(canCreateActivity$ | async) && !selectedStatus" 
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
                *ngIf="isAdmin$ | async" 
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
                <mat-card-actions *ngIf="isAdmin$ | async">
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

    <div class="loading-state" *ngIf="!team && isLoading">
      <mat-icon>groups</mat-icon>
      <p>Loading team details...</p>
    </div>

    <div class="error-state" *ngIf="!team && !isLoading">
      <mat-icon>error</mat-icon>
      <p>Failed to load team details</p>
      <button mat-raised-button color="primary" (click)="goBack()">
        Go Back to Teams
      </button>
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
    .status-icon-in-progress { color: #2196f3; }
    .status-icon-completed { color: #4caf50; }
    .status-icon-on-hold { color: #f44336; }

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
    .status-in-progress { background-color: #2196f3; color: white; }
    .status-completed { background-color: #4caf50; color: white; }
    .status-on-hold { background-color: #f44336; color: white; }

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
  isAdmin$: Observable<boolean>;
  canCreateActivity$: Observable<boolean>;
  currentUser: User | null = null;
  isAdminUser = false;
  private subscriptions: Subscription[] = [];
  private currentTeamId: string | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private activityService: ActivityService,
    private authService: AuthService,
    private socketService: SocketService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.isAdmin$ = this.authService.isAdmin();
    this.canCreateActivity$ = this.isTeamMember();
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Set isAdminUser for synchronous access
    this.subscriptions.push(
      this.isAdmin$.subscribe(isAdmin => {
        this.isAdminUser = isAdmin;
      })
    );
    
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        const teamId = params['id'];
        if (teamId) {
          // Reset component state
          this.resetComponentState();
          
          // Load fresh data
          this.loadTeamDetails(teamId);
          this.loadActivities(teamId);
          this.setupSocketListeners(teamId);
        }
      })
    );
  }

  ngOnDestroy() {
    // Leave current team room if any - disabled, using WebSocket now
    // if (this.currentTeamId) {
    //   this.socketService.leaveTeam(this.currentTeamId);
    // }
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];
  }

  resetComponentState() {
    this.team = null;
    this.activities = [];
    this.filteredActivities = [];
    this.selectedStatus = '';
    this.isLoading = false;
  }

  loadTeamDetails(teamId: string) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.subscriptions.push(
      this.teamService.getTeamById(teamId).subscribe({
        next: (team) => {
          this.team = team;
          console.log("Team is :::", team);
          this.isLoading = false;
          console.log('Team loaded successfully:', team);
          console.log('Team members structure:', team.members);
        },
        error: (error) => {
          console.error('Error loading team details:', error);
          this.isLoading = false;
          this.snackBar.open('Failed to load team details', 'Close', { duration: 3000 });
          this.router.navigate(['/teams']);
        }
      })
    );
  }

  loadActivities(teamId: string) {
    this.subscriptions.push(
      this.activityService.getActivitiesForTeam(parseInt(teamId)).subscribe({
        next: (activities) => {
          // activities = activities.map(activity => ({ ...activity, userId: activity.userId }));
          console.log('Raw activities response:', activities);
          this.activities = activities || [];
          this.filterActivities();
          console.log('Activities loaded successfully:', activities?.length || 0, 'activities');
          if (activities && activities.length > 0) {
            console.log('Sample activity structure:', activities[0]);
          }
        },
        error: (error) => {
          console.error('Error loading activities:', error);
          this.activities = [];
          this.filteredActivities = [];
          this.snackBar.open('Failed to load activities', 'Close', { duration: 3000 });
        }
      })
    );
  }

  setupSocketListeners(teamId: string) {
    // Leave previous team room if any - disabled, using WebSocket now
    // if (this.currentTeamId && this.currentTeamId !== teamId) {
    //   this.socketService.leaveTeam(this.currentTeamId);
    // }
    
    // Join new team room - disabled, using WebSocket notifications now
    this.currentTeamId = teamId;
    // this.socketService.joinTeam(teamId);
    
    // Set up listeners (only once per team) - now handled by NotificationService
    // this.subscriptions.push(
    //   this.socketService.onActivityCreated().subscribe(() => {
    //     console.log('Activity created event received');
    //     this.loadActivities(teamId);
    //   }),
    //   this.socketService.onActivityUpdated().subscribe(() => {
    //     console.log('Activity updated event received');
    //     this.loadActivities(teamId);
    //   }),
    //   this.socketService.onTeamUpdated().subscribe(() => {
    //     console.log('Team updated event received');
    //     this.loadTeamDetails(teamId);
    //   })
    // );
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
      'in-progress': 'play_circle',
      'completed': 'check_circle',
      'on-hold': 'pause_circle'
    };
    return icons[status] || 'help';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'on-hold': 'On Hold'
    };
    return labels[status] || status;
  }

  getAssignedMembersText(assignedUsers: Activity["assignedMembers"] | string | undefined): string {
    console.log('getAssignedMembersText - assignedUsers:', assignedUsers);
    console.log('getAssignedMembersText - team members:', this.team?.members);
    
    if (!this.team || !assignedUsers) return 'No assignees';
    
    // Handle both array and comma-separated string formats
    let memberIds: string[] = [];
    if (Array.isArray(assignedUsers)) {
      memberIds = assignedUsers.map(m => m.id);
    } else if (typeof assignedUsers === 'string') {
      memberIds = assignedUsers.split(',').map(id => id.trim()).filter(id => id);
    }
    
    console.log('Extracted member IDs:', memberIds);
    
    if (memberIds.length === 0) return 'No assignees';
    
    // Look up members by their user ID (which matches the assigned user IDs)
    console.log("-------|||||-------",this.team!.members);
    const memberNames = memberIds
      .map(id => {
        const member = this.team!.members?.find(m => m.id === id);
        console.log(`Looking for ID ${id}, found member:`, member);
        return member?.name;
      })
      .filter(name => name);
    
    console.log('Found member names:', memberNames);
    
    if (memberNames.length === 0) return 'No assignees';
    if (memberNames.length === 1) return memberNames[0]!;
    if (memberNames.length <= 3) return memberNames.join(', ');
    return `${memberNames.slice(0, 2).join(', ')} +${memberNames.length - 2} more`;
  }

  getMemberActivityCount(userId: string): number {
    return this.activities.filter(a => {
      // Handle assignedMembers which might come as array or comma-separated string from DB
      let assignedIds: string[] = [];
      if (Array.isArray(a.assignedMembers)) {
        assignedIds = a.assignedMembers.map(m => m.id);
      } else if (a.assignedMembers && typeof a.assignedMembers === 'string') {
        assignedIds = (a.assignedMembers as any).split(',').map((id: string) => id.trim());
      } else if (a.assignedMembers) {
        // Handle other possible formats
        assignedIds = String(a.assignedMembers).split(',').map((id: string) => id.trim());
      }
      return assignedIds.includes(userId);
    }).length;
  }

  getMemberCompletedCount(userId: string): number {
    return this.activities.filter(a => {
      // Handle assignedMembers which might come as array or comma-separated string from DB
      let assignedIds: string[] = [];
      if (Array.isArray(a.assignedMembers)) {
        assignedIds = a.assignedMembers.map(m => m.id);
      } else if (a.assignedMembers && typeof a.assignedMembers === 'string') {
        assignedIds = (a.assignedMembers as any).split(',').map((id: string) => id.trim());
      } else if (a.assignedMembers) {
        // Handle other possible formats
        assignedIds = String(a.assignedMembers).split(',').map((id: string) => id.trim());
      }
      return assignedIds.includes(userId) && a.status === 'completed';
    }).length;
  }

  canUpdateActivity(activity: Activity): Observable<boolean> {
    return this.isAdmin$.pipe(
      map(isAdmin => {
        if (isAdmin) return true;
        if (!this.currentUser) return false;
        
        // Handle assignedMembers which might come as array or comma-separated string from DB
        let assignedIds: string[] = [];
        if (Array.isArray(activity.assignedMembers)) {
          assignedIds = activity.assignedMembers.map(m => m.id);
        } else if (activity.assignedMembers && typeof activity.assignedMembers === 'string') {
          assignedIds = (activity.assignedMembers as any).split(',').map((id: string) => id.trim());
        } else if (activity.assignedMembers) {
          assignedIds = String(activity.assignedMembers).split(',').map((id: string) => id.trim());
        }
        
        return assignedIds.includes(this.currentUser.id);
      })
    );
  }

  canEditActivity(activity: Activity): boolean {
    if (!this.currentUser) return false;
    
    // Admin can edit any activity, or the creator can edit their own activity
    return this.isAdminUser || activity.createdBy === this.currentUser.id;
  }

  deleteActivity(activity: Activity) {
    if (!this.canEditActivity(activity)) return;

    const confirmMessage = `Are you sure you want to delete the activity "${activity.name}"? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.subscriptions.push(
      this.activityService.deleteActivity(parseInt(activity.id)).subscribe({
        next: (response: any) => {
          this.snackBar.open('Activity deleted successfully', 'Close', { duration: 3000 });
          // Refresh the activities list
          this.loadActivities(this.team!.id);
        },
        error: (error: any) => {
          console.error('Failed to delete activity:', error);
          this.snackBar.open('Failed to delete activity', 'Close', { duration: 3000 });
        }
      })
    );
  }

  canUpdateActivitySync(activity: Activity): boolean {
    if (!this.currentUser) return false;
    
    // Admin can update any activity
    if (this.isAdminUser) return true;
    
    // Handle assignedMembers which might come as array or comma-separated string from DB
    let assignedIds: string[] = [];
    if (Array.isArray(activity.assignedMembers)) {
      assignedIds = activity.assignedMembers.map(m => m.id);
    } else if (activity.assignedMembers && typeof activity.assignedMembers === 'string') {
      assignedIds = (activity.assignedMembers as any).split(',').map((id: string) => id.trim());
    } else if (activity.assignedMembers) {
      assignedIds = String(activity.assignedMembers).split(',').map((id: string) => id.trim());
    }
    
    return assignedIds.includes(this.currentUser.id);
  }

  isTeamMember(): Observable<boolean> {
    return this.isAdmin$.pipe(
      map(isAdmin => {
        if (isAdmin) return true;
        if (!this.currentUser || !this.team) return false;
        
        // Check if current user is a member of this team
        const memberIds = this.team.members?.map(m => m.userId || m.id) || [];
        return memberIds.includes(this.currentUser.id);
      })
    );
  }

  getAttachmentsCount(activity: Activity): number {
    return activity.attachments && Array.isArray(activity.attachments) ? activity.attachments.length : 0;
  }

  getRemarksCount(activity: Activity): number {
    return activity.remarks && Array.isArray(activity.remarks) ? activity.remarks.length : 0;
  }

  updateActivityStatus(activityId: string, status: string) {
    this.subscriptions.push(
      this.activityService.updateActivityStatus(parseInt(activityId), status).subscribe({
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
    if (!this.team) return;

    const dialogRef = this.dialog.open(CreateActivityDialogComponent, {
      width: '600px',
      data: {
        teamId: this.team.id,
        teamName: this.team.name,
        members: this.team.members || []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadActivities(this.team!.id); // Reload activities
      }
    });
  }

  openEditActivityDialog(activity: Activity) {
    if (!this.team) return;

    const dialogRef = this.dialog.open(CreateActivityDialogComponent, {
      width: '600px',
      data: {
        teamId: this.team.id,
        teamName: this.team.name,
        members: this.team.members || [],
        activity: activity, // Pass the activity for editing
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadActivities(this.team!.id); // Reload activities
      }
    });
  }

  openAddMembersDialog() {
    if (!this.team) return;

    const currentMemberIds = this.team.members?.map(m => m.userId) || [];
    
    const dialogRef = this.dialog.open(AddMembersDialogComponent, {
      width: '500px',
      data: {
        teamId: this.team.id,
        teamName: this.team.name,
        currentMembers: currentMemberIds
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTeamDetails(this.team!.id); // Reload team details to get updated members
      }
    });
  }

  openEditTeamDialog() {
    // This would open a dialog to edit team
    this.snackBar.open('Edit team dialog not implemented yet', 'Close', { duration: 3000 });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
}
