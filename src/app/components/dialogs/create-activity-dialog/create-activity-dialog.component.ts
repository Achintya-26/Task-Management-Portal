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
    MatChipsModule
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
            <input matInput formControlName="title" placeholder="Enter activity title">
            <mat-error *ngIf="activityForm.get('title')?.hasError('required')">
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
  `]
})
export class CreateActivityDialogComponent implements OnInit {
  activityForm: FormGroup;
  teamMembers: User[] = [];
  selectedMembers: User[] = [];
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
      title: ['', Validators.required],
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

  async onCreateActivity() {
    if (this.activityForm.valid) {
      this.isLoading = true;
      
      try {
        const formValue = this.activityForm.value;
        const activityData = {
          title: formValue.title,
          description: formValue.description,
          priority: formValue.priority,
          teamId: this.data.teamId,
          targetDate: formValue.targetDate ? new Date(formValue.targetDate).toISOString() : null,
          assignedUsers: formValue.assignedUsers || []
        };

        await this.activityService.createActivityWithData(activityData).toPromise();
        
        this.snackBar.open('Activity created successfully', 'Close', { duration: 3000 });
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
