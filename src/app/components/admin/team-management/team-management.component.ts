import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../../services/team.service';
import { DomainService } from '../../../services/domain.service';
import { UserService } from '../../../services/user.service';
import { Team, Domain, User } from '../../../models';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatChipsModule
  ],
  template: `
    <div class="team-management">
      <div class="header">
        <h1>Team Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Create Team
        </button>
      </div>

      <!-- Create Team Form -->
      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>Create New Team</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="teamForm" (ngSubmit)="createTeam()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Team Name</mat-label>
              <input
                matInput
                formControlName="name"
                placeholder="Enter team name"
              />
              <mat-error *ngIf="teamForm.get('name')?.hasError('required')">
                Team name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                formControlName="description"
                placeholder="Enter team description"
                rows="3"
              ></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Domain</mat-label>
              <mat-select formControlName="domainId">
                <mat-option *ngFor="let domain of domains" [value]="domain.id">
                  {{ domain.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="teamForm.get('domainId')?.hasError('required')">
                Please select a domain
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Add Team Members</mat-label>
              <input matInput
                     [formControl]="memberSearchControl"
                     [matAutocomplete]="memberAutocomplete"
                     placeholder="Type member name or employee ID">
              <mat-autocomplete #memberAutocomplete="matAutocomplete" 
                               [displayWith]="displayMember"
                               (optionSelected)="onMemberSelected($event)">
                <mat-option *ngFor="let user of filteredMembers | async" [value]="user">
                  <div class="member-option">
                    <div class="member-info">
                      <span class="member-name">{{ user.name }}</span>
                      <span class="member-id">({{ user.empId }})</span>
                    </div>
                  </div>
                </mat-option>
              </mat-autocomplete>
              <mat-hint>Search by name or employee ID to add team members (optional)</mat-hint>
            </mat-form-field>

            <!-- Show selected members -->
            <div class="selected-members" *ngIf="selectedMembersList.length > 0">
              <h4>Selected Members:</h4>
              <mat-chip-listbox>
                <mat-chip 
                  *ngFor="let member of selectedMembersList"
                  (removed)="removeSelectedMember(member.id)"
                >
                  {{ member.name }} ({{ member.empId }})
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              </mat-chip-listbox>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="cancelForm()">Cancel</button>
          <button 
            mat-raised-button 
            color="primary" 
            [disabled]="teamForm.invalid || isLoading"
            (click)="createTeam()"
          >
            Create Team
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Teams List -->
      <div class="teams-section">
        <h2>Existing Teams</h2>
        <div class="teams-grid" *ngIf="teams.length > 0; else noTeams">
          <mat-card *ngFor="let team of teams" class="team-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>group</mat-icon>
              <mat-card-title>{{ team.name }}</mat-card-title>
              <mat-card-subtitle>{{ team.members?.length || 0 }} members</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <p>{{ team.description || 'No description' }}</p>
              <div class="team-info">
                <span class="info-item">
                  <mat-icon>domain</mat-icon>
                  {{ getDomainName(team.domainId) }}
                </span>
                <span class="info-item">
                  <mat-icon>schedule</mat-icon>
                  {{ formatDate(team.createdAt) }}
                </span>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" (click)="manageTeamMembers(team)">
                Manage Members
              </button>
              <button mat-button (click)="viewTeam(team.id)">
                View Details
              </button>
              <button mat-button color="warn" (click)="deleteTeam(team)" [disabled]="isLoading">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <ng-template #noTeams>
          <mat-card class="empty-state">
            <mat-card-content>
              <mat-icon class="empty-icon">groups</mat-icon>
              <h3>No Teams Yet</h3>
              <p>Create your first team to start organizing your workforce.</p>
              <button mat-raised-button color="primary" (click)="openCreateDialog()">
                Create First Team
              </button>
            </mat-card-content>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .team-management {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      margin-top: 64px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 300;
      margin: 0;
      color: #333;
    }

    .form-card {
      margin-bottom: 32px;
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
      font-size: 14px;
      font-weight: 500;
    }

    mat-chip-listbox {
      margin: 8px 0;
    }

    .member-option {
      padding: 8px 0;
    }

    .member-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .member-name {
      font-weight: 500;
    }

    .member-id {
      color: #666;
      font-size: 12px;
    }

    .teams-section h2 {
      font-size: 24px;
      font-weight: 400;
      margin: 0 0 24px 0;
      color: #333;
    }

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .team-card {
      height: 100%;
    }

    .team-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;
    }

    .info-item mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    mat-card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    mat-card-actions button[color="warn"] {
      color: #f44336;
    }

    mat-card-actions button[color="warn"]:hover {
      background-color: rgba(244, 67, 54, 0.04);
    }

    mat-card-actions button[color="warn"] mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
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

    @media (max-width: 768px) {
      .team-management {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .teams-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TeamManagementComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  domains: Domain[] = [];
  users: User[] = [];
  availableUsers: User[] = [];
  selectedMembersList: User[] = [];
  teamForm: FormGroup;
  showForm = false;
  isLoading = false;
  private subscriptions: Subscription[] = [];

  // Autocomplete properties
  memberSearchControl = new FormControl('');
  filteredMembers!: Observable<User[]>;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private domainService: DomainService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      domainId: ['', [Validators.required]],
      initialMembers: [[]]
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadData() {
    this.subscriptions.push(
      this.teamService.getTeams().subscribe(teams => {
        this.teams = teams;
      }),
      this.domainService.getDomains().subscribe(domains => {
        this.domains = domains;
      }),
      this.userService.getAllUsers().subscribe(users => {
        this.users = users;
        // Filter out admin users for team member selection
        this.availableUsers = users.filter(user => user.role !== 'admin');
        this.setupAutocomplete();
      })
    );
  }

  setupFormSubscriptions() {
    this.teamForm.get('initialMembers')?.valueChanges.subscribe(selectedIds => {
      this.selectedMembersList = this.availableUsers.filter(user => 
        selectedIds.includes(user.id)
      );
    });
  }

  setupAutocomplete() {
    this.filteredMembers = this.memberSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return this._filterMembers(value);
        }
        return this.availableUsers.slice();
      })
    );
  }

  private _filterMembers(value: string): User[] {
    if (!value) {
      return this.availableUsers.slice();
    }
    
    const filterValue = value.toLowerCase();
    return this.availableUsers.filter(user =>
      user.name.toLowerCase().includes(filterValue) ||
      user.empId.toLowerCase().includes(filterValue)
    );
  }

  displayMember(user: User | null): string {
    return user ? `${user.name} (${user.empId})` : '';
  }

  onMemberSelected(event: any) {
    const selectedUser = event.option.value;
    if (selectedUser && selectedUser.id) {
      const currentSelected = this.teamForm.get('initialMembers')?.value || [];
      if (!currentSelected.includes(selectedUser.id)) {
        const updatedSelected = [...currentSelected, selectedUser.id];
        this.teamForm.patchValue({ initialMembers: updatedSelected });
      }
    }
    // Clear the search field
    this.memberSearchControl.setValue('');
  }

  removeSelectedMember(memberId: string) {
    const currentSelected = this.teamForm.get('initialMembers')?.value || [];
    const updatedSelected = currentSelected.filter((id: string) => id !== memberId);
    this.teamForm.patchValue({ initialMembers: updatedSelected });
  }

  openCreateDialog() {
    this.teamForm.reset();
    this.memberSearchControl.setValue('');
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.teamForm.reset();
    this.memberSearchControl.setValue('');
  }

  createTeam() {
    if (this.teamForm.invalid) return;

    this.isLoading = true;
    const formValue = this.teamForm.value;
    const teamData = {
      name: formValue.name,
      description: formValue.description,
      domainId: formValue.domainId,
      initialMembers: formValue.initialMembers || []
    };

    this.subscriptions.push(
      this.teamService.createTeam(teamData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Team created successfully', 'Close', { duration: 3000 });
          this.loadData();
          this.cancelForm();
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Team creation failed',
            'Close',
            { duration: 5000 }
          );
        }
      })
    );
  }

  getDomainName(domainId: string): string {
    const domain = this.domains.find(d => d.id === domainId);
    return domain ? domain.name : 'Unknown Domain';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  manageTeamMembers(team: Team) {
    this.snackBar.open('Team member management not implemented yet', 'Close', { duration: 3000 });
  }

  viewTeam(teamId: string) {
    // This would navigate to team details - for now just show message
    this.snackBar.open('Navigate to team details', 'Close', { duration: 3000 });
  }

  deleteTeam(team: Team) {
    // Simple confirmation dialog
    const confirmMessage = `Are you sure you want to delete the team "${team.name}"? This action cannot be undone and will remove all team data including members and associated activities.`;
    
    if (confirm(confirmMessage)) {
      this.performDeleteTeam(team.id);
    }
  }

  private performDeleteTeam(teamId: string) {
    this.isLoading = true;
    this.subscriptions.push(
      this.teamService.deleteTeam(teamId).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Team deleted successfully', 'Close', { duration: 3000 });
          this.loadData(); // Reload the teams list
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Failed to delete team',
            'Close',
            { duration: 5000 }
          );
        }
      })
    );
  }
}
