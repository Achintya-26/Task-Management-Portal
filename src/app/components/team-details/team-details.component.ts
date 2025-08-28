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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
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
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatRippleModule,
    MatGridListModule
  ],
  template: `
    <div class="team-details-container" *ngIf="team">
      <!-- Enhanced Hero Header -->
      <div class="hero-header">
        <div class="hero-background"></div>
        <div class="hero-content">
          <button mat-fab mini color="accent" (click)="goBack()" class="back-fab" matTooltip="Go back to teams">
            <mat-icon>arrow_back</mat-icon>
          </button>
          
          <div class="team-hero-info">
            <div class="team-avatar-large">
              <mat-icon>groups</mat-icon>
            </div>
            <div class="hero-text">
              <h1>{{ team.name }}</h1>
              <p class="team-description">{{ team.description || 'No description available' }}</p>
              <div class="team-metrics">
                <div class="metric-item">
                  <mat-icon>people</mat-icon>
                  <span class="metric-value">{{ team.members?.length || 0 }}</span>
                  <span class="metric-label">Members</span>
                </div>
                <div class="metric-item">
                  <mat-icon>assignment</mat-icon>
                  <span class="metric-value">{{ activities.length }}</span>
                  <span class="metric-label">Activities</span>
                </div>
                <div class="metric-item">
                  <mat-icon>trending_up</mat-icon>
                  <span class="metric-value">{{ getTeamProgress() }}%</span>
                  <span class="metric-label">Progress</span>
                </div>
              </div>
            </div>
          </div>

          <div class="hero-actions" *ngIf="canCreateActivity$ | async">
            <button mat-fab color="primary" (click)="openCreateActivityDialog()" matTooltip="Create new activity">
              <mat-icon>add</mat-icon>
            </button>
            <button mat-stroked-button color="primary" [matMenuTriggerFor]="teamMenu" *ngIf="isAdmin$ | async">
              <mat-icon>more_vert</mat-icon>
              Team Actions
            </button>
            <mat-menu #teamMenu="matMenu">
              <button mat-menu-item (click)="openAddMembersDialog()">
                <mat-icon>person_add</mat-icon>
                <span>Manage Members</span>
              </button>
              <button mat-menu-item (click)="openEditTeamDialog()">
                <mat-icon>edit</mat-icon>
                <span>Edit Team</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </div>

      <!-- Enhanced Stats Cards -->
      <div class="stats-overview">
        <mat-card class="stat-card activities-stat" matRipple>
          <mat-card-content>
            <div class="stat-icon-wrapper">
              <mat-icon class="stat-icon">assignment</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ activities.length }}</h3>
              <p>Total Activities</p>
              <div class="stat-progress">
                <mat-progress-bar mode="determinate" [value]="getTeamProgress()" color="primary"></mat-progress-bar>
                <span>{{ getTeamProgress() }}% Complete</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card pending-stat" matRipple>
          <mat-card-content>
            <div class="stat-icon-wrapper">
              <mat-icon class="stat-icon" [matBadge]="getPendingCount()" matBadgeColor="warn" 
                        [matBadgeHidden]="getPendingCount() === 0">schedule</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ getPendingCount() }}</h3>
              <p>Pending Tasks</p>
              <span class="stat-trend" [class.urgent]="getPendingCount() > 5">
                <mat-icon>{{ getPendingCount() > 5 ? 'warning' : 'schedule' }}</mat-icon>
                {{ getPendingStatus() }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card completed-stat" matRipple>
          <mat-card-content>
            <div class="stat-icon-wrapper">
              <mat-icon class="stat-icon">check_circle</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ getCompletedCount() }}</h3>
              <p>Completed</p>
              <span class="stat-trend positive">
                <mat-icon>trending_up</mat-icon>
                {{ getCompletionRate() }}% Rate
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card team-stat" matRipple>
          <mat-card-content>
            <div class="stat-icon-wrapper">
              <mat-icon class="stat-icon">groups</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ team.members?.length || 0 }}</h3>
              <p>Team Members</p>
              <span class="stat-trend">
                <mat-icon>people</mat-icon>
                Active Team
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Enhanced Content Tabs -->
      <mat-tab-group class="content-tabs" animationDuration="300ms" (selectedTabChange)="onTabChange($event)">
        <!-- My Activities Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">person</mat-icon>
            My Activities
            <mat-chip class="tab-badge">{{ myActivities.length }}</mat-chip>
          </ng-template>
          
          <div class="tab-content my-activities-tab">
            <div class="content-header">
              <div class="header-title">
                <h2>
                  <mat-icon class="section-icon">person</mat-icon>
                  Activities assigned to you in this team
                </h2>
                <!-- <p></p> -->
              </div>
                
                <div class="activity-filters">
                  <button 
                    mat-chip-listbox 
                    [class.selected]="mySelectedStatus === ''"
                    (click)="setMyStatusFilter('')"
                    matRipple
                  >
                    <mat-icon>view_list</mat-icon>
                    All ({{ getMyActivitiesByStatus('all').length }})
                  </button>
                  <button 
                    mat-chip-listbox
                    [class.selected]="mySelectedStatus === 'pending'"
                    (click)="setMyStatusFilter('pending')"
                    matRipple
                  >
                    <mat-icon>schedule</mat-icon>
                    Pending ({{ getMyPendingCount() }})
                  </button>
                  <button 
                    mat-chip-listbox
                    [class.selected]="mySelectedStatus === 'in-progress'"
                    (click)="setMyStatusFilter('in-progress')"
                    matRipple
                  >
                    <mat-icon>play_circle</mat-icon>
                    In Progress ({{ getMyInProgressCount() }})
                  </button>
                  <button 
                    mat-chip-listbox
                    [class.selected]="mySelectedStatus === 'completed'"
                    (click)="setMyStatusFilter('completed')"
                    matRipple
                  >
                    <mat-icon>check_circle</mat-icon>
                    Completed ({{ getMyCompletedCount() }})
                  </button>
                  <button 
                    mat-chip-listbox
                    [class.selected]="mySelectedStatus === 'on-hold'"
                    (click)="setMyStatusFilter('on-hold')"
                    matRipple
                  >
                    <mat-icon>pause_circle</mat-icon>
                    On Hold ({{ getMyOnHoldCount() }})
                  </button>
                </div>
              </div>

              <div class="activities-grid" *ngIf="myActivities.length > 0; else noMyActivities">
                <mat-card 
                  *ngFor="let activity of myActivities; trackBy: trackByActivityId" 
                  class="activity-card enhanced my-activity"
                  [routerLink]="['/activities', activity.id]"
                  matRipple
                >
                  <div class="activity-header">
                    <div class="activity-status-indicator" [class]="'status-' + activity.status"></div>
                    <!-- <mat-chip class="my-activity-badge">Mine</mat-chip> -->
                  </div>
                  
                  <mat-card-content>
                    <div class="activity-title-section">
                      <h3>{{ activity.name }}</h3>
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
                    
                    <div class="activity-metadata">
                      <div class="metadata-row">
                        <div class="metadata-item">
                          <mat-icon class="small-icon">people</mat-icon>
                          <span>{{ getAssignedMembersText(activity.assignedMembers) }}</span>
                        </div>
                        <div class="metadata-item">
                          <mat-icon class="small-icon">schedule</mat-icon>
                          <span class="due-date" [class]="getDueDateClass(activity.targetDate)">
                            {{ formatDueDate(activity.targetDate) }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="metadata-row">
                        <div class="metadata-item">
                          <mat-icon class="small-icon">attachment</mat-icon>
                          <span>{{ getAttachmentsCount(activity) }} attachments</span>
                        </div>
                        <div class="metadata-item">
                          <mat-icon class="small-icon">comment</mat-icon>
                          <span>{{ getRemarksCount(activity) }} remarks</span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>

                  <mat-divider></mat-divider>

                  <mat-card-actions>
                    <button mat-button color="primary" [routerLink]="['/activities', activity.id]" 
                            (click)="$event.stopPropagation()">
                      <mat-icon>visibility</mat-icon>
                      View
                    </button>
                    <button 
                      mat-button 
                      *ngIf="canEditActivity(activity)" 
                      (click)="openEditActivityDialog(activity); $event.stopPropagation()"
                      matTooltip="Edit activity"
                    >
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button 
                      mat-button 
                      color="primary"
                      *ngIf="canUpdateActivitySync(activity)" 
                      [matMenuTriggerFor]="myStatusMenu"
                      (click)="$event.stopPropagation()"
                      matTooltip="Update status"
                    >
                      <mat-icon>update</mat-icon>
                      Status
                    </button>
                    <mat-menu #myStatusMenu="matMenu">
                      <button mat-menu-item (click)="updateActivityStatus(activity.id, 'pending')"
                              [disabled]="activity.status === 'pending'">
                        <mat-icon>schedule</mat-icon>
                        Pending
                      </button>
                      <button mat-menu-item (click)="updateActivityStatus(activity.id, 'in-progress')"
                              [disabled]="activity.status === 'in-progress'">
                        <mat-icon>play_circle</mat-icon>
                        In Progress
                      </button>
                      <button mat-menu-item (click)="updateActivityStatus(activity.id, 'completed')"
                              [disabled]="activity.status === 'completed'">
                        <mat-icon>check_circle</mat-icon>
                        Completed
                      </button>
                      <button mat-menu-item (click)="updateActivityStatus(activity.id, 'on-hold')"
                              [disabled]="activity.status === 'on-hold'">
                        <mat-icon>pause_circle</mat-icon>
                        On Hold
                      </button>
                    </mat-menu>
                  </mat-card-actions>
                </mat-card>
              </div>

              <ng-template #noMyActivities>
                <mat-card class="empty-state enhanced">
                  <mat-card-content>
                    <div class="empty-content">
                      <mat-icon class="empty-icon">assignment_ind</mat-icon>
                      <h3>No Activities Assigned</h3>
                      <p *ngIf="mySelectedStatus">No activities found with the selected status filter.</p>
                      <p *ngIf="!mySelectedStatus">You don't have any activities assigned in this team yet.</p>
                      <div class="empty-actions">
                        <button 
                          *ngIf="mySelectedStatus" 
                          mat-stroked-button 
                          color="primary" 
                          (click)="setMyStatusFilter('')"
                        >
                          <mat-icon>clear</mat-icon>
                          Clear Filter
                        </button>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </ng-template>
            </div>
            
        </mat-tab>

        <!-- All Activities Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">assignment</mat-icon>
            All Activities
            <mat-chip class="tab-badge">{{ activities.length }}</mat-chip>
          </ng-template>
          
         <div class="tab-content  all-activities">
              <div class="section-header">
                <div class="header-title">
                  <h2>
                    <mat-icon class="section-icon">groups</mat-icon>
                    All activities in this team
                  </h2>
                  <!-- <p></p> -->
                </div>
                
                <div class="activity-filters">
                  <button 
                    mat-chip-listbox 
                    [class.selected]="selectedStatus === ''"
                    (click)="setStatusFilter('')"
                    matRipple
                  >
                    <mat-icon>view_list</mat-icon>
                    All ({{ activities.length }})
                  </button>
                  <button 
                    mat-chip-listbox
                    [class.selected]="selectedStatus === 'pending'"
                    (click)="setStatusFilter('pending')"
                    matRipple
                  >
                    <mat-icon>schedule</mat-icon>
                    Pending ({{ getPendingCount() }})
                  </button>
                  <button 
                    mat-chip-listbox
                    [class.selected]="selectedStatus === 'in-progress'"
                    (click)="setStatusFilter('in-progress')"
                    matRipple
                  >
                    <mat-icon>play_circle</mat-icon>
                    In Progress ({{ getInProgressCount() }})
                  </button>
                  <button 
                    mat-chip-listbox
                    [class.selected]="selectedStatus === 'completed'"
                    (click)="setStatusFilter('completed')"
                    matRipple
                  >
                    <mat-icon>check_circle</mat-icon>
                    Completed ({{ getCompletedCount() }})
                  </button>
                  <button 
                    mat-chip-listbox
                    [class.selected]="selectedStatus === 'on-hold'"
                    (click)="setStatusFilter('on-hold')"
                    matRipple
                  >
                    <mat-icon>pause_circle</mat-icon>
                    On Hold ({{ getOnHoldCount() }})
                  </button>
                </div>
              </div>

              <div class="activities-grid" *ngIf="filteredActivities.length > 0; else noActivities">
                <mat-card 
                  *ngFor="let activity of filteredActivities; trackBy: trackByActivityId" 
                  class="activity-card enhanced"
                  [routerLink]="['/activities', activity.id]"
                  matRipple
                >
                  <div class="activity-header">
                    <div class="activity-status-indicator" [class]="'status-' + activity.status"></div>
                  </div>
                  
                  <mat-card-content>
                    <div class="activity-title-section">
                      <h3>{{ activity.name }}</h3>
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
                    
                    <div class="activity-metadata">
                      <div class="metadata-row">
                        <div class="metadata-item">
                          <mat-icon class="small-icon">people</mat-icon>
                          <span>{{ getAssignedMembersText(activity.assignedMembers) }}</span>
                        </div>
                        <div class="metadata-item">
                          <mat-icon class="small-icon">schedule</mat-icon>
                          <span class="due-date" [class]="getDueDateClass(activity.targetDate)">
                            {{ formatDueDate(activity.targetDate) }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="metadata-row">
                        <div class="metadata-item">
                          <mat-icon class="small-icon">attachment</mat-icon>
                          <span>{{ getAttachmentsCount(activity) }} attachments</span>
                        </div>
                        <div class="metadata-item">
                          <mat-icon class="small-icon">comment</mat-icon>
                          <span>{{ getRemarksCount(activity) }} remarks</span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>

                  <mat-divider></mat-divider>

                  <mat-card-actions>
                    <button mat-button color="primary" [routerLink]="['/activities', activity.id]" 
                            (click)="$event.stopPropagation()">
                      <mat-icon>visibility</mat-icon>
                      View
                    </button>
                    <button 
                      mat-button 
                      *ngIf="canEditActivity(activity)" 
                      (click)="openEditActivityDialog(activity); $event.stopPropagation()"
                      matTooltip="Edit activity"
                    >
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button 
                      mat-button 
                      color="primary"
                      *ngIf="canUpdateActivitySync(activity)" 
                      [matMenuTriggerFor]="statusMenu"
                      (click)="$event.stopPropagation()"
                      matTooltip="Update status"
                    >
                      <mat-icon>update</mat-icon>
                      Status
                    </button>
                    <mat-menu #statusMenu="matMenu">
                      <button mat-menu-item (click)="updateActivityStatus(activity.id, 'pending')"
                              [disabled]="activity.status === 'pending'">
                        <mat-icon>schedule</mat-icon>
                        Pending
                      </button>
                      <button mat-menu-item (click)="updateActivityStatus(activity.id, 'in-progress')"
                              [disabled]="activity.status === 'in-progress'">
                        <mat-icon>play_circle</mat-icon>
                        In Progress
                      </button>
                      <button mat-menu-item (click)="updateActivityStatus(activity.id, 'completed')"
                              [disabled]="activity.status === 'completed'">
                        <mat-icon>check_circle</mat-icon>
                        Completed
                      </button>
                      <button mat-menu-item (click)="updateActivityStatus(activity.id, 'on-hold')"
                              [disabled]="activity.status === 'on-hold'">
                        <mat-icon>pause_circle</mat-icon>
                        On Hold
                      </button>
                    </mat-menu>
                    <button 
                      mat-button 
                      color="warn"
                      *ngIf="canEditActivity(activity)" 
                      (click)="deleteActivity(activity); $event.stopPropagation()"
                      matTooltip="Delete activity"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>

              <ng-template #noActivities>
                <mat-card class="empty-state enhanced">
                  <mat-card-content>
                    <div class="empty-content">
                      <mat-icon class="empty-icon">assignment</mat-icon>
                      <h3>No Activities Found</h3>
                      <p *ngIf="selectedStatus">No activities found with the selected status filter.</p>
                      <p *ngIf="!selectedStatus">This team doesn't have any activities yet. Create the first one!</p>
                      <div class="empty-actions">
                        <button 
                          *ngIf="(canCreateActivity$ | async) && !selectedStatus" 
                          mat-raised-button 
                          color="primary" 
                          (click)="openCreateActivityDialog()"
                        >
                          <mat-icon>add</mat-icon>
                          Create First Activity
                        </button>
                        <button 
                          *ngIf="selectedStatus" 
                          mat-stroked-button 
                          color="primary" 
                          (click)="setStatusFilter('')"
                        >
                          <mat-icon>clear</mat-icon>
                          Clear Filter
                        </button>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </ng-template>
            </div>
        </mat-tab>

        <!-- Enhanced Members Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">groups</mat-icon>
            Members
            <mat-chip class="tab-badge">{{ team?.members?.length || 0 }}</mat-chip>
          </ng-template>
          
          <div class="tab-content members-tab">
            <div class="content-header">
              <div class="header-title">
                <h2>Team Members</h2>
                <p>Manage team members and their activities</p>
              </div>
              
              <button 
                *ngIf="isAdmin$ | async" 
                mat-raised-button 
                color="primary" 
                (click)="openAddMembersDialog()"
              >
                <mat-icon>group</mat-icon>
                Manage Members
              </button>
            </div>

            <div class="members-grid">
              <mat-card *ngFor="let member of team?.members; trackBy: trackByMemberId" class="member-card enhanced" matRipple>
                <div class="member-header">
                  <div class="member-avatar">
                    <mat-icon>person</mat-icon>
                  </div>
                  <div class="member-status">
                    <mat-chip class="status-active">Active</mat-chip>
                  </div>
                </div>
                
                <mat-card-content>
                  <div class="member-info">
                    <h3>{{ member.name }}</h3>
                    <p class="member-id">ID: {{ member.empId }}</p>
                    <p class="member-role">Team Member</p>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <div class="member-statistics">
                    <div class="stat-row">
                      <div class="stat-item">
                        <mat-icon class="stat-icon">assignment</mat-icon>
                        <div class="stat-content">
                          <span class="stat-value">{{ getMemberActivityCount(member.userId) }}</span>
                          <span class="stat-label">Assigned</span>
                        </div>
                      </div>
                      <div class="stat-item">
                        <mat-icon class="stat-icon completed">check_circle</mat-icon>
                        <div class="stat-content">
                          <span class="stat-value">{{ getMemberCompletedCount(member.userId) }}</span>
                          <span class="stat-label">Completed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="member-progress">
                      <span class="progress-label">Completion Rate</span>
                      <mat-progress-bar 
                        mode="determinate" 
                        [value]="getMemberCompletionRate(member.userId)"
                        color="primary">
                      </mat-progress-bar>
                      <span class="progress-value">{{ getMemberCompletionRate(member.userId) }}%</span>
                    </div>
                  </div>
                </mat-card-content>
                
                <mat-card-actions *ngIf="isAdmin$ | async">
                  <button mat-button color="primary" matTooltip="View member activities">
                    <mat-icon>visibility</mat-icon>
                    Activities
                  </button>
                  <button 
                    mat-button 
                    color="warn" 
                    (click)="removeMember(member.id)"
                    matTooltip="Remove from team"
                  >
                    <mat-icon>remove_circle</mat-icon>
                    Remove
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Loading State -->
    <div class="loading-state" *ngIf="!team && isLoading">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Loading team details...</p>
    </div>

    <!-- Error State -->
    <div class="error-state" *ngIf="!team && !isLoading">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <h3>Failed to load team details</h3>
      <p>There was an error loading the team information.</p>
      <button mat-raised-button color="primary" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        Go Back to Teams
      </button>
    </div>
  `,
  styles: [`
    .team-details-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      margin-top: 64px;
      background: #f8f9fa;
      min-height: calc(100vh - 64px);
    }

    /* Enhanced Hero Header */
    .hero-header {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 48px;
      border-radius: 20px;
      margin-bottom: 32px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
      opacity: 0.3;
    }

    .hero-content {
      position: relative;
      display: flex;
      align-items: center;
      gap: 32px;
      z-index: 1;
    }

    .back-fab {
      flex-shrink: 0;
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .team-hero-info {
      display: flex;
      align-items: center;
      gap: 24px;
      flex: 1;
    }

    .team-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .team-avatar-large mat-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
    }

    .hero-text h1 {
      font-size: 36px;
      font-weight: 300;
      margin: 0 0 8px 0;
    }

    .team-description {
      font-size: 16px;
      opacity: 0.9;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .team-metrics {
      display: flex;
      gap: 32px;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .metric-item mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
      opacity: 0.8;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 500;
    }

    .metric-label {
      font-size: 12px;
      opacity: 0.8;
    }

    .hero-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: flex-end;
    }

    /* Enhanced Stats Overview */
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.15);
    }

    .stat-card.activities-stat {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-card.pending-stat {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-card.completed-stat {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .stat-card.team-stat {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px !important;
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

    .stat-details {
      flex: 1;
    }

    .stat-details h3 {
      font-size: 32px;
      font-weight: 300;
      margin: 0 0 4px 0;
    }

    .stat-details p {
      font-size: 14px;
      margin: 0 0 12px 0;
      opacity: 0.9;
    }

    .stat-progress {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-progress mat-progress-bar {
      flex: 1;
      height: 6px;
      border-radius: 3px;
    }

    .stat-progress span {
      font-size: 12px;
      opacity: 0.9;
      min-width: 70px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 6px;
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

    .stat-trend.urgent {
      color: #ff5722;
    }

    /* Enhanced Content Tabs */
    .content-tabs {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .content-tabs ::ng-deep .mat-mdc-tab-group {
      border-radius: 16px;
    }

    .content-tabs ::ng-deep .mat-mdc-tab-header {
      background: #f8f9fa;
      border-radius: 16px 16px 0 0;
    }

    .tab-icon {
      margin-right: 8px;
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    .tab-badge {
      margin-left: 8px;
      background: #e3f2fd;
      color: #1976d2;
      font-size: 11px;
      height: 18px;
    }

    .tab-content {
      padding: 32px;
    }

    /* Activities Sections */
    .activities-section {
      margin-bottom: 48px;
    }

    .activities-section .section-header {
      margin-bottom: 32px;
    }

    .activities-section .header-title {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 16px;
    }

    .activities-section .header-title h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 500;
      margin: 0;
      color: #333;
    }

    .section-icon {
      font-size: 28px;
      height: 28px;
      width: 28px;
      color: #667eea;
    }

    .my-activities .section-icon {
      color: #4caf50;
    }

    .all-activities .section-icon {
      color: #667eea;
    }

    .section-divider {
      margin: 48px 0;
      background-color: #e0e0e0;
    }

    /* My Activities specific styling */
    .my-activity {
      border-left: 4px solid #4caf50;
    }

    .my-activity-badge {
      background-color: #e8f5e8;
      color: #4caf50;
      font-size: 11px;
      font-weight: 500;
    }

    .content-header, .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 24px;
    }

    .header-title h2 {
      font-size: 28px;
      font-weight: 400;
      margin: 0 0 8px 0;
      color: #333;
      display: flex;
    align-items: center;
    gap: 10px;
    }

    .header-title p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    /* Enhanced Activity Filters */
    .activity-filters {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .activity-filters button {
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      background: white;
      color: #666;
    }

    .activity-filters button:hover {
      border-color: #667eea;
      color: #667eea;
      background: #f3f4ff;
    }

    .activity-filters button.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .activity-filters button mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    /* Enhanced Activities Grid */
    .activities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .activity-card.enhanced {
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      border: 1px solid #e0e0e0;
    }

    .activity-card.enhanced:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.12);
      border-color: #667eea;
    }

    .activity-header {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
      z-index: 1;
    }

    .activity-status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .activity-status-indicator.status-pending {
      background: #ff9800;
    }

    .activity-status-indicator.status-in-progress {
      background: #2196f3;
    }

    .activity-status-indicator.status-completed {
      background: #4caf50;
    }

    .activity-status-indicator.status-on-hold {
      background: #f44336;
    }

    .activity-priority {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .activity-priority.priority-high {
      background: #ffebee;
      color: #c62828;
    }

    .activity-priority.priority-medium {
      background: #fff3e0;
      color: #ef6c00;
    }

    .activity-priority.priority-low {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .activity-priority mat-icon {
      font-size: 14px;
      height: 14px;
      width: 14px;
    }

    .activity-card mat-card-content {
      padding: 20px !important;
    }

    .activity-title-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 16px;
    }

    .activity-title-section h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      color: #333;
      flex: 1;
      line-height: 1.3;
    }

    .status-chip {
      font-size: 11px;
      height: 24px;
      flex-shrink: 0;
    }

    .status-chip.status-pending { 
      background-color: #fff3e0; 
      color: #ef6c00; 
    }
    
    .status-chip.status-in-progress { 
      background-color: #e3f2fd; 
      color: #1976d2; 
    }
    
    .status-chip.status-completed { 
      background-color: #e8f5e8; 
      color: #2e7d2e; 
    }
    
    .status-chip.status-on-hold { 
      background-color: #ffebee; 
      color: #c62828; 
    }

    .activity-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .priority-chip {
      font-size: 11px;
      height: 24px;
      flex-shrink: 0;
    }

    .priority-chip.priority-low { 
      background-color: #f3e5f5; 
      color: #7b1fa2; 
    }
    
    .priority-chip.priority-medium { 
      background-color: #e8f5e8; 
      color: #388e3c; 
    }
    
    .priority-chip.priority-high { 
      background-color: #fff3e0; 
      color: #f57c00; 
    }
    
    .priority-chip.priority-urgent { 
      background-color: #ffebee; 
      color: #d32f2f; 
    }

    .activity-description {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin: 0 0 20px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .activity-metadata {
      margin-bottom: 16px;
    }

    .metadata-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #666;
      flex: 1;
    }

    .small-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .due-date.overdue {
      color: #f44336;
    }

    .due-date.due-soon {
      color: #ff9800;
    }

    .due-date.due-later {
      color: #5b79f7;
    }

    .activity-card mat-card-actions {
      padding: 16px 20px !important;
      background: #f8f9fa;
    }

    /* Enhanced Members Grid */
    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .member-card.enhanced {
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid #e0e0e0;
    }

    .member-card.enhanced:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      border-color: #667eea;
    }

    .member-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 16px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .member-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .member-avatar mat-icon {
      font-size: 28px;
      height: 28px;
      width: 28px;
    }

    .member-status .status-active {
      background: #e8f5e8;
      color: #2e7d2e;
      font-size: 11px;
      height: 20px;
    }

    .member-card mat-card-content {
      padding: 0 20px 16px !important;
    }

    .member-info {
      margin-bottom: 16px;
    }

    .member-info h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #333;
    }

    .member-id {
      font-size: 12px;
      color: #666;
      margin: 0 0 4px 0;
    }

    .member-role {
      font-size: 13px;
      color: #888;
      margin: 0;
    }

    .member-statistics {
      margin-top: 16px;
    }

    .stat-row {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .stat-item .stat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
      color: #666;
    }

    .stat-item .stat-icon.completed {
      color: #4caf50;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      font-size: 11px;
      color: #666;
    }

    .member-progress {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .progress-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .member-progress mat-progress-bar {
      height: 6px;
      border-radius: 3px;
    }

    .progress-value {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      align-self: flex-end;
    }

    .member-card mat-card-actions {
      padding: 16px 20px !important;
      background: #f8f9fa;
    }

    /* Enhanced Empty States */
    .empty-state.enhanced {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 2px dashed #dee2e6;
      border-radius: 20px;
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
      font-size: 80px;
      height: 80px;
      width: 80px;
      color: #adb5bd;
      margin-bottom: 16px;
    }

    .empty-content h3 {
      font-size: 24px;
      font-weight: 500;
      color: #495057;
      margin: 0;
    }

    .empty-content p {
      font-size: 16px;
      color: #6c757d;
      margin: 0 0 24px 0;
      max-width: 400px;
      line-height: 1.5;
    }

    .empty-actions {
      display: flex;
      gap: 16px;
    }

    /* Loading and Error States */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      color: #666;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    }

    .loading-state p {
      margin-top: 16px;
      font-size: 16px;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      color: #666;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      text-align: center;
      padding: 40px;
    }

    .error-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .error-state h3 {
      font-size: 20px;
      font-weight: 500;
      color: #333;
      margin: 0 0 8px 0;
    }

    .error-state p {
      font-size: 14px;
      color: #666;
      margin: 0 0 24px 0;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .stats-overview {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .activities-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .team-details-container {
        padding: 16px;
        margin-top: 56px;
      }

      .hero-content {
        flex-direction: column;
        text-align: center;
        gap: 24px;
      }

      .team-hero-info {
        flex-direction: column;
        text-align: center;
      }

      .hero-actions {
        align-items: center;
        flex-direction: row;
        justify-content: center;
      }

      .team-metrics {
        justify-content: center;
      }

      .stats-overview {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .content-header {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
      }

      .activity-filters {
        justify-content: center;
      }

      .activities-grid {
        grid-template-columns: 1fr;
      }

      .members-grid {
        grid-template-columns: 1fr;
      }

      .tab-content {
        padding: 20px;
      }

      .metadata-row {
        flex-direction: column;
        gap: 8px;
      }

      .stat-row {
        justify-content: space-around;
      }
    }

    @media (max-width: 480px) {
      .hero-header {
        padding: 32px 24px;
      }

      .hero-text h1 {
        font-size: 28px;
      }

      .team-metrics {
        gap: 20px;
      }

      .metric-value {
        font-size: 20px;
      }

      .activity-title-section {
        flex-direction: column;
        gap: 12px;
      }

      .empty-state.enhanced {
        padding: 40px 24px;
      }

      .empty-actions {
        flex-direction: column;
        width: 100%;
      }
    }
  `]
})
export class TeamDetailsComponent implements OnInit, OnDestroy {
  team: Team | null = null;
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  myActivities: Activity[] = []; // Activities assigned to current user
  selectedStatus = '';
  mySelectedStatus = ''; // Status filter for my activities
  statusFilter = 'all'; // Status filter for all activities
  myActivitiesStatusFilter = 'all'; // Status filter for my activities
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
    this.myActivities = [];
    this.selectedStatus = '';
    this.mySelectedStatus = '';
    this.isLoading = false;
  }

  loadTeamDetails(teamId: string) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.subscriptions.push(
      this.teamService.getTeamById(teamId).subscribe({
        next: (team) => {
          this.team = team;
          // console.log("Team is :::", team);
          this.isLoading = false;
          // console.log('Team loaded successfully:', team);
          // console.log('Team members structure:', team.members);
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
          // console.log('Raw activities response:', activities);
          this.activities = activities || [];
          this.filterActivities();
          this.filterMyActivities(); // Filter activities for current user
          // console.log('Activities loaded successfully:', activities?.length || 0, 'activities');
          if (activities && activities.length > 0) {
            // console.log('Sample activity structure:', activities[0]);
          }
        },
        error: (error) => {
          console.error('Error loading activities:', error);
          this.activities = [];
          this.filteredActivities = [];
          this.myActivities = [];
          this.snackBar.open('Failed to load activities', 'Close', { duration: 3000 });
        }
      })
    );
  }

  // Enhanced helper methods
  getPendingCount(): number {
    return this.activities.filter(a => a.status === 'pending').length;
  }

  getCompletedCount(): number {
    return this.activities.filter(a => a.status === 'completed').length;
  }

  getInProgressCount(): number {
    return this.activities.filter(a => a.status === 'in-progress').length;
  }

  getOnHoldCount(): number {
    return this.activities.filter(a => a.status === 'on-hold').length;
  }

  // Helper methods for user's activities
  getMyPendingCount(): number {
    return this.getMyActivitiesByStatus('all').filter(a => a.status === 'pending').length;
  }

  getMyCompletedCount(): number {
    return this.getMyActivitiesByStatus('all').filter(a => a.status === 'completed').length;
  }

  getMyInProgressCount(): number {
    return this.getMyActivitiesByStatus('all').filter(a => a.status === 'in-progress').length;
  }

  getMyOnHoldCount(): number {
    return this.getMyActivitiesByStatus('all').filter(a => a.status === 'on-hold').length;
  }

  getMyActivitiesByStatus(status: string): Activity[] {
    if (!this.currentUser) return [];
    
    const userActivities = this.activities.filter(activity => {
      let assignedIds: string[] = [];
      if (Array.isArray(activity.assignedMembers)) {
        assignedIds = activity.assignedMembers.map(m => m.id);
      } else if (activity.assignedMembers && typeof activity.assignedMembers === 'string') {
        assignedIds = (activity.assignedMembers as any).split(',').map((id: string) => id.trim());
      } else if (activity.assignedMembers) {
        assignedIds = String(activity.assignedMembers).split(',').map((id: string) => id.trim());
      }
      return assignedIds.includes(this.currentUser!.id);
    });

    if (status === 'all') return userActivities;
    return userActivities.filter(activity => activity.status === status);
  }

  getPendingStatus(): string {
    const pending = this.getPendingCount();
    if (pending === 0) return 'All caught up!';
    if (pending <= 2) return 'Under control';
    if (pending <= 5) return 'Getting busy';
    return 'High workload';
  }

  getCompletionRate(): number {
    if (this.activities.length === 0) return 0;
    return Math.round((this.getCompletedCount() / this.activities.length) * 100);
  }

  getPriorityIcon(priority: string): string {
    const icons: { [key: string]: string } = {
      'high': 'priority_high',
      'medium': 'remove',
      'low': 'keyboard_arrow_down'
    };
    return icons[priority] || 'remove';
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

  formatDueDate(dateString: string | null): string {
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

  getMemberCompletionRate(userId: string): number {
    const assigned = this.getMemberActivityCount(userId);
    const completed = this.getMemberCompletedCount(userId);
    if (assigned === 0) return 0;
    return Math.round((completed / assigned) * 100);
  }

  onTabChange(event: any): void {
    // Handle tab change if needed
    // console.log('Tab changed to:', event.index);
  }

  trackByActivityId(index: number, activity: Activity): string {
    return activity.id;
  }

  trackByMemberId(index: number, member: any): string {
    return member.id || member.userId;
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
        // console.log('Activity created event received');
    //     this.loadActivities(teamId);
    //   }),
    //   this.socketService.onActivityUpdated().subscribe(() => {
        // console.log('Activity updated event received');
    //     this.loadActivities(teamId);
    //   }),
    //   this.socketService.onTeamUpdated().subscribe(() => {
        // console.log('Team updated event received');
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

  filterMyActivities() {
    if (!this.currentUser) {
      this.myActivities = [];
      return;
    }

    // Get activities assigned to current user
    const userActivities = this.activities.filter(activity => {
      let assignedIds: string[] = [];
      if (Array.isArray(activity.assignedMembers)) {
        assignedIds = activity.assignedMembers.map(m => m.id);
      } else if (activity.assignedMembers && typeof activity.assignedMembers === 'string') {
        assignedIds = (activity.assignedMembers as any).split(',').map((id: string) => id.trim());
      } else if (activity.assignedMembers) {
        assignedIds = String(activity.assignedMembers).split(',').map((id: string) => id.trim());
      }
      return assignedIds.includes(this.currentUser!.id);
    });

    // Apply status filter to my activities
    if (!this.mySelectedStatus) {
      this.myActivities = userActivities;
    } else {
      this.myActivities = userActivities.filter(
        activity => activity.status === this.mySelectedStatus
      );
    }
  }

  setStatusFilter(status: string) {
    this.selectedStatus = status;
    this.filterActivities();
  }

  setMyStatusFilter(status: string) {
    this.mySelectedStatus = status;
    this.filterMyActivities();
  }

  // New methods for tab-based filtering
  getActivitiesByStatus(status: string): Activity[] {
    if (status === 'all') return this.activities;
    return this.activities.filter(activity => activity.status === status);
  }

  setMyActivitiesStatusFilter(status: string) {
    this.myActivitiesStatusFilter = status;
  }

  getFilteredMyActivities(): Activity[] {
    return this.getMyActivitiesByStatus(this.myActivitiesStatusFilter);
  }

  getFilteredActivities(): Activity[] {
    return this.getActivitiesByStatus(this.statusFilter);
  }

  sortActivities(criteria: string) {
    this.activities.sort((a, b) => {
      switch (criteria) {
        case 'date':
          const dateA = a.targetDate ? new Date(a.targetDate).getTime() : 0;
          const dateB = b.targetDate ? new Date(b.targetDate).getTime() : 0;
          return dateA - dateB;
        case 'priority':
          const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }

  viewActivity(activity: Activity) {
    this.router.navigate(['/activities', activity.id]);
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

  getPriorityLabel(priority: string | undefined): string {
    const labels: { [key: string]: string } = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent'
    };
    return labels[priority || 'medium'] || 'Medium';
  }

  getAssignedMembersText(assignedUsers: Activity["assignedMembers"] | string | undefined): string {
    // console.log('getAssignedMembersText - assignedUsers:', assignedUsers);
    // console.log('getAssignedMembersText - team members:', this.team?.members);
    
    if (!this.team || !assignedUsers) return 'No assignees';
    
    // Handle both array and comma-separated string formats
    let memberIds: string[] = [];
    if (Array.isArray(assignedUsers)) {
      memberIds = assignedUsers.map(m => m.id);
    } else if (typeof assignedUsers === 'string') {
      memberIds = assignedUsers.split(',').map(id => id.trim()).filter(id => id);
    }
    
    // console.log('Extracted member IDs:', memberIds);
    
    if (memberIds.length === 0) return 'No assignees';
    
    // Look up members by their user ID (which matches the assigned user IDs)
    // console.log("-------|||||-------",this.team!.members);
    const memberNames = memberIds
      .map(id => {
        const member = this.team!.members?.find(m => m.id === id);
        // console.log(`Looking for ID ${id}, found member:`, member);
        return member?.name;
      })
      .filter(name => name);
    
    // console.log('Found member names:', memberNames);
    
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

    const currentMemberIds = this.team.members?.map(m => m.userId || m.id) || [];
    
    const dialogRef = this.dialog.open(AddMembersDialogComponent, {
      width: '600px', // Increased width for better UX
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
