import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivityService } from '../../../services/activity.service';
import { TeamService } from '../../../services/team.service';
import { User } from '../../../models';

@Component({
  selector: 'app-create-activity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatProgressBarModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }
  ],
  template: `
    <div class="create-activity-dialog">
      <h2 mat-dialog-title>Create New Activity</h2>
      
      <mat-dialog-content>
        <form [formGroup]="activityForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Activity Title</mat-label>
            <input matInput formControlName="name" placeholder="Enter activity title">
            <mat-error *ngIf="activityForm.get('name')?.hasError('required')">
              Title is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea 
              matInput 
              formControlName="description" 
              rows="3"
              placeholder="Enter activity description"
            ></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
              <mat-option value="urgent">Urgent</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Target Date</mat-label>
            <input 
              matInput 
              [matDatepicker]="picker" 
              formControlName="targetDate"
              placeholder="Select target date"
              readonly>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Assign Members</mat-label>
            <mat-select multiple formControlName="assignedUsers">
              <mat-option *ngFor="let member of teamMembers" [value]="member.id">
                {{ member.name }} ({{ member.empId }})
              </mat-option>
            </mat-select>
            <mat-hint>Select team members to assign to this activity</mat-hint>
          </mat-form-field>

          <!-- Show assigned members -->
          <div class="assigned-members" *ngIf="selectedMembers.length > 0">
            <h4>Assigned Members:</h4>
            <mat-chip-listbox>
              <mat-chip 
                *ngFor="let member of selectedMembers"
                (removed)="removeAssignedMember(member.id)"
              >
                {{ member.name }} ({{ member.empId }})
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            </mat-chip-listbox>
          </div>

          <!-- File Upload Section -->
          <div class="file-upload-section">
            <h4>Attachments</h4>
            <div class="file-input-container">
              <input 
                type="file" 
                #fileInput 
                (change)="onFilesSelected($event)"
                multiple 
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.ppt,.pptx"
                style="display: none;"
              >
              <button 
                type="button" 
                mat-raised-button 
                color="accent" 
                (click)="fileInput.click()"
                class="upload-button"
              >
                <mat-icon>attach_file</mat-icon>
                Select Files
              </button>
              <span class="file-hint">
                Supported: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, Excel, PowerPoint (Max 10MB per file)
              </span>
            </div>

            <!-- Selected Files List -->
            <div class="selected-files" *ngIf="selectedFiles.length > 0">
              <h5>Selected Files ({{ selectedFiles.length }}):</h5>
              <mat-list>
                <mat-list-item *ngFor="let file of selectedFiles; let i = index">
                  <mat-icon matListItemIcon>{{ getFileIcon(file.name) }}</mat-icon>
                  <div matListItemTitle>{{ file.name }}</div>
                  <div matListItemLine>{{ formatFileSize(file.size) }}</div>
                  <button 
                    mat-icon-button 
                    color="warn" 
                    (click)="removeFile(i)"
                    matListItemMeta
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-list-item>
              </mat-list>
            </div>

            <!-- Links Section -->
            <div class="links-section">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Add Related Links</mat-label>
                <input 
                  matInput 
                  #linkInput
                  placeholder="Enter URL (e.g., https://example.com)"
                  (keyup.enter)="addLink(linkInput.value); linkInput.value = ''"
                >
                <button 
                  type="button"
                  mat-icon-button 
                  matSuffix 
                  (click)="addLink(linkInput.value); linkInput.value = ''"
                  [disabled]="!linkInput.value"
                >
                  <mat-icon>add</mat-icon>
                </button>
              </mat-form-field>

              <!-- Selected Links -->
              <div class="selected-links" *ngIf="selectedLinks.length > 0">
                <h5>Related Links:</h5>
                <mat-chip-listbox>
                  <mat-chip 
                    *ngFor="let link of selectedLinks; let i = index"
                    (removed)="removeLink(i)"
                  >
                    <mat-icon matChipAvatar>link</mat-icon>
                    {{ link }}
                    <mat-icon matChipRemove>cancel</mat-icon>
                  </mat-chip>
                </mat-chip-listbox>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onCreateActivity()"
          [disabled]="!activityForm.valid || isLoading"
        >
          {{ isLoading ? 'Creating...' : 'Create Activity' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-activity-dialog {
      min-width: 500px;
      max-width: 700px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .assigned-members {
      margin-top: 16px;
    }

    .assigned-members h4 {
      margin-bottom: 8px;
      color: #666;
    }

    mat-chip-listbox {
      margin: 8px 0;
    }

    mat-dialog-content {
      padding: 20px;
      min-height: 400px;
      max-height: 80vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 16px 20px;
    }

    .file-upload-section {
      margin-top: 24px;
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }

    .file-upload-section h4 {
      margin-bottom: 16px;
      color: #666;
    }

    .file-input-container {
      margin-bottom: 16px;
    }

    .upload-button {
      margin-right: 16px;
    }

    .file-hint {
      font-size: 12px;
      color: #666;
      line-height: 1.4;
    }

    .selected-files {
      margin-top: 16px;
    }

    .selected-files h5 {
      margin-bottom: 8px;
      color: #666;
      font-weight: 500;
    }

    .selected-files mat-list {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
    }

    .links-section {
      margin-top: 20px;
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }

    .selected-links h5 {
      margin-bottom: 8px;
      color: #666;
      font-weight: 500;
    }

    .selected-links mat-chip {
      max-width: 300px;
    }
  `]
})
export class CreateActivityDialogComponent implements OnInit {
  activityForm: FormGroup;
  teamMembers: User[] = [];
  selectedMembers: User[] = [];
  selectedFiles: File[] = [];
  selectedLinks: string[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private teamService: TeamService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateActivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { teamId: string; teamName: string; members: User[] }
  ) {
    this.teamMembers = data.members || [];
    this.activityForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      priority: ['medium'],
      targetDate: [null],
      assignedUsers: [[]]
    });
  }

  ngOnInit() {
    this.setupFormSubscriptions();
  }

  setupFormSubscriptions() {
    this.activityForm.get('assignedUsers')?.valueChanges.subscribe(selectedIds => {
      this.selectedMembers = this.teamMembers.filter(member => 
        selectedIds.includes(member.id)
      );
    });
  }

  removeAssignedMember(memberId: string) {
    const currentSelected = this.activityForm.get('assignedUsers')?.value || [];
    const updatedSelected = currentSelected.filter((id: string) => id !== memberId);
    this.activityForm.patchValue({ assignedUsers: updatedSelected });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      
      // Validate file sizes (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validFiles = newFiles.filter(file => {
        if (file.size > maxSize) {
          this.snackBar.open(`File "${file.name}" is too large. Maximum size is 10MB.`, 'Close', { duration: 5000 });
          return false;
        }
        return true;
      });

      // Add valid files to the selection
      this.selectedFiles.push(...validFiles);
      
      // Reset input
      input.value = '';
      
      if (validFiles.length > 0) {
        this.snackBar.open(`${validFiles.length} file(s) selected`, 'Close', { duration: 2000 });
      }
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  addLink(url: string) {
    if (url && url.trim()) {
      const trimmedUrl = url.trim();
      
      // Basic URL validation
      try {
        new URL(trimmedUrl);
        if (!this.selectedLinks.includes(trimmedUrl)) {
          this.selectedLinks.push(trimmedUrl);
        } else {
          this.snackBar.open('This link has already been added', 'Close', { duration: 2000 });
        }
      } catch {
        this.snackBar.open('Please enter a valid URL', 'Close', { duration: 3000 });
      }
    }
  }

  removeLink(index: number) {
    this.selectedLinks.splice(index, 1);
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
      default:
        return 'attachment';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async onCreateActivity() {
    if (this.activityForm.valid) {
      this.isLoading = true;
      
      try {
        const formValue = this.activityForm.value;
        
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add basic activity data
        formData.append('name', formValue.name);
        formData.append('description', formValue.description || '');
        formData.append('priority', formValue.priority);
        formData.append('team_id', this.data.teamId);
        
        if (formValue.targetDate) {
          formData.append('targetDate', new Date(formValue.targetDate).toISOString());
        }
        
        // Add assigned users as JSON string
        if (formValue.assignedUsers && formValue.assignedUsers.length > 0) {
          formData.append('assignedUsers', JSON.stringify(formValue.assignedUsers));
        }
        
        // Add files
        this.selectedFiles.forEach((file, index) => {
          formData.append('attachments', file);
        });
        
        // Add links as JSON string
        if (this.selectedLinks.length > 0) {
          formData.append('links', JSON.stringify(this.selectedLinks));
        }

        await this.activityService.createActivity(formData).toPromise();
        
        this.snackBar.open('Activity created successfully with attachments', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error creating activity:', error);
        this.snackBar.open('Error creating activity', 'Close', { duration: 3000 });
      } finally {
        this.isLoading = false;
      }
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
