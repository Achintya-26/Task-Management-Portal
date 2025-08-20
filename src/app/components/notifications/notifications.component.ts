import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatToolbarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="notifications-container">
      <!-- Notification Bell Icon with Badge -->
      <button 
        mat-icon-button 
        [matMenuTriggerFor]="notificationMenu"
        class="notification-bell"
        (click)="loadNotifications()">
        <mat-icon [matBadge]="unreadCount" 
                  [matBadgeHidden]="unreadCount === 0" 
                  matBadgeColor="warn"
                  matBadgeSize="small">
          notifications
        </mat-icon>
      </button>

      <!-- Notification Menu -->
      <mat-menu #notificationMenu="matMenu" class="notification-menu">
        <div class="notification-header">
          <h4>Notifications</h4>
          <div class="notification-actions">
            <button mat-icon-button 
                    (click)="markAllAsRead()" 
                    matTooltip="Mark all as read"
                    [disabled]="unreadCount === 0">
              <mat-icon>done_all</mat-icon>
            </button>
            <button mat-icon-button 
                    (click)="createTestNotification()" 
                    matTooltip="Create test notification"
                    class="test-btn">
              <mat-icon>bug_report</mat-icon>
            </button>
          </div>
        </div>
        <mat-divider></mat-divider>

        <!-- Connection Status -->
        <div class="connection-status" [class.connected]="isConnected" [class.disconnected]="!isConnected">
          <mat-icon>{{ isConnected ? 'wifi' : 'wifi_off' }}</mat-icon>
          <span>{{ isConnected ? 'Real-time connected' : 'Reconnecting...' }}</span>
        </div>
        <mat-divider></mat-divider>

        <!-- Notifications List -->
        <div class="notifications-list" [style.max-height]="'400px'" [style.overflow-y]="'auto'">
          <div *ngIf="notifications.length === 0" class="no-notifications">
            <mat-icon>notifications_none</mat-icon>
            <p>No notifications</p>
          </div>

          <div *ngFor="let notification of notifications" 
               class="notification-item" 
               [class.unread]="!notification.read"
               (click)="markAsRead(notification)">
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-meta">
                <span class="notification-type">{{ getTypeDisplay(notification.type) }}</span>
                <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
              </div>
            </div>
            <div class="notification-actions">
              <button mat-icon-button 
                      (click)="deleteNotification(notification); $event.stopPropagation()"
                      matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
              <div *ngIf="!notification.read" class="unread-indicator"></div>
            </div>
          </div>
        </div>

        <mat-divider *ngIf="notifications.length > 0"></mat-divider>
        <div class="notification-footer" *ngIf="notifications.length > 5">
          <button mat-button color="primary" (click)="openNotificationsPage()">
            View All Notifications
          </button>
        </div>
      </mat-menu>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: relative;
    }

    .notification-bell {
      color: #666;
      transition: color 0.3s ease;
    }

    .notification-bell:hover {
      color: #2196f3;
    }

    .notification-bell .mat-icon[matbadge]:not([matbadgehidden]) {
      color: #2196f3;
    }

    .notification-menu {
      width: 380px;
      max-height: 500px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f5f5f5;
    }

    .notification-header h4 {
      margin: 0;
      font-weight: 500;
    }

    .notification-actions {
      display: flex;
      gap: 8px;
    }

    .test-btn {
      color: #ff9800;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      font-size: 0.9em;
      transition: color 0.3s ease;
    }

    .connection-status.connected {
      color: #4caf50;
    }

    .connection-status.disconnected {
      color: #f44336;
    }

    .notifications-list {
      min-height: 100px;
    }

    .no-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #999;
      text-align: center;
    }

    .no-notifications mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .notification-item {
      display: flex;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .notification-item:hover {
      background-color: #f9f9f9;
    }

    .notification-item.unread {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 500;
      font-size: 0.95em;
      margin-bottom: 4px;
      color: #333;
    }

    .notification-message {
      font-size: 0.85em;
      color: #666;
      line-height: 1.4;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notification-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75em;
      color: #999;
    }

    .notification-type {
      background-color: #e0e0e0;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 0.7em;
      text-transform: uppercase;
    }

    .notification-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      margin-left: 8px;
    }

    .notification-actions button {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      background-color: #2196f3;
      border-radius: 50%;
    }

    .notification-footer {
      padding: 16px;
      text-align: center;
      background-color: #f5f5f5;
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isConnected = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initialize notification service
    this.notificationService.initialize();

    // Subscribe to real-time notifications
    this.subscriptions.push(
      this.notificationService.notification$.subscribe(notification => {
        if (notification) {
          this.handleNewNotification(notification);
        }
      })
    );

    // Subscribe to connection status
    this.subscriptions.push(
      this.notificationService.connectionStatus$.subscribe(status => {
        this.isConnected = status;
      })
    );

    // Subscribe to unread count
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );

    // Load initial notifications
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.notificationService.cleanup();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications.slice(0, 10); // Show only recent 10
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.snackBar.open('Failed to load notifications', 'Close', { duration: 3000 });
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id.toString()).subscribe({
        next: () => {
          notification.read = true;
          // Unread count will be updated automatically by the service
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        // Unread count will be updated automatically by the service
        this.snackBar.open('All notifications marked as read', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.snackBar.open('Failed to mark notifications as read', 'Close', { duration: 3000 });
      }
    });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id.toString()).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        if (!notification.read) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        this.snackBar.open('Notification deleted', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
        this.snackBar.open('Failed to delete notification', 'Close', { duration: 3000 });
      }
    });
  }

  createTestNotification(): void {
    this.notificationService.createTestNotification().subscribe({
      next: (response) => {
        this.snackBar.open('Test notification created!', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error creating test notification:', error);
        this.snackBar.open('Failed to create test notification', 'Close', { duration: 3000 });
      }
    });
  }

  handleNewNotification(notification: Notification): void {
    // Add to the beginning of the list
    this.notifications.unshift(notification);
    
    // Keep only recent 10 notifications in the dropdown
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }

    // Show snack bar for new notification
    this.snackBar.open(`New notification: ${notification.title}`, 'View', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  openNotificationsPage(): void {
    // TODO: Navigate to full notifications page
    console.log('Navigate to notifications page');
  }

  getTypeDisplay(type: string): string {
    const typeMap: { [key: string]: string } = {
      'ACTIVITY_ASSIGNED': 'Activity',
      'ACTIVITY_UPDATED': 'Update',
      'ACTIVITY_STATUS_CHANGED': 'Status',
      'TEAM_MEMBER_ADDED': 'Team',
      'TEAM_MEMBER_REMOVED': 'Team',
      'TEST': 'Test'
    };
    return typeMap[type] || type;
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMilliseconds = now.getTime() - notificationTime.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
}
