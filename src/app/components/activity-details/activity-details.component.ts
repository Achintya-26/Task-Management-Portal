import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivityService } from '../../services/activity.service';
import { AuthService } from '../../services/auth.service';
import { TeamService } from '../../services/team.service';
import { Activity, User, Remark } from '../../models';
import { CreateActivityDialogComponent } from '../dialogs/create-activity-dialog/create-activity-dialog.component';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Activity Details Component
 * 
 * Permissions:
 * - Activity Editing: Available to admins and activity creators only
 * - Status Management: Available to admins, activity creators, and assigned members
 * - Quick Actions: Available to admins, activity creators, and assigned members
 * - Comment/Remark Management: All users can add comments, only comment authors and admins can edit/delete
 */
@Component({
  selector: 'app-activity-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatBadgeModule,
    MatMenuModule,
    MatExpansionModule,
    MatTabsModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <!-- Loading State with Enhanced Design -->
    <div class="loading-container" *ngIf="!activity && !error">
      <div class="loading-content">
        <mat-progress-spinner diameter="60" color="primary"></mat-progress-spinner>
        <h3>Loading Activity Details</h3>
        <p>Please wait while we fetch the activity information...</p>
      </div>
    </div>

    <!-- Error State with Enhanced Design -->
    <div class="error-container" *ngIf="error">
      <div class="error-content">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button mat-raised-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Go Back
          </button>
          <button mat-stroked-button color="primary" (click)="reloadActivity()" *ngIf="activity?.id">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Activity Details -->
    <div class="activity-details-container" *ngIf="activity && !error">
      <!-- Hero Header Section -->
      <div class="hero-header">
        <div class="hero-background">
          <div class="background-pattern"></div>
          <div class="background-overlay"></div>
        </div>
        <div class="hero-content">
          <div class="header-navigation">
            <button mat-icon-button (click)="goBack()" class="back-button" matTooltip="Go Back">
              <mat-icon>arrow_back</mat-icon>
            </button>
            
            <div class="breadcrumb">
              <span class="breadcrumb-item" (click)="navigateTo('/dashboard')">Dashboard</span>
              <mat-icon class="breadcrumb-arrow">chevron_right</mat-icon>
              <span class="breadcrumb-item" (click)="navigateTo('/teams/' + activity!.teamId)">Activities</span>
              <mat-icon class="breadcrumb-arrow">chevron_right</mat-icon>
              <span class="breadcrumb-current">{{ activity.name }}</span>
            </div>
          </div>

          <div class="activity-hero-info">
            <div class="activity-title-section">
              <h1 class="activity-title">{{ activity.name }}</h1>
              <p class="activity-subtitle">{{ activity.description }}</p>
              
              <div class="activity-badges">
                <div class="badge-group">
                  <mat-chip class="status-chip" [class]="'status-' + activity.status">
                    <mat-icon class="chip-icon">{{ getStatusIcon(activity.status) }}</mat-icon>
                    {{ getStatusLabel(activity.status) }}
                  </mat-chip>
                  
                  <mat-chip class="priority-chip" [class]="'priority-' + (activity.priority || 'medium').toLowerCase()" 
                            *ngIf="activity.priority">
                    <mat-icon class="chip-icon">flag</mat-icon>
                    {{ getPriorityLabel(activity.priority) }}
                  </mat-chip>
                </div>
              </div>

              <div class="activity-metadata">
                <div class="metadata-grid">
                  <div class="metadata-item">
                    <div class="metadata-icon">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div class="metadata-content">
                      <span class="metadata-label">Created by</span>
                      <span class="metadata-value">{{ getCreatorName() }}</span>
                    </div>
                  </div>
                  
                  <div class="metadata-item" *ngIf="activity.targetDate">
                    <div class="metadata-icon">
                      <mat-icon>event</mat-icon>
                    </div>
                    <div class="metadata-content">
                      <span class="metadata-label">Due Date</span>
                      <span class="metadata-value due-date" [class]="getDueDateClass(activity.targetDate)">
                        {{ formatDate(activity.targetDate) }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="metadata-item">
                    <div class="metadata-icon">
                      <mat-icon>schedule</mat-icon>
                    </div>
                    <div class="metadata-content">
                      <span class="metadata-label">Created</span>
                      <span class="metadata-value">{{ formatRelativeDate(activity.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-section" *ngIf="canEdit$ | async">
              <div class="primary-actions">
                <button mat-raised-button color="primary" (click)="editActivity()" class="primary-action-btn">
                  <mat-icon>edit</mat-icon>
                  Edit Activity
                </button>
              </div>
              
              <button mat-icon-button [matMenuTriggerFor]="actionMenu" class="more-actions-btn" matTooltip="More Actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              
              <mat-menu #actionMenu="matMenu" class="action-menu">
                <button mat-menu-item (click)="duplicateActivity()">
                  <mat-icon>content_copy</mat-icon>
                  <span>Duplicate Activity</span>
                </button>
                <button mat-menu-item (click)="exportActivity()">
                  <mat-icon>download</mat-icon>
                  <span>Export Details</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="deleteActivity()" class="delete-action">
                  <mat-icon color="warn">delete</mat-icon>
                  <span>Delete Activity</span>
                </button>
              </mat-menu>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Progress Section -->
      <div class="progress-section">
        <mat-card class="progress-card">
          <div class="progress-header">
            <div class="progress-title">
              <mat-icon class="section-icon">trending_up</mat-icon>
              <div>
                <h3>Activity Progress</h3>
                <p>Track the completion status of this activity</p>
              </div>
            </div>
            <div class="progress-percentage">
              <span class="percentage-value">{{ getActivityProgress() }}%</span>
              <span class="percentage-label">Complete</span>
            </div>
          </div>
          
          <div class="progress-indicator-section">
            <mat-progress-bar 
              mode="determinate" 
              [value]="getActivityProgress()"
              color="primary"
              class="enhanced-progress-bar">
            </mat-progress-bar>
            
            <div class="progress-milestones">
              <div class="milestone" [class.active]="getActivityProgress() >= 25">
                <div class="milestone-dot"></div>
                <span class="milestone-label">Started</span>
              </div>
              <div class="milestone" [class.active]="getActivityProgress() >= 50">
                <div class="milestone-dot"></div>
                <span class="milestone-label">In Progress</span>
              </div>
              <div class="milestone" [class.active]="getActivityProgress() >= 75">
                <div class="milestone-dot"></div>
                <span class="milestone-label">Near Complete</span>
              </div>
              <div class="milestone" [class.active]="getActivityProgress() >= 100">
                <div class="milestone-dot"></div>
                <span class="milestone-label">Completed</span>
              </div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Main Content with Tabs -->
      <mat-tab-group class="activity-tabs" dynamicHeight>
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="tab-content">
            <div class="content-grid">
              <!-- Activity Details Card -->
              <mat-card class="details-card enhanced">
                <mat-card-header>
                  <mat-icon mat-card-avatar>assignment</mat-icon>
                  <mat-card-title>Activity Information</mat-card-title>
                  <mat-card-subtitle>Complete activity details and specifications</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="detail-section">
                    <h4 class="section-title">
                      <mat-icon>group</mat-icon>
                      Assigned Team Members
                    </h4>
                    <div class="assigned-members" *ngIf="activity.assignedMembers?.length; else noMembers">
                      <div class="member-chips">
                        <mat-chip *ngFor="let member of activity.assignedMembers" class="member-chip">
                          <div class="member-avatar">{{ getMemberInitials(member.name) }}</div>
                          <span class="member-name">{{ member.name }}</span>
                          <span class="member-id">({{ member.empId }})</span>
                        </mat-chip>
                      </div>
                    </div>
                    <ng-template #noMembers>
                      <div class="empty-state-inline">
                        <mat-icon>person_off</mat-icon>
                        <span>No members assigned yet</span>
                      </div>
                    </ng-template>
                  </div>

                  <mat-divider class="section-divider"></mat-divider>

                  <div class="detail-section" *ngIf="activity.attachments && activity.attachments.length > 0">
                    <h4 class="section-title">
                      <mat-icon>attachment</mat-icon>
                      Attachments ({{ activity.attachments.length }})
                    </h4>
                    <div class="attachments-grid">
                      <div *ngFor="let attachment of activity.attachments" 
                           class="attachment-card" matRipple>
                        <div class="attachment-icon">
                          <mat-icon>{{ getAttachmentIcon(attachment.originalName) }}</mat-icon>
                        </div>
                        <div class="attachment-details">
                          <h5 class="attachment-name">{{ attachment.originalName }}</h5>
                          <p class="attachment-size">{{ formatFileSize(attachment.fileSize) }}</p>
                        </div>
                        <div class="attachment-actions">
                          <button 
                            mat-icon-button 
                            color="primary" 
                            (click)="downloadAttachment(attachment.filename, attachment.originalName)"
                            matTooltip="Download">
                            <mat-icon>download</mat-icon>
                          </button>
                          <button 
                            mat-icon-button 
                            (click)="previewAttachment(attachment)"
                            matTooltip="Preview"
                            *ngIf="canPreview(attachment.originalName)">
                            <mat-icon>visibility</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <mat-divider class="section-divider" *ngIf="activity.attachments?.length"></mat-divider>

                  <div class="detail-section" *ngIf="activity.links && activity.links.length > 0">
                    <h4 class="section-title">
                      <mat-icon>link</mat-icon>
                      Related Links ({{ activity.links.length }})
                    </h4>
                    <div class="links-grid">
                      <mat-card *ngFor="let link of activity.links" class="link-card" matRipple>
                        <div class="link-content" (click)="openLink(link.url)">
                          <mat-icon class="link-icon">open_in_new</mat-icon>
                          <div class="link-info">
                            <h5>{{ link.url }}</h5>
                            <!-- <p class="link-url">{{ link.url }}</p> -->
                          </div>
                        </div>
                        <button mat-icon-button (click)="copyLink(link.url)" matTooltip="Copy Link">
                          <mat-icon>content_copy</mat-icon>
                        </button>
                      </mat-card>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Activity Stats & Info Sidebar -->
              <div class="sidebar-cards">
                <!-- Quick Actions -->
                <mat-card class="action-card" *ngIf="canUpdate$ | async">
                  <mat-card-header>
                    <mat-icon mat-card-avatar color="primary">flash_on</mat-icon>
                    <mat-card-title>Quick Actions</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="quick-actions">
                      <button mat-stroked-button color="primary" (click)="updateStatusQuick('in-progress')" 
                              *ngIf="activity.status === 'pending'" class="quick-action-btn">
                        <mat-icon>play_arrow</mat-icon>
                        Start Working
                      </button>
                      <button mat-stroked-button color="accent" (click)="updateStatusQuick('completed')" 
                              *ngIf="activity.status !== 'in-progress'" class="quick-action-btn">
                        <mat-icon>check_circle</mat-icon>
                        Mark Complete
                      </button>
                      <button mat-stroked-button color="warn" (click)="updateStatusQuick('on-hold')" 
                              *ngIf="activity.status !== 'on-hold' && activity.status !== 'completed'" 
                              class="quick-action-btn">
                        <mat-icon>pause_circle</mat-icon>
                        Put On Hold
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Activity Information -->
                <mat-card class="info-card enhanced">
                  <mat-card-header>
                    <mat-icon mat-card-avatar>info</mat-icon>
                    <mat-card-title>Activity Details</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-list">
                      <div class="info-item">
                        <mat-icon>person</mat-icon>
                        <div class="info-content">
                          <span class="info-label">Created by</span>
                          <span class="info-value">{{ getCreatorName() }}</span>
                          <span class="info-secondary">{{ getCreatorEmpId() }}</span>
                        </div>
                      </div>

                      <div class="info-item">
                        <mat-icon>schedule</mat-icon>
                        <div class="info-content">
                          <span class="info-label">Created</span>
                          <span class="info-value">{{ formatDate(activity.createdAt) }}</span>
                          <span class="info-secondary">{{ formatRelativeDate(activity.createdAt) }}</span>
                        </div>
                      </div>

                      <div class="info-item" *ngIf="activity.targetDate">
                        <mat-icon [class]="getDueDateClass(activity.targetDate) + '-icon'">event</mat-icon>
                        <div class="info-content">
                          <span class="info-label">Due Date</span>
                          <span class="info-value" [class]="getDueDateClass(activity.targetDate)">
                            {{ formatDate(activity.targetDate) }}
                          </span>
                          <span class="info-secondary">{{ getDaysUntilDue(activity.targetDate) }}</span>
                        </div>
                      </div>

                      <div class="info-item" *ngIf="activity.priority">
                        <mat-icon class="priority-icon">flag</mat-icon>
                        <div class="info-content">
                          <span class="info-label">Priority</span>
                          <span class="info-value priority-{{ (activity.priority || 'medium').toLowerCase() }}">
                            {{ getPriorityLabel(activity.priority) }}
                          </span>
                        </div>
                      </div>

                      <div class="info-item">
                        <mat-icon>update</mat-icon>
                        <div class="info-content">
                          <span class="info-label">Last Updated</span>
                          <span class="info-value">{{ formatDate(activity.updatedAt) }}</span>
                          <span class="info-secondary">{{ formatRelativeDate(activity.updatedAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Comments & Updates Tab -->
        <mat-tab label="Comments & Updates">
          <div class="tab-content">
            <div class="comments-section">
              <mat-card class="comments-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar>comment</mat-icon>
                  <mat-card-title>Activity Comments</mat-card-title>
                  <mat-card-subtitle>Track progress and communicate with team members</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <!-- Add Comment Form -->
                  <form [formGroup]="remarkForm" (ngSubmit)="addRemark()" class="comment-form">
                    <div class="form-header">
                      <div class="user-avatar">{{ getCurrentUserInitials() }}</div>
                      <h4>Add a comment</h4>
                    </div>
                    <mat-form-field appearance="outline" class="comment-input">
                      <mat-label>What's on your mind?</mat-label>
                      <textarea
                        matInput
                        formControlName="text"
                        placeholder="Share an update, ask a question, or leave feedback..."
                        rows="4"
                        maxlength="1000"
                        (input)="onRemarkInput()"
                      ></textarea>
                      <mat-hint align="end">
                        {{ remarkForm.get('text')?.value?.length || 0 }}/1000
                      </mat-hint>
                      <mat-error *ngIf="showRemarkValidationErrors && remarkForm.get('text')?.hasError('required')">
                        Please enter a comment
                      </mat-error>
                    </mat-form-field>
                    <div class="form-actions">
                      <button 
                        mat-raised-button 
                        color="primary" 
                        type="submit"
                        [disabled]="remarkForm.invalid || isAddingRemark">
                        <mat-icon *ngIf="!isAddingRemark">send</mat-icon>
                        <mat-progress-spinner *ngIf="isAddingRemark" diameter="20"></mat-progress-spinner>
                        {{ isAddingRemark ? 'Posting...' : 'Post Comment' }}
                      </button>
                    </div>
                  </form>

                  <mat-divider class="comments-divider"></mat-divider>

                  <!-- Comments List -->
                  <div class="comments-list" *ngIf="activity.remarks && activity.remarks.length > 0; else noComments">
                    <div class="comment-thread">
                      <div *ngFor="let remark of getSortedRemarks(); let i = index" 
                           class="comment-item" 
                           [class.system-comment]="remark.type === 'status-update'"
                           [class.user-comment]="remark.type === 'general'"
                           [class.own-comment]="isOwnComment(remark)">
                        
                        <div class="comment-timeline" *ngIf="i < getSortedRemarks().length - 1">
                          <div class="timeline-line"></div>
                        </div>
                        
                        <div class="comment-content">
                          <div class="comment-header">
                            <div class="comment-avatar">
                              <div class="avatar-circle" [class]="remark.type === 'status-update' ? 'system-avatar' : 'user-avatar'">
                                <mat-icon *ngIf="remark.type === 'status-update'">settings</mat-icon>
                                <span *ngIf="remark.type === 'general'">{{ getUserInitials(remark.userName) }}</span>
                              </div>
                            </div>
                            
                            <div class="comment-meta">
                              <h5 class="comment-author">
                                {{ remark.type === 'status-update' ? 'System' : remark.userName }}
                                <mat-chip class="comment-badge" *ngIf="remark.type === 'status-update'">
                                  AUTO
                                </mat-chip>
                              </h5>
                              <p class="comment-date">{{ formatRelativeDate(remark.createdAt) }}</p>
                            </div>
                            
                            <div class="comment-actions" *ngIf="canEditRemark(remark)">
                              <button mat-icon-button [matMenuTriggerFor]="commentMenu">
                                <mat-icon>more_vert</mat-icon>
                              </button>
                              <mat-menu #commentMenu="matMenu">
                                <button mat-menu-item (click)="editRemark(remark)" *ngIf="!remark.isEditing">
                                  <mat-icon>edit</mat-icon>
                                  <span>Edit</span>
                                </button>
                                <button mat-menu-item (click)="deleteRemark(remark.id)" class="delete-action">
                                  <mat-icon>delete</mat-icon>
                                  <span>Delete</span>
                                </button>
                              </mat-menu>
                            </div>
                          </div>
                          
                          <div class="comment-body">
                            <div *ngIf="!remark.isEditing" class="comment-text">
                              {{ remark.text }}
                            </div>
                            <div *ngIf="remark.isEditing" class="comment-edit">
                              <mat-form-field appearance="outline" class="edit-field">
                                <textarea
                                  matInput
                                  [(ngModel)]="remark.editText"
                                  placeholder="Edit your comment..."
                                  rows="3"
                                ></textarea>
                              </mat-form-field>
                              <div class="edit-actions">
                                <button mat-button color="primary" (click)="saveRemarkEdit(remark)">
                                  <mat-icon>check</mat-icon>
                                  Save
                                </button>
                                <button mat-button (click)="cancelRemarkEdit(remark)">
                                  <mat-icon>close</mat-icon>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ng-template #noComments>
                    <div class="no-comments">
                      <div class="no-comments-content">
                        <mat-icon class="no-comments-icon">chat_bubble_outline</mat-icon>
                        <h4>No comments yet</h4>
                        <p>Be the first to leave a comment and start the conversation!</p>
                      </div>
                    </div>
                  </ng-template>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Status Management Tab -->
        <mat-tab label="Status Management" *ngIf="canUpdate$ | async">
          <div class="tab-content">
            <mat-card class="status-management-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>track_changes</mat-icon>
                <mat-card-title>Update Activity Status</mat-card-title>
                <mat-card-subtitle>Change the status and add update notes</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="statusForm" (ngSubmit)="updateStatus()" class="status-form">
                  <div class="current-status">
                    <h4>Current Status</h4>
                    <mat-chip class="current-status-chip" [class]="'status-' + activity.status">
                      <mat-icon>{{ getStatusIcon(activity.status) }}</mat-icon>
                      {{ getStatusLabel(activity.status) }}
                    </mat-chip>
                  </div>

                  <mat-form-field appearance="outline" class="status-select">
                    <mat-label>New Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="pending">
                        <mat-icon>schedule</mat-icon>
                        Pending
                      </mat-option>
                      <mat-option value="in-progress">
                        <mat-icon>play_arrow</mat-icon>
                        In Progress
                      </mat-option>
                      <mat-option value="completed">
                        <mat-icon>check_circle</mat-icon>
                        Completed
                      </mat-option>
                      <mat-option value="on-hold">
                        <mat-icon>pause_circle</mat-icon>
                        On Hold
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="statusForm.get('status')?.hasError('required')">
                      Please select a status
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="remarks-field">
                    <mat-label>Update Notes (Optional)</mat-label>
                    <textarea
                      matInput
                      formControlName="remarks"
                      placeholder="Add notes about this status change..."
                      rows="4"
                      maxlength="500"
                    ></textarea>
                    <mat-hint align="end">
                      {{ statusForm.get('remarks')?.value?.length || 0 }}/500
                    </mat-hint>
                  </mat-form-field>

                  <div class="status-form-actions">
                    <button 
                      mat-raised-button 
                      color="primary" 
                      type="submit"
                      [disabled]="statusForm.invalid || isUpdatingStatus"
                      class="update-btn">
                      <mat-icon *ngIf="!isUpdatingStatus">update</mat-icon>
                      <mat-progress-spinner *ngIf="isUpdatingStatus" diameter="20"></mat-progress-spinner>
                      {{ isUpdatingStatus ? 'Updating...' : 'Update Status' }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    /* Container & Layout */
    .activity-details-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
      margin-top: 64px;
      background: #f8f9fa;
      min-height: calc(100vh - 64px);
    }

    /* Loading & Error States */
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 64px);
      background: #f8f9fa;
    }

    .loading-content {
      text-align: center;
      padding: 48px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .loading-content h3 {
      margin: 24px 0 12px 0;
      color: #333;
      font-weight: 500;
    }

    .loading-content p {
      margin: 0;
      color: #666;
    }

    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 64px);
      background: #f8f9fa;
    }

    .error-content {
      text-align: center;
      padding: 48px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      max-width: 500px;
    }

    .error-icon {
      font-size: 72px;
      height: 72px;
      width: 72px;
      color: #f44336;
      margin-bottom: 24px;
    }

    .error-content h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-weight: 500;
    }

    .error-content p {
      margin: 0 0 32px 0;
      color: #666;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    /* Hero Header Enhanced */
    .hero-header {
      position: relative;
      overflow: hidden;
      margin-bottom: 0;
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 1;
    }

    .background-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 50px 50px, 30px 30px;
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    .background-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(102, 126, 234, 0.9) 0%, 
        rgba(118, 75, 162, 0.8) 100%);
      backdrop-filter: blur(2px);
    }

    .hero-content {
      position: relative;
      z-index: 2;
      color: white;
      padding: 32px 48px 48px;
    }

    .header-navigation {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
    }

    .back-button {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      transition: all 0.3s ease;
    }

    .back-button:hover {
      background: rgba(255,255,255,0.25);
      transform: translateX(-2px);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .breadcrumb-item {
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.3s ease;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .breadcrumb-item:hover {
      opacity: 1;
      background: rgba(255,255,255,0.1);
    }

    .breadcrumb-current {
      font-weight: 500;
      opacity: 1;
    }

    .breadcrumb-arrow {
      font-size: 16px;
      height: 16px;
      width: 16px;
      opacity: 0.6;
      width: 16px;
    }

    .activity-hero-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 40px;
    }

    .activity-title-section {
      flex: 1;
    }

    .activity-title {
      font-size: 42px;
      font-weight: 300;
      margin: 0 0 16px 0;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .activity-subtitle {
      font-size: 18px;
      opacity: 0.9;
      margin: 0 0 32px 0;
      line-height: 1.6;
      max-width: 600px;
    }

    .activity-badges {
      margin-bottom: 32px;
    }

    .badge-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .status-chip, .priority-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 28px;
      font-weight: 600;
      font-size: 14px;
      backdrop-filter: blur(15px);
      border: 2px solid rgba(255,255,255,0.3);
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .status-chip {
      background: rgba(255,255,255,0.25);
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .status-chip:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      border-color: rgba(255,255,255,0.5);
    }

    .priority-chip {
      background: rgba(255,255,255,0.15);
      color: white;
    }

    .chip-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .activity-metadata {
      margin-top: 8px;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    }

    .metadata-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(255,255,255,0.15);
      border-radius: 8px;
    }

    .metadata-icon mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    .metadata-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .metadata-label {
      font-size: 11px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metadata-value {
      font-size: 14px;
      font-weight: 500;
    }

    .due-date.overdue {
      color: #ffcdd2;
    }

    .due-date.due-soon {
      color: #ffffffff;
    }

    .action-section {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .primary-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .primary-action-btn {
      backdrop-filter: blur(15px);
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      font-weight: 500;
      padding: 12px 24px;
      transition: all 0.3s ease;
    }

    .primary-action-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }

    .more-actions-btn {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
    }

    .more-actions-btn:hover {
      background: rgba(255,255,255,0.2);
    }

    .action-menu ::ng-deep .mat-mdc-menu-panel {
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .delete-action {
      color: #f44336;
    }

    /* Enhanced Progress Section */
    .progress-section {
      padding: 0 48px;
      margin-top: -20px;
      position: relative;
      z-index: 3;
    }

    .progress-card {
      border-radius: 20px;
      overflow: hidden;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border: 1px solid #e3f2fd;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      backdrop-filter: blur(10px);
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      border-bottom: 1px solid #f0f0f0;
    }

    .progress-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .section-icon {
      color: #667eea;
      font-size: 28px;
      height: 28px;
      width: 28px;
    }

    .progress-title h3 {
      margin: 0 0 4px 0;
      color: #333;
      font-weight: 600;
      font-size: 20px;
    }

    .progress-title p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .progress-percentage {
      text-align: right;
    }

    .percentage-value {
      font-size: 32px;
      font-weight: 300;
      color: #667eea;
      display: block;
      line-height: 1;
    }

    .percentage-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .progress-indicator-section {
      padding: 24px 32px 32px;
    }

    .enhanced-progress-bar {
      height: 16px;
      border-radius: 8px;
      margin-bottom: 32px;
      background-color: #f0f2f5;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    .enhanced-progress-bar ::ng-deep .mdc-linear-progress__bar-inner {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .progress-milestones {
      display: flex;
      justify-content: space-between;
      position: relative;
      margin-top: 8px;
    }

    .milestone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
    }

    .milestone:hover {
      transform: translateY(-2px);
    }

    .milestone-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #e0e0e0;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
      position: relative;
    }

    .milestone.active .milestone-dot {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transform: scale(1.2);
    }

    .milestone.active .milestone-dot::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 10px;
      font-weight: bold;
    }

    .milestone.active .milestone-dot {
      background: #667eea;
      transform: scale(1.2);
    }

    .milestone-label {
      font-size: 11px;
      color: #666;
      text-align: center;
      font-weight: 500;
    }

    .milestone.active .milestone-label {
      color: #667eea;
      font-weight: 600;
    }

    /* Tabs */
    .activity-tabs {
      margin: 24px 48px 48px;
    }

    .activity-tabs ::ng-deep .mat-mdc-tab-group {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .activity-tabs ::ng-deep .mat-mdc-tab-header {
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .activity-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      padding: 0;
    }

    .tab-content {
      padding: 32px;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
    }

    /* Enhanced Cards */
    .details-card.enhanced {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e0e0e0;
    }

    .details-card.enhanced mat-card-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 24px;
    }

    .details-card.enhanced mat-card-content {
      padding: 32px;
    }

    .detail-section {
      margin-bottom: 32px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 20px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .section-title mat-icon {
      color: #667eea;
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    .section-divider {
      margin: 32px 0;
    }

    /* Member Chips */
    .member-chips {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .member-chip {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-radius: 24px;
      color: #1976d2;
      font-weight: 500;
    }

    .member-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .member-name {
      font-weight: 500;
    }

    .member-id {
      font-size: 12px;
      opacity: 0.8;
    }

    .empty-state-inline {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #666;
      font-style: italic;
      padding: 16px 0;
    }

    /* Attachments Grid */
    .attachments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .attachment-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .attachment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      border-color: #667eea;
    }

    .attachment-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .attachment-icon mat-icon {
      font-size: 24px;
      height: 24px;
      width: 24px;
    }

    .attachment-details {
      flex: 1;
    }

    .attachment-name {
      font-weight: 500;
      color: #333;
      margin: 0 0 4px 0;
      font-size: 14px;
    }

    .attachment-size {
      color: #666;
      font-size: 12px;
      margin: 0;
    }

    .attachment-actions {
      display: flex;
      gap: 4px;
    }

    /* Links Grid */
    .links-grid {
      display: grid;
      gap: 12px;
    }

    .link-card {
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid #e0e0e0;
      flex-direction: row;
      align-items: center;
    }

    .link-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      border-color: #1976d2;
    }

    .link-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      flex: 1;
    }

    .link-icon {
      color: #1976d2;
    }

    .link-info {
      flex: 1;
    }

    .link-info h5 {
      margin: 0 0 4px 0;
      font-weight: 500;
      color: #333;
    }

    .link-url {
      font-size: 12px;
      color: #666;
      word-break: break-all;
    }

    /* Sidebar Cards */
    .sidebar-cards {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .action-card, .info-card.enhanced {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e0e0e0;
      overflow: hidden;
    }

    .action-card mat-card-header, .info-card.enhanced mat-card-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 20px;
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .quick-action-btn {
      justify-content: flex-start;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .quick-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      border-color: currentColor;
    }

    .quick-action-btn mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    /* Info List */
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .info-item mat-icon {
      color: #667eea;
      margin-top: 4px;
    }

    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .info-secondary {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    /* Comments Section */
    .comments-section {
      // max-width: 800px;
    }

    .comments-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e0e0e0;
      overflow: hidden;
    }

    .comments-card mat-card-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 24px;
    }

    .comments-card mat-card-content {
      padding: 32px;
    }

    /* Comment Form */
    .comment-form {
      margin-bottom: 40px;
      padding: 24px;
      background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 16px;
      border: 2px solid #e3e8ed;
      transition: all 0.3s ease;
    }

    .comment-form:focus-within {
      border-color: #667eea;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    }

    .form-header h4 {
      margin: 0;
      color: #333;
      font-weight: 600;
      font-size: 18px;
    }

    .comment-input {
      width: 100%;
      margin-bottom: 24px;
    }

    .comment-input ::ng-deep .mat-mdc-form-field-outline {
      border-radius: 12px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .form-actions button {
      border-radius: 12px;
      font-weight: 600;
      padding: 12px 24px;
      transition: all 0.3s ease;
    }

    .form-actions button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .comments-divider {
      margin: 32px 0;
    }

    /* Comments List */
    .comment-thread {
      position: relative;
      max-height:400px;
      overflow:scroll;
      overflow-x:hidden;
    }

    .comment-item {
      position: relative;
      margin-bottom: 32px;
      transition: all 0.3s ease;
    }

    .comment-item:hover {
      transform: translateX(4px);
    }

    .comment-timeline {
      position: absolute;
      left: 20px;
      top: 60px;
      bottom: -24px;
      width: 2px;
      background: #e0e0e0;
      z-index: 1;
    }

    .comment-item:last-child .comment-timeline {
      display: none;
    }

    .comment-content {
      display: flex;
      gap: 16px;
      position: relative;
      z-index: 2;
    }

    .comment-avatar {
      flex-shrink: 0;
    }

    .avatar-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    }

    .avatar-circle:hover {
      transform: scale(1.1);
    }

    .user-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .system-avatar {
      background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
      color: white;
      position: relative;
    }

    .system-avatar::after {
      content: '';
      position: absolute;
      top: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #4caf50;
      border-radius: 50%;
      border: 2px solid white;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .comment-meta {
      flex: 1;
    }

    .comment-author {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #333;
    }

    .comment-badge {
      background: #f44336;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .comment-date {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .comment-body {
      background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #e3e8ed;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
      position: relative;
    }

    .comment-body::before {
      content: '';
      position: absolute;
      top: 20px;
      left: -8px;
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-right: 8px solid #ffffff;
      filter: drop-shadow(-2px 0 2px rgba(0,0,0,0.05));
    }

    .comment-body:hover {
      border-color: #667eea;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
    }

    .comment-text {
      line-height: 1.6;
      color: #333;
      margin: 0;
    }

    .system-comment .comment-body {
      background: linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%);
      border-color: #2196f3;
      border-left: 4px solid #1976d2;
      position: relative;
    }

    .system-comment .comment-body::before {
      border-right-color: #e3f2fd;
    }

    .system-comment .comment-text {
      color: #0d47a1;
      font-weight: 500;
      position: relative;
    }

    .system-comment .comment-text::before {
      content: '🔄';
      margin-right: 8px;
      opacity: 0.7;
    }

    .own-comment .comment-body {
      background: #e8f5e8;
      border-color: #4caf50;
    }

    .comment-edit {
      margin-top: 12px;
    }

    .edit-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .edit-actions {
      display: flex;
      gap: 12px;
    }

    .no-comments {
      text-align: center;
      padding: 64px 32px;
    }

    .no-comments-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .no-comments-icon {
      font-size: 72px;
      height: 72px;
      width: 72px;
      color: #ccc;
    }

    .no-comments h4 {
      margin: 0;
      color: #666;
      font-weight: 500;
    }

    .no-comments p {
      margin: 0;
      color: #999;
      font-size: 14px;
    }

    /* Status Management */
    .status-management-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e0e0e0;
      overflow: hidden;
      // max-width: 600px;
    }

    .status-management-card mat-card-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 24px;
    }

    .status-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .current-status {
      margin-bottom: 8px;
    }

    .current-status h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-weight: 500;
    }

    .current-status-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 24px;
      font-weight: 500;
    }

    .status-select, .remarks-field {
      width: 100%;
    }

    .status-form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .update-btn {
      min-width: 160px;
    }

    /* Enhanced Status Colors */
    .status-pending { 
      background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
      color: #e65100;
      border-color: #ff8f00;
      box-shadow: 0 2px 12px rgba(255, 143, 0, 0.3);
    }
    
    .status-in-progress { 
      background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
      color: #0277bd;
      border-color: #03a9f4;
      box-shadow: 0 2px 12px rgba(3, 169, 244, 0.3);
    }
    
    .status-completed { 
      background: linear-gradient(135deg, #e8f5e8 0%, #a5d6a7 100%);
      color: #1b5e20;
      border-color: #4caf50;
      box-shadow: 0 2px 12px rgba(76, 175, 80, 0.3);
    }
    
    .status-on-hold { 
      background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
      color: #ad1457;
      border-color: #e91e63;
      box-shadow: 0 2px 12px rgba(233, 30, 99, 0.3);
    }

    /* Priority Colors */
    .priority-low { 
      color: #4caf50; 
      font-weight: 500; 
    }
    
    .priority-medium { 
      color: #ff9800; 
      font-weight: 500; 
    }
    
    .priority-high { 
      color: #f44336; 
      font-weight: 500; 
    }
    
    .priority-urgent { 
      color: #d32f2f; 
      font-weight: 600; 
    }

    /* Due Date Colors */
    .due-date.overdue, .overdue-icon {
      color: #f44336 !important;
    }

    .due-date.due-soon, .due-soon-icon {
      color: #ff9800 !important;
    }

    .due-date.due-later, .due-later-icon {
      color: #ffffff !important;
    }

    /* Utility Classes */
    .delete-action {
      color: #f44336 !important;
    }

    .delete-action mat-icon {
      color: #f44336 !important;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .hero-content {
        padding: 32px;
      }

      .activity-tabs {
        margin: 16px 24px 24px;
      }

      .tab-content {
        padding: 24px;
      }

      .content-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }

    @media (max-width: 768px) {
      .activity-details-container {
        margin-top: 56px;
      }

      .hero-content {
        padding: 24px 16px;
      }

      .activity-hero-info {
        flex-direction: column;
        gap: 24px;
      }

      .activity-title {
        font-size: 28px;
      }

      .activity-subtitle {
        font-size: 16px;
      }

      .activity-metadata {
        flex-direction: column;
        gap: 12px;
      }

      .activity-tabs {
        margin: 16px 16px 24px;
      }

      .tab-content {
        padding: 20px;
      }

      .progress-section {
        padding: 16px;
      }

      .progress-content {
        flex-direction: column;
        gap: 20px;
      }

      .progress-indicator {
        min-width: auto;
        width: 100%;
      }

      .attachments-grid {
        grid-template-columns: 1fr;
      }

      .member-chips {
        flex-direction: column;
        align-items: flex-start;
      }

      .action-buttons {
        width: 100%;
        justify-content: center;
      }

      .activity-badges {
        justify-content: center;
      }

      .comment-content {
        gap: 12px;
      }

      .avatar-circle {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }
    }

    @media (max-width: 480px) {
      .hero-content {
        padding: 20px 12px;
      }

      .activity-title {
        font-size: 24px;
      }

      .activity-subtitle {
        font-size: 14px;
      }

      .tab-content {
        padding: 16px;
      }

      .header-navigation {
        gap: 16px;
      }

      .breadcrumb {
        font-size: 12px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-btn {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class ActivityDetailsComponent implements OnInit, OnDestroy {
  activity: Activity | null = null;
  currentUser: User | null = null;
  error: string | null = null;
  remarkForm: FormGroup;
  statusForm: FormGroup;
  isAddingRemark = false;
  isUpdatingStatus = false;
  showRemarkValidationErrors = false;
  private subscriptions: Subscription[] = [];

  // Observable properties for template usage
  isAdmin$: Observable<boolean>;
  canUpdate$: Observable<boolean>; // For status management and quick actions
  canEdit$: Observable<boolean>;   // For editing activity details (creator + admin only)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private activityService: ActivityService,
    private authService: AuthService,
    private teamService: TeamService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.remarkForm = this.fb.group({
      text: ['', [Validators.required]]
    });

    this.statusForm = this.fb.group({
      status: ['', [Validators.required]],
      remarks: ['']
    });

    // Initialize observables
    this.isAdmin$ = this.authService.isAdmin();

    // Initialize canUpdate$ observable (for status management and quick actions)
    // Available to: admins, creators, and assigned members
    this.canUpdate$ = combineLatest([
      this.authService.isAdmin(),
      this.authService.currentUser$
    ]).pipe(
      map(([isAdmin, user]) => {
        if (!this.activity || !user) return false;
        
        // Allow updates for:
        // 1. Admins
        if (isAdmin) return true;
        
        // 2. Activity creator
        if (this.activity.createdBy && this.activity.createdBy === user.id) return true;
        
        // 3. Assigned members
        if (this.activity.assignedMembers && this.activity.assignedMembers.length > 0) {
          return this.activity.assignedMembers.map(m => m.id).includes(user.id);
        }
        
        return false;
      })
    );

    // Initialize canEdit$ observable (for editing activity details)
    // Available to: admins and creators only
    this.canEdit$ = combineLatest([
      this.authService.isAdmin(),
      this.authService.currentUser$
    ]).pipe(
      map(([isAdmin, user]) => {
        if (!this.activity || !user) return false;
        
        // Allow editing for:
        // 1. Admins
        if (isAdmin) return true;
        
        // 2. Activity creator only
        if (this.activity.createdBy && this.activity.createdBy === user.id) return true;
        
        return false;
      })
    );
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    this.subscriptions.push(
      this.route.params.subscribe(params => {
        const activityId = +params['id'];
        if (activityId) {
          this.loadActivityDetails(activityId);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadActivityDetails(activityId: number) {
    console.log('Loading activity details for ID:', activityId);
    console.log('Current user:', this.currentUser);
    this.error = null; // Reset error state

    this.subscriptions.push(
      this.activityService.getActivityById(activityId).subscribe({
        next: (activity) => {
          console.log('Activity loaded successfully:', activity);
          this.activity = activity;
          this.statusForm.patchValue({ status: activity.status });
        },
        error: (error) => {
          console.error('Failed to load activity details:', error);
          this.error = error.status === 403 ?
            'You do not have permission to view this activity' :
            'Failed to load activity details';
          this.snackBar.open(this.error, 'Close', { duration: 3000 });
        }
      })
    );
  }

  // Remove the old canUpdateActivity method since we're using canUpdate$ observable
  // Use canUpdate$ | async in templates instead

  addRemark() {
    if (this.remarkForm.invalid || !this.activity) {
      this.showRemarkValidationErrors = true;
      return;
    }
    
    this.showRemarkValidationErrors = false;
    this.isAddingRemark = true;
    const text = this.remarkForm.value.text;


    this.subscriptions.push(
      this.activityService.addRemarkToActivity(parseInt(this.activity.id), text).subscribe({
        next: (response) => {
          // Reset validation flag first
          this.showRemarkValidationErrors = false;
          
          // Reset the form and clear validation state completely
          this.remarkForm.reset();
          this.remarkForm.markAsUntouched();
          this.remarkForm.markAsPristine();
          
          // Also reset the individual control to be extra sure
          const textControl = this.remarkForm.get('text');
          if (textControl) {
            textControl.setValue(''); // Explicitly set empty value
            textControl.setErrors(null);
            textControl.markAsUntouched();
            textControl.markAsPristine();
          }
          
          // Use timeout to ensure form state is updated in next change detection cycle
          setTimeout(() => {
            this.remarkForm.updateValueAndValidity();
          }, 0);
          
          this.snackBar.open('Remark added successfully', 'Close', { duration: 3000 });
          this.loadActivityDetails(parseInt(this.activity!.id));
          this.isAddingRemark = false;
        },
        error: (error) => {
          this.isAddingRemark = false;
          this.snackBar.open('Failed to add remark', 'Close', { duration: 3000 });
        }
      })
    );
  }

  onRemarkInput() {
    // Clear validation errors when user starts typing
    this.showRemarkValidationErrors = false;
  }

  updateStatus() {
    if (this.statusForm.invalid || !this.activity) return;

    this.isUpdatingStatus = true;
    const { status, remarks } = this.statusForm.value;

    this.subscriptions.push(
      this.activityService.updateActivityStatus(parseInt(this.activity.id), status, remarks).subscribe({
        next: (response) => {
          this.isUpdatingStatus = false;
          this.statusForm.patchValue({ remarks: '' });
          this.snackBar.open('Status updated successfully', 'Close', { duration: 3000 });
          this.loadActivityDetails(parseInt(this.activity!.id));
        },
        error: (error) => {
          this.isUpdatingStatus = false;
          this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
        }
      })
    );
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

  getMemberName(memberId: string): string {
    if (!memberId) return 'Unknown Member';
    // This would typically come from a service or be part of the activity data
    return `Member ${memberId.substring(0, 8)}`;
  }

  getCreatorName(): string {
    // Use the createdByName field if available, otherwise fall back to createdBy ID
    return this.activity?.createdByName || this.activity?.createdBy || 'Unknown User';
  }

  getCreatorEmpId(): string {
    return this.activity?.createdByEmpId || 'Unknown Emp ID';
  }

  getAttachmentIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'grid_on';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'txt':
        return 'text_snippet';
      default:
        return 'attachment';
    }
  }

  downloadAttachment(filename: string, originalName: string) {
    if (!filename) {
      this.snackBar.open('Invalid file', 'Close', { duration: 3000 });
      return;
    }

    this.subscriptions.push(
      this.activityService.downloadAttachment(filename).subscribe({
        next: (blob) => {
          // Create a download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = originalName || filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.snackBar.open('Download started', 'Close', { duration: 2000 });
        },
        error: (error) => {
          console.error('Download error:', error);
          this.snackBar.open('Failed to download file', 'Close', { duration: 3000 });
        }
      })
    );
  }

  openLink(url: string) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent'
    };
    return labels[priority?.toLowerCase()] || priority;
  }

  canEditRemark(remark: Remark): boolean {
    if (!this.currentUser) return false;

    // Status update remarks cannot be edited or deleted
    if (remark.type === 'status-update') return false;

    // Admin can edit all general remarks, user can edit only their own remarks
    return this.currentUser.role === 'admin' || remark.userId === this.currentUser.id;
  }

  editRemark(remark: Remark) {
    remark.isEditing = true;
    remark.editText = remark.text;
  }

  cancelRemarkEdit(remark: Remark) {
    remark.isEditing = false;
    delete remark.editText;
  }

  saveRemarkEdit(remark: Remark) {
    if (!remark.editText || remark.editText.trim() === '') {
      this.snackBar.open('Remark text cannot be empty', 'Close', { duration: 3000 });
      return;
    }

    this.subscriptions.push(
      this.activityService.updateRemark(remark.id, remark.editText.trim()).subscribe({
        next: (response) => {
          remark.text = remark.editText!;
          remark.isEditing = false;
          delete remark.editText;
          this.snackBar.open('Remark updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Failed to update remark', 'Close', { duration: 3000 });
        }
      })
    );
  }

  deleteRemark(remarkId: string) {
    if (!confirm('Are you sure you want to delete this remark?')) {
      return;
    }

    this.subscriptions.push(
      this.activityService.deleteRemark(remarkId).subscribe({
        next: (response) => {
          this.snackBar.open('Remark deleted successfully', 'Close', { duration: 3000 });
          // Reload activity to refresh remarks list
          if (this.activity) {
            this.loadActivityDetails(parseInt(this.activity.id));
          }
        },
        error: (error) => {
          this.snackBar.open('Failed to delete remark', 'Close', { duration: 3000 });
        }
      })
    );
  }

  canEditActivity(): boolean {
    if (!this.currentUser || !this.activity) return false;

    // Allow editing for:
    // 1. Admins
    if (this.currentUser.role === 'admin') return true;
    
    // 2. Activity creator only (not assigned members)
    if (this.activity.createdBy && this.activity.createdBy === this.currentUser.id) return true;
    
    return false;
  }

  editActivity() {
    if (!this.activity || !this.canEditActivity()) return;

    // First get team data
    this.subscriptions.push(
      this.teamService.getTeamById(this.activity.teamId).subscribe({
        next: (team) => {
          const dialogRef = this.dialog.open(CreateActivityDialogComponent, {
            width: '600px',
            data: {
              teamId: this.activity!.teamId,
              teamName: team.name,
              members: team.members || [],
              activity: this.activity,
              isEdit: true
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.snackBar.open('Activity updated successfully', 'Close', { duration: 3000 });
              // Reload the activity details
              this.loadActivityDetails(parseInt(this.activity!.id));
            }
          });
        },
        error: (error) => {
          console.error('Failed to load team data for editing:', error);
          this.snackBar.open('Failed to load team data', 'Close', { duration: 3000 });
        }
      })
    );
  }

  deleteActivity() {
    if (!this.activity || !this.canEditActivity()) return;

    const confirmMessage = `Are you sure you want to delete the activity "${this.activity.name}"? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.subscriptions.push(
      this.activityService.deleteActivity(parseInt(this.activity.id)).subscribe({
        next: (response) => {
          this.snackBar.open('Activity deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Failed to delete activity:', error);
          this.snackBar.open('Failed to delete activity', 'Close', { duration: 3000 });
        }
      })
    );
  }

  goBack() {
    this.router.navigate(['/teams/' + this.activity!.teamId]);
  }

  // New enhanced methods for the improved UI
  reloadActivity() {
    if (this.activity) {
      this.loadActivityDetails(parseInt(this.activity.id));
    }
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'schedule',
      'in-progress': 'play_arrow',
      'completed': 'check_circle',
      'on-hold': 'pause_circle'
    };
    return icons[status] || 'help';
  }

  getActivityProgress(): number {
    if (!this.activity) return 0;

    const statusProgress: { [key: string]: number } = {
      'pending': 0,
      'in-progress': 50,
      'on-hold': 25,
      'completed': 100
    };

    return statusProgress[this.activity.status] || 0;
  }

  getMemberInitials(name: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  getCurrentUserInitials(): string {
    if (!this.currentUser) return 'U';
    return this.getMemberInitials(this.currentUser.name);
  }

  getUserInitials(userName: string): string {
    return this.getMemberInitials(userName);
  }

  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  getDaysUntilDue(targetDate: string): string {
    if (!targetDate) return '';

    const due = new Date(targetDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days remaining`;
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

  getSortedRemarks(): Remark[] {
    if (!this.activity?.remarks) return [];
    return [...this.activity.remarks].sort((a, b) =>
      -(new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
  }

  isOwnComment(remark: Remark): boolean {
    return this.currentUser?.id === remark.userId;
  }

  canPreview(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
    return previewableExtensions.includes(extension || '');
  }

  previewAttachment(attachment: any) {
    // Implement attachment preview functionality
    this.snackBar.open('Preview functionality coming soon', 'Close', { duration: 2000 });
  }

  copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Link copied to clipboard', 'Close', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Failed to copy link', 'Close', { duration: 3000 });
    });
  }

  updateStatusQuick(status: string) {
    if (!this.activity) return;

    this.statusForm.patchValue({
      status: status,
      remarks: `Status updated to ${this.getStatusLabel(status)} via quick action`
    });

    this.updateStatus();
  }

  duplicateActivity() {
    if (!this.activity) return;

    // Implementation for duplicating activity
    this.snackBar.open('Duplicate functionality coming soon', 'Close', { duration: 2000 });
  }

  exportActivity() {
    if (!this.activity) return;

    // Implementation for exporting activity details
    const activityData = {
      name: this.activity.name,
      description: this.activity.description,
      status: this.activity.status,
      priority: this.activity.priority,
      createdBy: this.getCreatorName(),
      createdAt: this.activity.createdAt,
      targetDate: this.activity.targetDate,
      assignedMembers: this.activity.assignedMembers?.map(m => ({ name: m.name, empId: m.empId })),
      remarks: this.activity.remarks?.map(r => ({
        author: r.userName,
        text: r.text,
        createdAt: r.createdAt
      }))
    };

    const dataStr = JSON.stringify(activityData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(dataBlob);
    link.download = `activity-${this.activity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Activity details exported', 'Close', { duration: 2000 });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
