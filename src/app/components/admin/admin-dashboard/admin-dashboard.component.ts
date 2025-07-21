import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p class="subtitle">Manage teams, domains, and system settings</p>
      </div>

      <div class="admin-cards">
        <mat-card class="admin-card" routerLink="/admin/domains">
          <mat-card-header>
            <mat-icon mat-card-avatar>domain</mat-icon>
            <mat-card-title>Domain Management</mat-card-title>
            <mat-card-subtitle>Create and manage domains</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Organize your teams by creating and managing different business domains.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/admin/domains">
              Manage Domains
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="admin-card" routerLink="/admin/teams">
          <mat-card-header>
            <mat-icon mat-card-avatar>groups</mat-icon>
            <mat-card-title>Team Management</mat-card-title>
            <mat-card-subtitle>Create teams and manage members</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Create new teams, add team members, and manage team activities.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/admin/teams">
              Manage Teams
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      margin-top: 64px;
    }

    .dashboard-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .dashboard-header h1 {
      font-size: 32px;
      font-weight: 300;
      margin: 0 0 8px 0;
      color: #333;
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    .admin-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .admin-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
    }

    .admin-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    mat-icon[mat-card-avatar] {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    mat-card-content p {
      color: #666;
      line-height: 1.6;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
    }

    mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Verify admin access
    if (!this.authService.isAdmin()) {
      // This should be handled by the guard, but double-check
      console.error('Unauthorized access to admin dashboard');
    }
  }
}
