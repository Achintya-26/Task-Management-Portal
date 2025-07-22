import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { TeamService } from '../../../services/team.service';
import { User } from '../../../models';

@Component({
  selector: 'app-add-members-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="add-members-dialog">
      <h2 mat-dialog-title>Add Members to {{ data.teamName }}</h2>
      
      <mat-dialog-content>
        <form [formGroup]="addMembersForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Select Members</mat-label>
            <mat-select multiple formControlName="selectedUsers">
              <mat-option *ngFor="let user of availableUsers" [value]="user.id">
                {{ user.name }} ({{ user.empId }})
              </mat-option>
            </mat-select>
            <mat-hint>Select one or more users to add to the team</mat-hint>
          </mat-form-field>

          <!-- Show selected members -->
          <div class="selected-members" *ngIf="selectedUsersList.length > 0">
            <h4>Selected Members:</h4>
            <mat-chip-listbox>
              <mat-chip 
                *ngFor="let user of selectedUsersList"
                (removed)="removeSelectedUser(user.id)"
              >
                {{ user.name }} ({{ user.empId }})
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
          (click)="onAddMembers()"
          [disabled]="!addMembersForm.valid || selectedUsersList.length === 0 || isLoading"
        >
          {{ isLoading ? 'Adding...' : 'Add Members' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .add-members-dialog {
      min-width: 400px;
      max-width: 600px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .selected-members {
      margin-top: 16px;
    }

    .selected-members h4 {
      margin-bottom: 8px;
      color: #666;
    }

    mat-chip-listbox {
      margin: 8px 0;
    }

    mat-dialog-content {
      padding: 20px;
      min-height: 200px;
    }

    mat-dialog-actions {
      padding: 16px 20px;
    }
  `]
})
export class AddMembersDialogComponent implements OnInit {
  addMembersForm: FormGroup;
  availableUsers: User[] = [];
  selectedUsersList: User[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private teamService: TeamService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { teamId: string; teamName: string; currentMembers: string[] }
  ) {
    this.addMembersForm = this.fb.group({
      selectedUsers: [[], Validators.required]
    });
  }

  ngOnInit() {
    this.loadAvailableUsers();
    this.setupFormSubscriptions();
  }

  setupFormSubscriptions() {
    this.addMembersForm.get('selectedUsers')?.valueChanges.subscribe(selectedIds => {
      this.selectedUsersList = this.availableUsers.filter(user => 
        selectedIds.includes(user.id)
      );
    });
  }

  async loadAvailableUsers() {
    try {
      const allUsers = await this.userService.getAllUsers().toPromise();
      // Filter out users who are already team members and admins
      this.availableUsers = allUsers?.filter(user => 
        !this.data.currentMembers.includes(user.id) && user.role !== 'admin'
      ) || [];
    } catch (error) {
      console.error('Error loading users:', error);
      this.snackBar.open('Error loading available users', 'Close', { duration: 3000 });
    }
  }

  removeSelectedUser(userId: string) {
    const currentSelected = this.addMembersForm.get('selectedUsers')?.value || [];
    const updatedSelected = currentSelected.filter((id: string) => id !== userId);
    this.addMembersForm.patchValue({ selectedUsers: updatedSelected });
  }

  async onAddMembers() {
    if (this.addMembersForm.valid && this.selectedUsersList.length > 0) {
      this.isLoading = true;
      
      try {
        const userIds = this.addMembersForm.get('selectedUsers')?.value;
        await this.teamService.addMembers(this.data.teamId, userIds).toPromise();
        
        this.snackBar.open(
          `Successfully added ${this.selectedUsersList.length} member(s) to the team`, 
          'Close', 
          { duration: 3000 }
        );
        
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error adding members:', error);
        this.snackBar.open('Error adding members to team', 'Close', { duration: 3000 });
      } finally {
        this.isLoading = false;
      }
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
