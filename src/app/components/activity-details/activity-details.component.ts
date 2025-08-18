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
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivityService } from '../../services/activity.service';
import { AuthService } from '../../services/auth.service';
import { Activity, User } from '../../models';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

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
    MatSelectModule,
    MatTooltipModule
  ],
  template: `
    <!-- Loading State -->
    <div class="loading-state" *ngIf="!activity && !error">
      <mat-icon>hourglass_empty</mat-icon>
      <p>Loading activity details...</p>
    </div>

    <!-- Error State -->
    <div class="error-state" *ngIf="error">
      <mat-icon>error</mat-icon>
      <p>{{ error }}</p>
      <button mat-raised-button color="primary" (click)="goBack()">
        Go Back
      </button>
    </div>

    <!-- Activity Details -->
    <div class="activity-details-container" *ngIf="activity && !error">
      <!-- Header -->
      <div class="activity-header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        
        <div class="header-content">
          <div class="activity-info">
            <h1>{{ activity.name }}</h1>
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
                    <mat-chip *ngFor="let member of activity.assignedMembers || []">
                      {{ member.name }}
                    </mat-chip>
                  </mat-chip-listbox>
                </div>
              </div>

              <div class="detail-row" *ngIf="activity.attachments && activity.attachments.length > 0">
                <span class="label">Attachments:</span>
                <div class="attachments-list">
                  <div *ngFor="let attachment of activity.attachments" class="attachment-item">
                    <mat-icon>{{ getFileIcon(attachment.originalName) }}</mat-icon>
                    <span class="attachment-name">{{ attachment.originalName }}</span>
                    <span class="file-size">({{ formatFileSize(attachment.fileSize) }})</span>
                    <button 
                      mat-icon-button 
                      color="primary" 
                      (click)="downloadAttachment(attachment)"
                      matTooltip="Download file"
                    >
                      <mat-icon>download</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <div class="detail-row" *ngIf="activity.links && activity.links.length > 0">
                <span class="label">Related Links:</span>
                <div class="links-list">
                  <div *ngFor="let link of activity.links" class="link-item">
                    <mat-icon>link</mat-icon>
                    <a [href]="link.url" target="_blank" rel="noopener noreferrer" class="link-url">
                      {{ link.title || link.url }}
                    </a>
                    <button 
                      mat-icon-button 
                      color="primary" 
                      (click)="copyLink(link.url)"
                      matTooltip="Copy link"
                    >
                      <mat-icon>content_copy</mat-icon>
                    </button>
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
              <div class="remarks-list" *ngIf="activity.remarks && activity.remarks.length > 0">
                <div *ngFor="let remarkk of activity.remarks" class="remark-item">
                  <div class="remark-header">
                    <span class="remark-author">{{ remarkk.userName }}</span>
                    <span class="remark-date">{{ formatDate(remarkk.createdAt) }}</span>
                  </div>
                  <p class="remark-text">{{ remarkk.text }}</p>
                </div>
              </div>

              <div *ngIf="!activity.remarks || activity.remarks.length === 0" class="no-remarks">
                <mat-icon>comment</mat-icon>
                <p>No remarks yet. Be the first to add an update!</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Status Update -->
          <mat-card class="status-card" *ngIf="canUpdate$ | async">
            <mat-card-header>
              <mat-card-title>Update Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="statusForm" (ngSubmit)="updateStatus()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="pending">Pending</mat-option>
                    <mat-option value="in-progress">In Progress</mat-option>
                    <mat-option value="completed">Completed</mat-option>
                    <mat-option value="on-hold">On Hold</mat-option>
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
                  <span class="info-value">{{ getCreatorName() }} - {{ getCreatorEmpId() }}</span>
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
    .status-in-progress { background-color: #2196f3; color: white; }
    .status-completed { background-color: #4caf50; color: white; }
    .status-on-hold { background-color: #f44336; color: white; }

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
      padding: 12px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      margin-bottom: 8px;
      transition: background-color 0.2s;
    }

    .attachment-item:hover {
      background: #e9ecef;
    }

    .attachment-name {
      flex: 1;
      font-weight: 500;
      color: #333;
    }

    .links-list {
      flex: 1;
    }

    .link-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f0f7ff;
      border: 1px solid #b3d9ff;
      border-radius: 8px;
      margin-bottom: 8px;
      transition: background-color 0.2s;
    }

    .link-item:hover {
      background: #e6f3ff;
    }

    .link-url {
      flex: 1;
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .link-url:hover {
      text-decoration: underline;
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

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #f44336;
      text-align: center;
    }

    .error-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      color: #f44336;
    }

    .error-state p {
      margin-bottom: 24px;
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
  error: string | null = null;
  remarkForm: FormGroup;
  statusForm: FormGroup;
  isAddingRemark = false;
  isUpdatingStatus = false;
  private subscriptions: Subscription[] = [];
  
  // Observable properties for template usage
  isAdmin$: Observable<boolean>;
  canUpdate$: Observable<boolean>;

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

    // Initialize observables
    this.isAdmin$ = this.authService.isAdmin();
    
    // Initialize canUpdate$ observable
    this.canUpdate$ = combineLatest([
      this.authService.isAdmin(),
      this.authService.currentUser$
    ]).pipe(
      map(([isAdmin, user]) => {
        if (!this.activity || !user || !this.activity.assignedMembers) return false;
        return isAdmin || this.activity.assignedMembers.map(m => m.id).includes(user.id);
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
          console.log('Attachments:', activity.attachments);
          console.log('Links:', activity.links);
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
    if (this.remarkForm.invalid || !this.activity) return;

    this.isAddingRemark = true;
    const text = this.remarkForm.value.text;

    this.subscriptions.push(
      this.activityService.addRemarkToActivity(parseInt(this.activity.id), text).subscribe({
        next: (response) => {
          this.isAddingRemark = false;
          this.remarkForm.reset();
          this.snackBar.open('Remark added successfully', 'Close', { duration: 3000 });
          this.loadActivityDetails(parseInt(this.activity!.id));
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

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
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
      case 'zip':
      case 'rar':
        return 'archive';
      default:
        return 'attachment';
    }
  }

  downloadAttachment(attachment: any) {
    this.activityService.downloadAttachment(attachment.filename).subscribe({
      next: (blob: Blob) => {
        // Create blob link to download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.originalName;
        
        // Append to html link element page
        document.body.appendChild(link);
        
        // Start download
        link.click();
        
        // Clean up and remove the link
        link.remove();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open(`Downloaded ${attachment.originalName}`, 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Download failed:', error);
        this.snackBar.open('Failed to download file', 'Close', { duration: 3000 });
      }
    });
  }

  copyLink(url: string) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
      }).catch(err => {
        console.error('Failed to copy link: ', err);
        this.fallbackCopyTextToClipboard(url);
      });
    } else {
      // Fallback for older browsers or non-secure contexts
      this.fallbackCopyTextToClipboard(url);
    }
  }

  private fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
      } else {
        this.snackBar.open('Failed to copy link', 'Close', { duration: 3000 });
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      this.snackBar.open('Failed to copy link', 'Close', { duration: 3000 });
    }
    
    document.body.removeChild(textArea);
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
