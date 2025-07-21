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
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivityService } from '../../services/activity.service';
import { AuthService } from '../../services/auth.service';
import { Activity, User } from '../../models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="activity-details-container" *ngIf="activity">
      <!-- Header -->
      <div class="activity-header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        
        <div class="header-content">
          <div class="activity-info">
            <h1>{{ activity.title }}</h1>
            <p class="activity-description">{{ activity.description }}</p>
            <div class="activity-meta">
              <mat-chip [class]="'status-' + activity.status">
                {{ getStatusLabel(activity.status) }}
              </mat-chip>
              <span class="meta-item">
                <mat-icon>schedule</mat-icon>
                Created {{ formatDate(activity.createdAt) }}
              </span>
              <span class="meta-item" *ngIf="activity.targetDate">
                <mat-icon>event</mat-icon>
                Due {{ formatDate(activity.targetDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Main Content -->
        <div class="main-content">
          <!-- Activity Details -->
          <mat-card class="details-card">
            <mat-card-header>
              <mat-card-title>Activity Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-row">
                <span class="label">Assigned Members:</span>
                <div class="assigned-members">
                  <mat-chip-listbox>
                    <mat-chip *ngFor="let memberId of activity.assignedMembers">
                      {{ getMemberName(memberId) }}
                    </mat-chip>
                  </mat-chip-listbox>
                </div>
              </div>

              <div class="detail-row" *ngIf="activity.attachments.length > 0">
                <span class="label">Attachments:</span>
                <div class="attachments-list">
                  <div *ngFor="let attachment of activity.attachments" class="attachment-item">
                    <mat-icon>attachment</mat-icon>
                    <span>{{ attachment.originalName }}</span>
                    <span class="file-size">({{ formatFileSize(attachment.size) }})</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Remarks Section -->
          <mat-card class="remarks-card">
            <mat-card-header>
              <mat-card-title>Remarks & Updates</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <!-- Add Remark Form -->
              <form [formGroup]="remarkForm" (ngSubmit)="addRemark()" class="remark-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Add a remark</mat-label>
                  <textarea
                    matInput
                    formControlName="text"
                    placeholder="Enter your remark or update..."
                    rows="3"
                  ></textarea>
                  <mat-error *ngIf="remarkForm.get('text')?.hasError('required')">
                    Remark text is required
                  </mat-error>
                </mat-form-field>
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit"
                  [disabled]="remarkForm.invalid || isAddingRemark"
                >
                  Add Remark
                </button>
              </form>

              <!-- Remarks List -->
              <div class="remarks-list" *ngIf="activity.remarks.length > 0">
                <div *ngFor="let remark of activity.remarks" class="remark-item">
                  <div class="remark-header">
                    <span class="remark-author">{{ remark.userName }}</span>
                    <span class="remark-date">{{ formatDate(remark.createdAt) }}</span>
                  </div>
                  <p class="remark-text">{{ remark.text }}</p>
                </div>
              </div>

              <div *ngIf="activity.remarks.length === 0" class="no-remarks">
                <mat-icon>comment</mat-icon>
                <p>No remarks yet. Be the first to add an update!</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Status Update -->
          <mat-card class="status-card" *ngIf="canUpdateActivity()">
            <mat-card-header>
              <mat-card-title>Update Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="statusForm" (ngSubmit)="updateStatus()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="pending">Pending</mat-option>
                    <mat-option value="in_progress">In Progress</mat-option>
                    <mat-option value="completed">Completed</mat-option>
                    <mat-option value="on_hold">On Hold</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Update Remarks (Optional)</mat-label>
                  <textarea
                    matInput
                    formControlName="remarks"
                    placeholder="Add remarks about this status change..."
                    rows="2"
                  ></textarea>
                </mat-form-field>

                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit"
                  class="full-width"
                  [disabled]="statusForm.invalid || isUpdatingStatus"
                >
                  Update Status
                </button>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Activity Info -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-item">
                <mat-icon>person</mat-icon>
                <div>
                  <span class="info-label">Created by</span>
                  <span class="info-value">{{ getCreatorName() }}</span>
                </div>
              </div>

              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <div>
                  <span class="info-label">Created</span>
                  <span class="info-value">{{ formatDate(activity.createdAt) }}</span>
                </div>
              </div>

              <div class="info-item" *ngIf="activity.targetDate">
                <mat-icon>event</mat-icon>
                <div>
                  <span class="info-label">Due Date</span>
                  <span class="info-value">{{ formatDate(activity.targetDate) }}</span>
                </div>
              </div>

              <div class="info-item">
                <mat-icon>update</mat-icon>
                <div>
                  <span class="info-label">Last Updated</span>
                  <span class="info-value">{{ formatDate(activity.updatedAt) }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="!activity">
      <mat-icon>assignment</mat-icon>
      <p>Loading activity details...</p>
    </div>
  `,
  styles: [`
    .activity-details-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      margin-top: 64px;
    }

    .activity-header {
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

    .activity-info h1 {
      font-size: 28px;
      font-weight: 400;
      margin: 0 0 8px 0;
      color: #333;
    }

    .activity-description {
      font-size: 16px;
      color: #666;
      margin: 0 0 16px 0;
      line-height: 1.6;
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #666;
    }

    .meta-item mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .status-pending { background-color: #ff9800; color: white; }
    .status-in_progress { background-color: #2196f3; color: white; }
    .status-completed { background-color: #4caf50; color: white; }
    .status-on_hold { background-color: #f44336; color: white; }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .label {
      font-weight: 500;
      color: #333;
      min-width: 120px;
      margin-top: 8px;
    }

    .assigned-members {
      flex: 1;
    }

    .attachments-list {
      flex: 1;
    }

    .attachment-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .file-size {
      font-size: 12px;
      color: #666;
    }

    .remark-form {
      margin-bottom: 24px;
    }

    .remarks-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .remark-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 12px;
      background: #fafafa;
    }

    .remark-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .remark-author {
      font-weight: 500;
      color: #333;
    }

    .remark-date {
      font-size: 12px;
      color: #666;
    }

    .remark-text {
      margin: 0;
      color: #555;
      line-height: 1.5;
    }

    .no-remarks {
      text-align: center;
      color: #666;
      padding: 24px;
    }

    .no-remarks mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #ddd;
      margin-bottom: 8px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }

    .info-item mat-icon {
      color: #666;
      margin-top: 2px;
    }

    .info-item div {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 2px;
    }

    .info-value {
      font-size: 14px;
      color: #333;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
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
      .activity-details-container {
        padding: 16px;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .activity-header {
        flex-direction: column;
        align-items: stretch;
      }

      .activity-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .detail-row {
        flex-direction: column;
        gap: 8px;
      }

      .label {
        min-width: auto;
        margin-top: 0;
      }
    }
  `]
})
export class ActivityDetailsComponent implements OnInit, OnDestroy {
  activity: Activity | null = null;
  currentUser: User | null = null;
  remarkForm: FormGroup;
  statusForm: FormGroup;
  isAddingRemark = false;
  isUpdatingStatus = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private activityService: ActivityService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.remarkForm = this.fb.group({
      text: ['', [Validators.required]]
    });

    this.statusForm = this.fb.group({
      status: ['', [Validators.required]],
      remarks: ['']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        const activityId = params['id'];
        if (activityId) {
          this.loadActivityDetails(activityId);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadActivityDetails(activityId: string) {
    this.subscriptions.push(
      this.activityService.getActivityById(activityId).subscribe({
        next: (activity) => {
          this.activity = activity;
          this.statusForm.patchValue({ status: activity.status });
        },
        error: (error) => {
          this.snackBar.open('Failed to load activity details', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  canUpdateActivity(): boolean {
    if (!this.activity || !this.currentUser) return false;
    return this.authService.isAdmin() || 
           this.activity.assignedMembers.includes(this.currentUser.id);
  }

  addRemark() {
    if (this.remarkForm.invalid || !this.activity) return;

    this.isAddingRemark = true;
    const text = this.remarkForm.value.text;

    this.subscriptions.push(
      this.activityService.addRemarkToActivity(this.activity.id, text).subscribe({
        next: (response) => {
          this.isAddingRemark = false;
          this.remarkForm.reset();
          this.snackBar.open('Remark added successfully', 'Close', { duration: 3000 });
          this.loadActivityDetails(this.activity!.id);
        },
        error: (error) => {
          this.isAddingRemark = false;
          this.snackBar.open('Failed to add remark', 'Close', { duration: 3000 });
        }
      })
    );
  }

  updateStatus() {
    if (this.statusForm.invalid || !this.activity) return;

    this.isUpdatingStatus = true;
    const { status, remarks } = this.statusForm.value;

    this.subscriptions.push(
      this.activityService.updateActivityStatus(this.activity.id, status, remarks).subscribe({
        next: (response) => {
          this.isUpdatingStatus = false;
          this.statusForm.patchValue({ remarks: '' });
          this.snackBar.open('Status updated successfully', 'Close', { duration: 3000 });
          this.loadActivityDetails(this.activity!.id);
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
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'on_hold': 'On Hold'
    };
    return labels[status] || status;
  }

  getMemberName(memberId: string): string {
    // This would typically come from a service or be part of the activity data
    return `Member ${memberId.substring(0, 8)}`;
  }

  getCreatorName(): string {
    // This would typically come from a service or be part of the activity data
    return 'Admin User';
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

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
