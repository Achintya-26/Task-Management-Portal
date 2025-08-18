import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { SocketService } from '../../../services/socket.service';
import { Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="navbar-content">
        <div class="navbar-left">
          <button mat-button routerLink="/dashboard" class="logo-button">
            <mat-icon>task_alt</mat-icon>
            <span class="ml-2">Task Manager</span>
          </button>
          
          <nav class="nav-links">
            <button mat-button routerLink="/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>
            <button mat-button routerLink="/teams" routerLinkActive="active">
              <mat-icon>groups</mat-icon>
              Teams
            </button>
            <button *ngIf="isAdmin$ | async" mat-button routerLink="/admin" routerLinkActive="active">
              <mat-icon>admin_panel_settings</mat-icon>
              Admin
            </button>
          </nav>
        </div>
        
        <div class="navbar-right">
          <button mat-icon-button [matMenuTriggerFor]="notificationMenu" class="notification-button">
            <mat-icon [matBadge]="unreadCount" matBadgeColor="warn" [matBadgeHidden]="unreadCount === 0">
              notifications
            </mat-icon>
          </button>
          
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
            <mat-icon>account_circle</mat-icon>
            <span>{{ currentUser?.name }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
        </div>
      </div>
    </mat-toolbar>

    <!-- Notification Menu -->
    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header">
        <h3>Notifications</h3>
        <button mat-button (click)="markAllAsRead()" *ngIf="unreadCount > 0">
          Mark all as read
        </button>
      </div>
      <div class="notification-list">
        <div *ngFor="let notification of notifications?.slice(0, 5)" 
             class="notification-item" 
             [class.unread]="!notification.read"
             (click)="markAsRead(notification.id)">
          <div class="notification-content">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
        </div>
        <div *ngIf="!notifications || notifications.length === 0" class="no-notifications">
          No notifications
        </div>
      </div>
    </mat-menu>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu">
      <button mat-menu-item disabled>
        <mat-icon>person</mat-icon>
        <span>{{ currentUser?.empId }} - {{ currentUser?.role }}</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
    }

    .navbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-button {
      font-size: 18px;
      font-weight: 500;
    }

    .nav-links {
      display: flex;
      gap: 8px;
    }

    .nav-links button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-links button.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notification-menu {
      width: 350px;
      max-height: 400px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
    }

    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .notification-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: #f5f5f5;
    }

    .notification-item.unread {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
    }

    .notification-content h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 500;
    }

    .notification-content p {
      margin: 0 0 4px 0;
      font-size: 12px;
      color: #666;
    }

    .notification-time {
      font-size: 11px;
      color: #999;
    }

    .no-notifications {
      padding: 16px;
      text-align: center;
      color: #666;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .navbar-content {
        padding: 0 8px;
      }
      
      .nav-links {
        display: none;
      }
      
      .user-button span {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  notifications: any[] = [];
  unreadCount = 0;
  isAdmin$: Observable<boolean> = of(false);
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin$ = this.authService.isAdmin();

    this.loadNotifications();
    this.loadUnreadCount();
    
    // Subscribe to current user changes
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    // Connect to socket for real-time notifications
    this.socketService.connect();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.socketService.disconnect();
  }

  loadNotifications() {
    this.subscriptions.push(
      this.notificationService.getNotifications().subscribe(
        notifications => {
          this.notifications = notifications;
        }
      )
    );
  }

  loadUnreadCount() {
    this.subscriptions.push(
      this.notificationService.getUnreadCount().subscribe(
        response => {
          this.unreadCount = response.count;
        }
      )
    );
  }

  markAsRead(notificationId: string) {
    this.subscriptions.push(
      this.notificationService.markAsRead(notificationId).subscribe(() => {
        this.loadNotifications();
        this.loadUnreadCount();
      })
    );
  }

  markAllAsRead() {
    this.subscriptions.push(
      this.notificationService.markAllAsRead().subscribe(() => {
        this.loadNotifications();
        this.loadUnreadCount();
      })
    );
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
