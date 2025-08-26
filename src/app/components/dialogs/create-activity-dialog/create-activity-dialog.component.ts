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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivityService } from '../../../services/activity.service';
import { AuthService } from '../../../services/auth.service';
import { TeamService } from '../../../services/team.service';
import { User, Activity, Attachment, ActivityLink } from '../../../models';

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
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatStepperModule,
    MatCardModule,
    MatBadgeModule,
    MatSlideToggleModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }
  ],
  template: `
    <div class="create-activity-dialog">
      <!-- Dialog Header -->
      <div mat-dialog-title class="dialog-header">
        <div class="header-content">
          <mat-icon class="header-icon">{{ isEditMode ? 'edit' : 'add_task' }}</mat-icon>
          <div class="header-text">
            <h2>{{ isEditMode ? 'Edit Activity' : 'Create New Activity' }}</h2>
            <p>{{ isEditMode ? 'Update activity details and assignments' : 'Define a new activity with all necessary details' }}</p>
          </div>
        </div>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <mat-stepper [linear]="false" #stepper orientation="horizontal">
          <!-- Step 1: Basic Information -->
          <mat-step [stepControl]="basicInfoForm" label="Basic Information">
            <ng-template matStepLabel>Basic Info</ng-template>
            <form [formGroup]="basicInfoForm" class="step-form">
              <h3>Activity Details</h3>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Activity Title</mat-label>
                <input matInput formControlName="name" placeholder="Enter activity title">
                <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">
                  Activity title is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Priority Level</mat-label>
                <mat-select formControlName="priority">
                  <mat-option value="low">Low Priority</mat-option>
                  <mat-option value="medium">Medium Priority</mat-option>
                  <mat-option value="high">High Priority</mat-option>
                  <mat-option value="urgent">Urgent</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="4" 
                  placeholder="Describe what needs to be accomplished"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Target Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="targetDate">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="basicInfoForm.get('targetDate')?.hasError('required')">
                  Target date is required
                </mat-error>
              </mat-form-field>

              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext 
                  [disabled]="!basicInfoForm.valid">
                  Next: Assign Members
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Team Assignment -->
          <mat-step [stepControl]="assignmentForm" label="Team Assignment">
            <ng-template matStepLabel>Assign Members</ng-template>
            <form [formGroup]="assignmentForm" class="step-form">
              <h3>Team Members</h3>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Select Team Members</mat-label>
                <mat-select formControlName="assignedUsers" multiple>
                  <mat-option *ngFor="let member of getSelectableMembers()" [value]="member.id">
                    {{ member.name }} ({{ member.empId }})
                  </mat-option>
                </mat-select>
                <mat-hint>Select members to assign to this activity</mat-hint>
              </mat-form-field>

              <div class="selected-members" *ngIf="selectedMembers.length > 0">
                <h4>Selected Members</h4>
                <mat-chip-set>
                  <mat-chip *ngFor="let member of selectedMembers" 
                    (removed)="removeAssignedMember(member.id)">
                    {{ member.name }}
                    <mat-icon matChipRemove>cancel</mat-icon>
                  </mat-chip>
                </mat-chip-set>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Previous</button>
                <button mat-raised-button color="primary" matStepperNext>
                  Next: Attachments
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Attachments & Links -->
          <mat-step label="Attachments & Links">
            <ng-template matStepLabel>Resources</ng-template>
            <div class="step-form">
              <h3>Add Resources</h3>
              
              <!-- File Upload -->
              <div class="upload-section">
                <h4>File Attachments</h4>
                
                <!-- Existing Attachments (for edit mode) -->
                <div class="existing-attachments" *ngIf="isEditMode && existingAttachments.length > 0">
                  <h5>Current Attachments</h5>
                  <mat-list>
                    <mat-list-item *ngFor="let attachment of existingAttachments">
                      <mat-icon matListItemIcon>{{ getFileIcon(attachment.filename) }}</mat-icon>
                      <div matListItemTitle>{{ attachment.originalName || attachment.filename }}</div>
                      <div matListItemLine>{{ attachment.fileSize ? formatFileSize(attachment.fileSize) : 'Unknown size' }}</div>
                      <button mat-icon-button (click)="removeExistingAttachment(attachment)" 
                              matTooltip="Remove attachment">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </mat-list-item>
                  </mat-list>
                </div>
                
                <div class="file-upload-area" 
                     (drop)="onDrop($event)" 
                     (dragover)="onDragOver($event)" 
                     (dragleave)="onDragLeave($event)">
                  <mat-icon>cloud_upload</mat-icon>
                  <p>Drag & drop files here or click to select</p>
                  <button mat-raised-button type="button" (click)="fileInput.click()">
                    <mat-icon>attach_file</mat-icon>
                    Choose Files
                  </button>
                  <input #fileInput type="file" multiple (change)="onFilesSelected($event)" 
                         accept="*/*" style="display: none">
                </div>
                
                <div class="selected-files" *ngIf="selectedFiles.length > 0">
                  <h5>New Files to Upload</h5>
                  <mat-list>
                    <mat-list-item *ngFor="let file of selectedFiles">
                      <mat-icon matListItemIcon>{{ getFileIcon(file.name) }}</mat-icon>
                      <div matListItemTitle>{{ file.name }}</div>
                      <div matListItemLine>{{ formatFileSize(file.size) }}</div>
                      <button mat-icon-button (click)="removeFile(file)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </mat-list-item>
                  </mat-list>
                </div>
              </div>

              <!-- Link Addition -->
              <div class="link-section">
                <h4>Web Links</h4>
                
                <!-- Existing Links (for edit mode) -->
                <div class="existing-links" *ngIf="isEditMode && existingLinks.length > 0">
                  <h5>Current Links</h5>
                  <mat-chip-set>
                    <mat-chip *ngFor="let link of existingLinks" (removed)="removeExistingLink(link)">
                      {{ getTruncatedUrl(link.url) }}
                      <mat-icon matChipRemove>cancel</mat-icon>
                    </mat-chip>
                  </mat-chip-set>
                </div>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Add Link</mat-label>
                  <input matInput #linkInput placeholder="https://example.com">
                  <button mat-icon-button matSuffix (click)="addLink(linkInput.value); linkInput.value=''">
                    <mat-icon>add</mat-icon>
                  </button>
                </mat-form-field>
                
                <div class="selected-links" *ngIf="selectedLinks.length > 0">
                  <h5>New Links to Add</h5>
                  <mat-chip-set>
                    <mat-chip *ngFor="let link of selectedLinks" (removed)="removeLink(link)">
                      {{ getTruncatedUrl(link) }}
                      <mat-icon matChipRemove>cancel</mat-icon>
                    </mat-chip>
                  </mat-chip-set>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Previous</button>
                <button mat-raised-button color="primary" matStepperNext>
                  Review & Create
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Step 4: Review -->
          <mat-step label="Review">
            <ng-template matStepLabel>Review</ng-template>
            <div class="step-form">
              <h3>Review Activity Details</h3>
              
              <mat-card class="review-card">
                <mat-card-header>
                  <mat-card-title>{{ activityForm.get('name')?.value }}</mat-card-title>
                  <mat-card-subtitle>Priority: {{ activityForm.get('priority')?.value }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="review-section">
                    <h4>Description</h4>
                    <p>{{ activityForm.get('description')?.value || 'No description provided' }}</p>
                  </div>
                  
                  <div class="review-section">
                    <h4>Target Date</h4>
                    <p>{{ activityForm.get('targetDate')?.value | date }}</p>
                  </div>
                  
                  <div class="review-section" *ngIf="selectedMembers.length > 0">
                    <h4>Assigned Members</h4>
                    <mat-chip-set>
                      <mat-chip *ngFor="let member of selectedMembers">
                        {{ member.name }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                  
                  <div class="review-section" *ngIf="selectedFiles.length > 0 || selectedLinks.length > 0 || (isEditMode && (existingAttachments.length > 0 || existingLinks.length > 0))">
                    <h4>Resources</h4>
                    <p *ngIf="isEditMode && existingAttachments.length > 0">Current Attachments: {{ existingAttachments.length }}</p>
                    <p *ngIf="isEditMode && existingLinks.length > 0">Current Links: {{ existingLinks.length }}</p>
                    <p *ngIf="selectedFiles.length > 0">New Files: {{ selectedFiles.length }}</p>
                    <p *ngIf="selectedLinks.length > 0">New Links: {{ selectedLinks.length }}</p>
                    <p *ngIf="isEditMode && attachmentsToDelete.length > 0" class="deletion-note">Attachments to remove: {{ attachmentsToDelete.length }}</p>
                    <p *ngIf="isEditMode && linksToDelete.length > 0" class="deletion-note">Links to remove: {{ linksToDelete.length }}</p>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Previous</button>
                <button mat-raised-button color="primary" 
                  (click)="onSubmit()"
                  [disabled]="!activityForm.valid || isLoading">
                  <mat-progress-spinner *ngIf="isLoading" diameter="20"></mat-progress-spinner>
                  {{ isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Activity' : 'Create Activity') }}
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .create-activity-dialog {
      // width: 90px;
      max-width: 120vw;
      max-height: 90vh;
      border-radius: 12px;
      overflow: hidden;
    }

    .dialog-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-text h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .header-text p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .close-button {
      color: white;
      background: rgba(255,255,255,0.1);
    }

    .close-button:hover {
      background: rgba(255,255,255,0.2);
    }

    .dialog-content {
      padding: 0 !important;
      min-height: 500px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .step-form {
      padding: 32px;
      max-width: 600px;
      margin: 0 auto;
    }

    .step-form h3 {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .step-actions {
      margin-top: 32px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .selected-members {
      margin-top: 16px;
    }

    .selected-members h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .upload-section, .link-section {
      margin-bottom: 24px;
    }

    .upload-section h4, .link-section h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .file-upload-area {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .file-upload-area:hover {
      border-color: #667eea;
      background: #f5f5f5;
    }

    .file-upload-area.dragover {
      border-color: #667eea;
      background: #e8f0fe;
    }

    .file-upload-area mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #666;
      margin-bottom: 12px;
    }

    .file-upload-area p {
      margin: 12px 0;
      color: #666;
    }

    .selected-files, .selected-links, .existing-attachments, .existing-links {
      margin-top: 16px;
    }

    .selected-files h5, .selected-links h5, .existing-attachments h5, .existing-links h5 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .review-card {
      margin-bottom: 24px;
    }

    .review-section {
      margin-bottom: 16px;
    }

    .review-section h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .review-section p {
      margin: 0;
      color: #666;
    }

    .deletion-note {
      color: #f44336 !important;
      font-style: italic;
    }

    mat-stepper {
      background: transparent;
    }

    .mat-step-header {
      padding: 16px 24px;
    }

    ::ng-deep .mat-stepper-horizontal-line {
      margin: 0 16px;
      min-width:0px !important;
    }

    ::ng-deep .mat-mdc-dialog-title::before{
      display:none;
    }
    
  `]
})
export class CreateActivityDialogComponent implements OnInit {
  activityForm: FormGroup;
  basicInfoForm: FormGroup;
  assignmentForm: FormGroup;
  teamMembers: User[] = [];
  selectedMembers: User[] = [];
  selectedFiles: File[] = [];
  selectedLinks: string[] = [];
  existingAttachments: Attachment[] = [];
  existingLinks: ActivityLink[] = [];
  attachmentsToDelete: number[] = [];
  linksToDelete: number[] = [];
  isLoading = false;
  isEditMode = false;
  urlPattern = '^https?:\\/\\/.+';

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private authService: AuthService,
    private teamService: TeamService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateActivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      teamId: string; 
      teamName: string; 
      members: User[];
      activity?: Activity;
      isEdit?: boolean;
    }
  ) {
    this.teamMembers = data.members || [];
    this.isEditMode = data.isEdit || false;
    
    // Initialize main form
    this.activityForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      priority: ['medium'],
      targetDate: [null, Validators.required],
      assignedUsers: [[]]
    });

    // Initialize stepper forms
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      priority: ['medium'],
      targetDate: [null, Validators.required]
    });

    this.assignmentForm = this.fb.group({
      assignedUsers: [[]]
    });

    // Sync forms
    this.setupFormSync();

    // If editing, populate form with existing data
    if (this.isEditMode && data.activity) {
      this.populateFormForEdit(data.activity);
    }
  }

  ngOnInit() {
    this.setupFormSubscriptions();
  }

  setupFormSync() {
    // Sync stepper forms with main form
    this.basicInfoForm.valueChanges.subscribe(value => {
      this.activityForm.patchValue(value, { emitEvent: false });
    });

    this.assignmentForm.valueChanges.subscribe(value => {
      this.activityForm.patchValue(value, { emitEvent: false });
    });
  }

  setupFormSubscriptions() {
    // Watch for assigned users changes to update selected members display
    this.assignmentForm.get('assignedUsers')?.valueChanges.subscribe(userIds => {
      this.selectedMembers = this.teamMembers.filter(member => 
        userIds.includes(member.id)
      );
    });
  }

  populateFormForEdit(activity: Activity) {
    const formData = {
      name: activity.name,
      description: activity.description || '',
      priority: activity.priority || 'medium',
      targetDate: activity.targetDate ? new Date(activity.targetDate) : null,
      assignedUsers: activity.assignedMembers?.map((user: any) => user.id) || []
    };

    this.activityForm.patchValue(formData);
    this.basicInfoForm.patchValue(formData);
    this.assignmentForm.patchValue({ assignedUsers: formData.assignedUsers });

    // Set existing attachments and links
    this.existingAttachments = activity.attachments || [];
    this.existingLinks = activity.links || [];
  }

  getSelectableMembers(): User[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return this.teamMembers;
    
    // Filter out the current user from the dropdown since they're auto-assigned
    return this.teamMembers.filter(member => member.id !== currentUser.id);
  }

  removeAssignedMember(memberId: string) {
    const currentSelected = this.assignmentForm.get('assignedUsers')?.value || [];
    const updatedSelected = currentSelected.filter((id: string) => id !== memberId);
    this.assignmentForm.patchValue({ assignedUsers: updatedSelected });
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
    
    const uploadZone = event.target as HTMLElement;
    uploadZone.classList.remove('dragover');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const uploadZone = event.target as HTMLElement;
    uploadZone.classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const uploadZone = event.target as HTMLElement;
    uploadZone.classList.remove('dragover');
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.processFiles(newFiles);
      // Reset input
      input.value = '';
    }
  }

  processFiles(files: File[]) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        this.snackBar.open('File "' + file.name + '" is too large. Maximum size is 10MB.', 'Close', { duration: 5000 });
        return false;
      }
      return true;
    });

    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    
    if (validFiles.length > 0) {
      this.snackBar.open(validFiles.length + ' file(s) selected', 'Close', { duration: 2000 });
    }
  }

  removeFile(fileToRemove: File) {
    this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove);
  }

  addLink(url: string) {
    if (!url.trim()) return;
    
    const urlRegex = new RegExp(this.urlPattern);
    if (!urlRegex.test(url)) {
      this.snackBar.open('Please enter a valid URL', 'Close', { duration: 3000 });
      return;
    }
    
    if (this.selectedLinks.includes(url)) {
      this.snackBar.open('This link has already been added', 'Close', { duration: 2000 });
      return;
    }
    
    this.selectedLinks.push(url);
  }

  removeLink(linkToRemove: string) {
    this.selectedLinks = this.selectedLinks.filter(link => link !== linkToRemove);
  }

  removeExistingAttachment(attachmentToRemove: any) {
    // Remove from the display array
    this.existingAttachments = this.existingAttachments.filter(att => att.id !== attachmentToRemove.id);
    
    // Add to deletion array if it has an ID (exists in database)
    if (attachmentToRemove.id) {
      this.attachmentsToDelete.push(attachmentToRemove.id);
    }
  }

  removeExistingLink(linkToRemove: any) {
    // Remove from the display array
    this.existingLinks = this.existingLinks.filter(link => link.id !== linkToRemove.id);
    
    // Add to deletion array if it has an ID (exists in database)
    if (linkToRemove.id) {
      this.linksToDelete.push(linkToRemove.id);
    }
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc': case 'docx': return 'description';
      case 'xls': case 'xlsx': return 'table_chart';
      case 'ppt': case 'pptx': return 'slideshow';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'image';
      case 'mp4': case 'avi': case 'mov': return 'movie';
      case 'mp3': case 'wav': return 'audiotrack';
      default: return 'insert_drive_file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTruncatedUrl(url: string): string {
    return url.length > 50 ? url.substring(0, 50) + '...' : url;
  }

  async onSubmit() {
    if (!this.activityForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      
      // Add basic form data
      formData.append('name', this.activityForm.get('name')?.value);
      formData.append('description', this.activityForm.get('description')?.value || '');
      formData.append('priority', this.activityForm.get('priority')?.value);
      formData.append('targetDate', this.activityForm.get('targetDate')?.value?.toISOString());
      formData.append('teamId', this.data.teamId);
      formData.append('createdBy', currentUser.id);

      // Add assigned users (always include the current user)
      const assignedUserIds = this.activityForm.get('assignedUsers')?.value || [];
      if (!assignedUserIds.includes(currentUser.id)) {
        assignedUserIds.push(currentUser.id);
      }
      formData.append('assignedUsers', JSON.stringify(assignedUserIds));

      // Add selected files
      this.selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      // Add selected links
      if (this.selectedLinks.length > 0) {
        formData.append('links', JSON.stringify(this.selectedLinks));
      }

      if (this.isEditMode && this.data.activity) {
        // Add deleted attachments and links for update
        if (this.attachmentsToDelete.length > 0) {
          formData.append('attachmentsToDelete', JSON.stringify(this.attachmentsToDelete));
        }
        if (this.linksToDelete.length > 0) {
          formData.append('linksToDelete', JSON.stringify(this.linksToDelete));
        }
        
        // Update existing activity
        await this.activityService.updateActivity(+this.data.activity.id!, formData).toPromise();
        this.snackBar.open('Activity updated successfully', 'Close', { duration: 3000 });
      } else {
        // Create new activity
        await this.activityService.createActivity(formData).toPromise();
        this.snackBar.open('Activity created successfully', 'Close', { duration: 3000 });
      }
      
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error saving activity:', error);
      this.snackBar.open('Error saving activity', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
