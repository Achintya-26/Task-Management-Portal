import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../../services/team.service';
import { DomainService } from '../../../services/domain.service';
import { UserService } from '../../../services/user.service';
import { Team, Domain, User } from '../../../models';
import { Subscription } from 'rxjs';

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
    MatSelectModule
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
              <mat-card-subtitle>{{ team.members.length }} members</mat-card-subtitle>
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
  teamForm: FormGroup;
  showForm = false;
  isLoading = false;
  private subscriptions: Subscription[] = [];

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
      domainId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadData();
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
      })
    );
  }

  openCreateDialog() {
    this.teamForm.reset();
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.teamForm.reset();
  }

  createTeam() {
    if (this.teamForm.invalid) return;

    this.isLoading = true;
    const teamData = this.teamForm.value;

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
}
