import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DomainService } from '../../../services/domain.service';
import { Domain } from '../../../models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-domain-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTableModule
  ],
  template: `
    <div class="domain-management">
      <div class="header">
        <h1>Domain Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Create Domain
        </button>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Business Domains</mat-card-title>
          <mat-card-subtitle>Manage organizational domains for team categorization</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="domains-grid" *ngIf="domains.length > 0; else noDomains">
            <div *ngFor="let domain of domains" class="domain-card">
              <div class="domain-info">
                <h3>{{ domain.name }}</h3>
                <p class="domain-created">Created {{ formatDate(domain.createdAt) }}</p>
              </div>
              <div class="domain-actions">
                <button mat-icon-button (click)="editDomain(domain)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteDomain(domain.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <ng-template #noDomains>
            <div class="empty-state">
              <mat-icon class="empty-icon">domain</mat-icon>
              <h3>No Domains Yet</h3>
              <p>Create your first business domain to start organizing teams.</p>
              <button mat-raised-button color="primary" (click)="openCreateDialog()">
                Create First Domain
              </button>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>

      <!-- Create/Edit Domain Form -->
      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingDomain ? 'Edit' : 'Create' }} Domain</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="domainForm" (ngSubmit)="saveDomain()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Domain Name</mat-label>
              <input
                matInput
                formControlName="name"
                placeholder="Enter domain name"
              />
              <mat-error *ngIf="domainForm.get('name')?.hasError('required')">
                Domain name is required
              </mat-error>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="cancelForm()">Cancel</button>
          <button 
            mat-raised-button 
            color="primary" 
            [disabled]="domainForm.invalid || isLoading"
            (click)="saveDomain()"
          >
            {{ editingDomain ? 'Update' : 'Create' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .domain-management {
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

    .domains-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .domain-card {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: box-shadow 0.2s;
    }

    .domain-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .domain-info h3 {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 4px 0;
      color: #333;
    }

    .domain-created {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .domain-actions {
      display: flex;
      gap: 8px;
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

    .form-card {
      margin-top: 24px;
    }

    .full-width {
      width: 100%;
    }

    @media (max-width: 768px) {
      .domain-management {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .domains-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DomainManagementComponent implements OnInit, OnDestroy {
  domains: Domain[] = [];
  domainForm: FormGroup;
  showForm = false;
  editingDomain: Domain | null = null;
  isLoading = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private domainService: DomainService,
    private snackBar: MatSnackBar
  ) {
    this.domainForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadDomains();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDomains() {
    this.subscriptions.push(
      this.domainService.getDomains().subscribe(domains => {
        this.domains = domains;
      })
    );
  }

  openCreateDialog() {
    this.editingDomain = null;
    this.domainForm.reset();
    this.showForm = true;
  }

  editDomain(domain: Domain) {
    this.editingDomain = domain;
    this.domainForm.patchValue({ name: domain.name });
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingDomain = null;
    this.domainForm.reset();
  }

  saveDomain() {
    if (this.domainForm.invalid) return;

    this.isLoading = true;
    const domainData = this.domainForm.value;

    const request = this.editingDomain
      ? this.domainService.updateDomain(this.editingDomain.id, domainData)
      : this.domainService.createDomain(domainData);

    this.subscriptions.push(
      request.subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open(
            `Domain ${this.editingDomain ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.loadDomains();
          this.cancelForm();
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Operation failed',
            'Close',
            { duration: 5000 }
          );
        }
      })
    );
  }

  deleteDomain(domainId: string) {
    if (confirm('Are you sure you want to delete this domain?')) {
      this.subscriptions.push(
        this.domainService.deleteDomain(domainId).subscribe({
          next: () => {
            this.snackBar.open('Domain deleted successfully', 'Close', { duration: 3000 });
            this.loadDomains();
          },
          error: (error) => {
            this.snackBar.open(
              error.error?.message || 'Delete failed',
              'Close',
              { duration: 5000 }
            );
          }
        })
      );
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
