import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { TeamService } from '../../../services/team.service';
import { User } from '../../../models';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
    MatAutocompleteModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="add-members-dialog">
      <h2 mat-dialog-title>Manage Team Members - {{ data.teamName }}</h2>
      
      <mat-dialog-content>
        <div class="info-message">
          <mat-icon>info</mat-icon>
          <p>Current team members are pre-selected. You can add new members or remove existing ones.</p>
        </div>
        
        <form [formGroup]="addMembersForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Search and select team members</mat-label>
            <input matInput
                   [formControl]="memberSearchControl"
                   [matAutocomplete]="memberAutocomplete"
                   placeholder="Type member name or employee ID">
            <mat-autocomplete #memberAutocomplete="matAutocomplete" 
                             [displayWith]="displayMember"
                             (optionSelected)="onMemberSelected($event)">
              <mat-option *ngFor="let user of filteredUsers | async" [value]="user">
                <div class="member-option">
                  <div class="member-info">
                    <span class="member-name">{{ user.name }}</span>
                    <span class="member-id">({{ user.empId }})</span>
                    <span *ngIf="isCurrentMember(user.id)" class="current-member-badge">Current Member</span>
                  </div>
                </div>
              </mat-option>
            </mat-autocomplete>
            <mat-hint>Search by name or employee ID to add team members</mat-hint>
          </mat-form-field>

          <!-- DEBUG: Manual test button -->
          <!-- <button mat-raised-button color="warn" (click)="debugAddFirstUser()" 
                  *ngIf="availableUsers.length > 0" 
                  style="margin-bottom: 16px;">
            DEBUG: Add First Available User
          </button> -->

          <!-- Show selected members -->
          <div class="selected-members" *ngIf="selectedUsersList.length > 0">
            <h4>Team Members ({{ selectedUsersList.length }}):</h4>
            <mat-chip-listbox>
              <mat-chip 
                *ngFor="let user of selectedUsersList"
                [class.existing-member]="originalCurrentMembers.includes(convertToString(user.id))"
                (removed)="removeSelectedUser(user.id)"
              >
                {{ user.name }} ({{ user.empId }})
                <span *ngIf="originalCurrentMembers.includes(convertToString(user.id))" class="member-badge">Current</span>
                <span *ngIf="!originalCurrentMembers.includes(convertToString(user.id))" class="member-badge new">New</span>
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
          (click)="onUpdateMembers()"
          [disabled]="!addMembersForm.valid || isLoading"
        >
          {{ isLoading ? 'Updating...' : 'Update Team Members' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .add-members-dialog {
      min-width: 500px;
      max-width: 700px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .info-message {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #e3f2fd;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .info-message mat-icon {
      color: #1976d2;
    }

    .info-message p {
      margin: 0;
      color: #1976d2;
      font-size: 14px;
    }

    .current-member-indicator {
      color: #4caf50;
      font-size: 12px;
      font-weight: 500;
    }

    .member-option {
      display: flex;
      align-items: center;
      padding: 8px 0;
    }

    .member-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .member-name {
      font-weight: 500;
      color: #333;
    }

    .member-id {
      font-size: 0.875rem;
      color: #666;
      opacity: 0.8;
    }

    .current-member-badge {
      font-size: 0.75rem;
      background: #4caf50;
      color: white;
      padding: 2px 6px;
      border-radius: 8px;
      margin-top: 2px;
      align-self: flex-start;
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

    .existing-member {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .member-badge {
      font-size: 10px;
      background: #4caf50;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 4px;
    }

    .member-badge.new {
      background: #2196f3;
    }

    mat-dialog-content {
      padding: 20px;
      min-height: 300px;
    }

    mat-dialog-actions {
      padding: 16px 20px;
    }
  `]
})
export class AddMembersDialogComponent implements OnInit {
  addMembersForm: FormGroup;
  memberSearchControl = new FormControl('');
  filteredUsers: Observable<User[]>;
  availableUsers: User[] = [];
  selectedUsersList: User[] = [];
  isLoading = false;
  originalCurrentMembers: string[]; // Store original members separately

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private teamService: TeamService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { teamId: string; teamName: string; currentMembers: string[] }
  ) {
    this.addMembersForm = this.fb.group({
      selectedUsers: [[]] // Removed required validator as team can have 0 members
    });
    
    // Store original current members to prevent accidental modification
    // Store original current members to avoid reference issues
    this.originalCurrentMembers = [...this.data.currentMembers].map(id => String(id));
    // console.log("(Constructor) Original members stored: ", this.originalCurrentMembers);

    // Initialize filtered users for autocomplete
    this.filteredUsers = this.memberSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value || ''))
    );
  }

  // Helper method for template string conversion
  convertToString(value: any): string {
    return String(value);
  }

  ngOnInit() {
    this.loadAvailableUsers();
    this.setupFormSubscriptions();
  }

  setupFormSubscriptions() {
    // console.log('Setting up form subscriptions');
    this.addMembersForm.get('selectedUsers')?.valueChanges.subscribe(selectedIds => {
      // console.log('=== FORM VALUE CHANGE ===');
      // console.log('New selectedIds:', selectedIds);
      // console.log('availableUsers.length:', this.availableUsers.length);
      
      if (this.availableUsers.length > 0) {
        const filteredUsers = this.availableUsers.filter(user => 
          selectedIds.includes(user.id)
        );
        // console.log('Filtered users:', filteredUsers.map(u => u.name));
        this.selectedUsersList = filteredUsers;
        // console.log('Updated selectedUsersList length:', this.selectedUsersList.length);
      } else {
        // console.log('availableUsers not loaded yet');
      }
      // console.log('=== END FORM VALUE CHANGE ===');
    });
  }

  async loadAvailableUsers() {
    // console.log('Loading available users...');
    try {
      const allUsers = await this.userService.getAllUsers().toPromise();
      // console.log('Raw users loaded:', allUsers?.length);
      
      // Include all users except admins (you may want to include admins too based on your needs)
      this.availableUsers = allUsers?.filter(user => user.role !== 'admin') || [];
      // console.log('Available users after filtering:', this.availableUsers.length);
      // console.log('Available users:', this.availableUsers.map(u => `${u.name} (${u.id})`));
      
      // Pre-select existing team members
      // console.log('Original members to pre-select:', this.originalCurrentMembers);
      this.addMembersForm.patchValue({
        selectedUsers: [...this.originalCurrentMembers] // Create a copy to avoid reference issues
      });
      
      // Manually trigger the form subscription to update selectedUsersList
      const currentSelected = this.addMembersForm.get('selectedUsers')?.value || [];
      // console.log('Form value after patch:', currentSelected);
      
      this.selectedUsersList = this.availableUsers.filter(user => 
        currentSelected.includes(user.id)
      );
      // console.log('Initial selectedUsersList:', this.selectedUsersList.map(u => u.name));
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

  // Autocomplete methods
  private _filterUsers(value: string | User): User[] {
    // console.log('=== FILTER USERS CALLED ===');
    // console.log('Filter value:', value);
    
    let filterValue = '';
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value && value.name) {
      filterValue = value.name.toLowerCase();
    }
    // console.log('Filter string:', filterValue);

    const alreadySelected = this.addMembersForm.get('selectedUsers')?.value || [];
    // console.log('Already selected IDs:', alreadySelected);
    // console.log('Available users count:', this.availableUsers.length);
    
    const filtered = this.availableUsers.filter(user => {
      const notSelected = !alreadySelected.includes(user.id);
      const matchesName = user.name.toLowerCase().includes(filterValue);
      const matchesEmpId = user.empId.toLowerCase().includes(filterValue);
      const matches = notSelected && (matchesName || matchesEmpId);
      
      if (filterValue === '' || matches) {
        // console.log(`User ${user.name}: notSelected=${notSelected}, matchesName=${matchesName}, matchesEmpId=${matchesEmpId}, result=${matches}`);
      }
      
      return matches;
    });
    
    // console.log('Filtered results:', filtered.map(u => u.name));
    // console.log('=== END FILTER ===');
    return filtered;
  }

  displayMember(user: User): string {
    return user ? `${user.name} (${user.empId})` : '';
  }

  onMemberSelected(event: any) {
    const selectedUser: User = event.option.value;
    // console.log('=== DEBUGGING onMemberSelected ===');
    // console.log('Selected user:', selectedUser);
    
    // Get current selected user IDs
    const currentSelected = this.addMembersForm.get('selectedUsers')?.value || [];
    // console.log('Current form value before update:', currentSelected);
    // console.log('Current selectedUsersList before update:', this.selectedUsersList);
    
    // Add to selected if not already selected
    if (!currentSelected.includes(selectedUser.id)) {
      currentSelected.push(selectedUser.id);
      // console.log('Updating form with:', currentSelected);
      this.addMembersForm.patchValue({ selectedUsers: currentSelected });
      
      // Give time for subscription to trigger
      setTimeout(() => {
        // console.log('Form value after update:', this.addMembersForm.get('selectedUsers')?.value);
        // console.log('selectedUsersList after update:', this.selectedUsersList);
        // console.log('availableUsers count:', this.availableUsers.length);
      }, 100);
    } else {
      // console.log('User already selected, skipping');
    }
    
    // Clear the search input
    this.memberSearchControl.setValue('');
    // console.log('=== END DEBUG ===');
  }

  isCurrentMember(userId: string): boolean {
    // Check if user is in the original current members (not newly selected ones)
    return this.originalCurrentMembers.includes(String(userId));
  }

  // DEBUG METHOD
  debugAddFirstUser() {
    // console.log('=== DEBUG ADD FIRST USER ===');
    const firstAvailableUser = this.availableUsers.find(user => 
      !this.addMembersForm.get('selectedUsers')?.value?.includes(user.id)
    );
    
    if (firstAvailableUser) {
      // console.log('Adding user:', firstAvailableUser);
      const currentSelected = this.addMembersForm.get('selectedUsers')?.value || [];
      currentSelected.push(firstAvailableUser.id);
      this.addMembersForm.patchValue({ selectedUsers: currentSelected });
      // console.log('Updated form value:', this.addMembersForm.get('selectedUsers')?.value);
    } else {
      // console.log('No available users to add');
    }
  }

  async onUpdateMembers() {
    // console.log('=== UPDATE MEMBERS DEBUG ===');
    // console.log('Form valid:', this.addMembersForm.valid);
    
    if (this.addMembersForm.valid) {
      this.isLoading = true;
      
      try {
        // Ensure all IDs are strings for consistent comparison
        const selectedUserIds: string[] = (this.addMembersForm.get('selectedUsers')?.value || []).map((id: any) => String(id));
        const currentMemberIds: string[] = this.originalCurrentMembers.map((id: any) => String(id));
        
        // console.log("The selected users are: ", selectedUserIds);
        // console.log("Selected users types:", selectedUserIds.map(id => typeof id + ': ' + id));
        // console.log("The original current members are: ", currentMemberIds);
        // console.log("Original current members types:", currentMemberIds.map(id => typeof id + ': ' + id));
        
        // Find users to add (selected but not currently members)
        const usersToAdd = selectedUserIds.filter(id => !currentMemberIds.includes(id));
        // console.log("The users to add are: ", usersToAdd);
        // console.log("Add comparison details:");
        selectedUserIds.forEach(selectedId => {
          const isInCurrent = currentMemberIds.includes(selectedId);
          // console.log(`  ${selectedId} (${typeof selectedId}) in originalCurrentMembers: ${isInCurrent}`);
        });

        // Find users to remove (currently members but not selected)
        const usersToRemove = currentMemberIds.filter(id => !selectedUserIds.includes(id));
        // console.log("The users to remove are: ", usersToRemove);
        // console.log("Remove comparison details:");
        currentMemberIds.forEach(currentId => {
          const isInSelected = selectedUserIds.includes(currentId);
          // console.log(`  ${currentId} (${typeof currentId}) in selectedUserIds: ${isInSelected}`);
        });
        
        // Add new members
        if (usersToAdd.length > 0) {
          // console.log('Adding members:', usersToAdd);
          await this.teamService.addMembers(this.data.teamId, usersToAdd).toPromise();
        }
        
        // Remove members who were unselected
        if (usersToRemove.length > 0) {
          // console.log('Removing members:', usersToRemove);
          for (const userId of usersToRemove) {
            await this.teamService.removeMemberFromTeam(this.data.teamId, userId).toPromise();
          }
        }
        
        let message = '';
        if (usersToAdd.length > 0 && usersToRemove.length > 0) {
          message = `Added ${usersToAdd.length} member(s) and removed ${usersToRemove.length} member(s)`;
        } else if (usersToAdd.length > 0) {
          message = `Added ${usersToAdd.length} member(s) to the team`;
        } else if (usersToRemove.length > 0) {
          message = `Removed ${usersToRemove.length} member(s) from the team`;
        } else {
          message = 'No changes made to team members';
        }
        
        // console.log('Final message:', message);
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error updating team members:', error);
        this.snackBar.open('Error updating team members', 'Close', { duration: 3000 });
      } finally {
        this.isLoading = false;
      }
    }
    // console.log('=== END UPDATE MEMBERS DEBUG ===');
  }

  async onAddMembers() {
    // Keep this method for backward compatibility, but redirect to onUpdateMembers
    return this.onUpdateMembers();
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
