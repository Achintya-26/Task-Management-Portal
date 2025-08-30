import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models';

export interface NotificationSettings {
  soundEnabled: boolean;
  volume: number;
  showBadge: boolean;
  autoMarkAsRead: boolean;
  autoMarkAsReadDelay: number;
  autoDeleteOnRead: boolean;
  autoDeleteDelay: number;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ],
  template: `
    <div class="notifications-container">
      <!-- Enhanced Notification Bell with Animation -->
      <button 
        mat-icon-button 
        [matMenuTriggerFor]="notificationMenu"
        class="notification-bell"
        [class.has-notifications]="unreadCount > 0"
        [class.pulse-animation]="hasNewNotification"
        (click)="onBellClick()">
        <mat-icon [matBadge]="unreadCount" 
                  [matBadgeHidden]="unreadCount === 0" 
                  matBadgeColor="warn"
                  matBadgeSize="small"
                  [class.shake]="shouldShake">
          {{ unreadCount > 0 ? 'notifications_active' : 'notifications' }}
        </mat-icon>
      </button>

      <!-- Enhanced Notification Menu -->
      <mat-menu #notificationMenu="matMenu" class="notification-menu">
        <!-- Modern Header with Gradient -->
        <div class="notification-header">
          <div class="header-content">
            <div class="header-text">
              <h3>Notifications</h3>
              <span class="count-text">{{unreadCount}} unread of {{notifications.length}}</span>
              <!-- <span *ngIf="notificationSettings.autoDeleteOnRead" class="auto-delete-info">
                <mat-icon class="info-icon">auto_delete</mat-icon>
                Auto-delete enabled
              </span> -->
            </div>
            <div class="header-actions">
              <button mat-icon-button 
                      class="action-btn refresh-btn"
                      [class.spinning]="isRefreshing"
                      (click)="refreshNotifications()" 
                      matTooltip="Refresh">
                <mat-icon>refresh</mat-icon>
              </button>
              <button mat-icon-button 
                      class="action-btn"
                      (click)="markAllAsRead()" 
                      matTooltip="Mark all as read"
                      [disabled]="unreadCount === 0">
                <mat-icon>done_all</mat-icon>
              </button>
              <!-- <button mat-icon-button 
                      class="action-btn clear-all-btn"
                      (click)="clearAllReadNotifications()" 
                      matTooltip="Clear all read notifications"
                      [disabled]="readCount === 0">
                <mat-icon>clear_all</mat-icon>
              </button> -->
              <!-- <button mat-icon-button 
                      class="action-btn"
                      (click)="openSettings()" 
                      matTooltip="Settings">
                <mat-icon>settings</mat-icon>
              </button> -->
            </div>
          </div>
        </div>

        <!-- Enhanced Connection Status -->
        <!-- <div class="connection-status" 
             [class.connected]="isConnected" 
             [class.disconnected]="!isConnected">
          <div class="status-indicator">
            <mat-icon [class.pulse-icon]="!isConnected">
              {{ isConnected ? 'wifi' : 'wifi_off' }}
            </mat-icon>
            <div class="status-dot" [class.connected]="isConnected"></div>
          </div>
          <span>{{ isConnected ? 'Real-time connected' : 'Reconnecting...' }}</span>
        </div> -->

        <!-- Filter Chips -->
        <!-- <div class="notification-filters">
          <div class="filter-chips">
            <button 
              *ngFor="let filter of filterOptions" 
              mat-stroked-button
              [class.active]="selectedFilter === filter.value"
              (click)="setFilter(filter.value)"
              class="filter-chip">
              <mat-icon>{{filter.icon}}</mat-icon>
              {{filter.label}}
            </button>
          </div>
        </div> -->

        <!-- Enhanced Notifications List -->
        <div class="notifications-list">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
            <span>Loading notifications...</span>
          </div>

          <!-- Enhanced Empty State -->
          <div *ngIf="!isLoading && filteredNotifications.length === 0" class="no-notifications">
            <div class="empty-icon">
              <mat-icon>{{getEmptyStateIcon()}}</mat-icon>
            </div>
            <h4>{{getEmptyStateTitle()}}</h4>
            <p>{{getEmptyStateMessage()}}</p>
            <!-- <button mat-stroked-button color="primary" (click)="createTestNotification()">
              <mat-icon>add</mat-icon>
              Create Test Notification
            </button> -->
          </div>

          <!-- Enhanced Notification Items -->
          <div *ngFor="let notification of filteredNotifications; trackBy: trackByNotificationId" 
               class="notification-item" 
               [class]="getNotificationClasses(notification)"
               [attr.data-notification-id]="notification.id"
               (click)="onNotificationClick(notification)">
            
            <!-- Notification Icon -->
            <div class="notification-icon" [class]="getNotificationIconClass(notification.type)">
              <mat-icon>{{getNotificationIcon(notification.type)}}</mat-icon>
            </div>

            <!-- Notification Content -->
            <div class="notification-content">
              <div class="notification-header-item">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-badges">
                  <span class="type-chip" [class]="getTypeChipClass(notification.type)">
                    {{ getTypeDisplay(notification.type) }}
                  </span>
                </div>
              </div>
              
              <div class="notification-message">{{ notification.message }}</div>
              
              <div class="notification-meta">
                <div class="time-info">
                  <mat-icon class="time-icon">access_time</mat-icon>
                  <span>{{ getTimeAgo(notification.createdAt) }}</span>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions">
                  <button mat-icon-button 
                          *ngIf="!notification.isRead"
                          class="quick-action read-action"
                          (click)="quickMarkAsRead($event, notification.id)"
                          matTooltip="Mark as read">
                    <mat-icon>check</mat-icon>
                  </button>
                  <button mat-icon-button 
                          *ngIf="notification.relatedActivityId || notification.relatedTeamId"
                          class="quick-action nav-action"
                          (click)="quickNavigate($event, notification.id)"
                          matTooltip="Navigate">
                    <mat-icon>open_in_new</mat-icon>
                  </button>
                  <!-- <button mat-icon-button 
                          class="quick-action delete-action"
                          (click)="quickDelete($event, notification.id)"
                          matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button> -->
                </div>
              </div>
            </div>

            <!-- Unread Indicator -->
            <div *ngIf="!notification.isRead" class="unread-indicator">
              <div class="unread-dot"></div>
            </div>
          </div>
        </div>

        <!-- Enhanced Footer -->
        <div class="notification-footer" *ngIf="notifications.length > 0">
          <div class="footer-stats">
            Showing {{filteredNotifications.length}} of {{notifications.length}} notifications
          </div>
          <div class="footer-actions">
            <button mat-button class="settings-btn" (click)="openSettings()">
              <mat-icon>settings</mat-icon>
              Settings
            </button>
            <button mat-raised-button color="primary" (click)="viewAllNotifications()">
              View All
            </button>
          </div>
        </div>
      </mat-menu>
    </div>
  `,
  styles: [`
    /* Enhanced Bell Animation */
    .notification-bell .mat-icon.shake {
      animation: shake 0.6s ease-in-out;
    }

    .notification-bell.pulse-animation {
      animation: bellPulse 2s infinite;
    }

    @keyframes shake {
      0%, 100% { transform: rotate(0deg); }
      10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
      20%, 40%, 60%, 80% { transform: rotate(10deg); }
    }

    @keyframes bellPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    /* Filter Chips Styling */
    .notification-filters {
      padding: 12px 16px;
      background: rgba(255,255,255,0.7);
    }

    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-chip {
      font-size: 0.8em !important;
      height: 32px !important;
      border-radius: 16px !important;
      transition: all 0.3s ease !important;
    }

    .filter-chip.active {
      background-color: #1976d2 !important;
      color: white !important;
    }

    .filter-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 6px;
    }

    /* Loading and Empty States */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      gap: 16px;
      color: #666;
    }

    /* Rest of the comprehensive styles from the previous implementation */
    .notifications-container {
      position: relative;
    }

    .notification-bell {
      color: #666;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
    }

    .notification-bell:hover {
      color: #1976d2;
      transform: scale(1.1);
    }

    .notification-bell.has-notifications {
      color: #1976d2;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    /* Enhanced Menu Styling */
    .notification-menu {
      width: 420px;
      max-height: 600px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      overflow: hidden;
    }

    /* Modern Header */
    .notification-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-text h3 {
      margin: 0;
      font-size: 1.4em;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .count-text {
      font-size: 0.85em;
      opacity: 0.9;
      margin-top: 4px;
      display: block;
    }

    .auto-delete-info {
      font-size: 0.75em;
      opacity: 0.8;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .auto-delete-info .info-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      color: rgba(255,255,255,0.9);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: rgba(255,255,255,0.2);
      color: white;
      transform: scale(1.1);
    }

    .action-btn:disabled {
      opacity: 0.4;
    }

    .clear-all-btn:hover {
      background: rgba(244, 67, 54, 0.2) !important; /* Red tint for delete action */
    }

    .clear-all-btn:hover mat-icon {
      color: #f44336 !important; /* Red color for clear icon */
    }

    .refresh-btn.spinning .mat-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Enhanced Connection Status */
    .connection-status {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: rgba(255,255,255,0.5);
      backdrop-filter: blur(10px);
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .status-indicator {
      position: relative;
      display: flex;
      align-items: center;
    }

    .status-dot {
      position: absolute;
      right: -2px;
      top: -2px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f44336;
      animation: blink 2s infinite;
    }

    .status-dot.connected {
      background: #4caf50;
      animation: none;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }

    .connection-status.connected {
      color: #2e7d32;
      background: rgba(76, 175, 80, 0.1);
    }

    .connection-status.disconnected {
      color: #d32f2f;
      background: rgba(244, 67, 54, 0.1);
    }

    .pulse-icon {
      animation: pulse-red 1.5s infinite;
    }

    @keyframes pulse-red {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    /* Enhanced Notifications List */
    .notifications-list {
      min-height: 100px;
      background: white;
    }

    .no-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px 20px;
      color: #999;
      text-align: center;
    }

    .empty-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    .no-notifications h4 {
      margin: 0 0 8px 0;
      font-size: 1.1em;
      color: #666;
    }

    .no-notifications p {
      margin: 0 0 16px 0;
      font-size: 0.9em;
      line-height: 1.4;
    }

    /* Enhanced Notification Items */
    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      background: white;
    }

    .notification-item:hover {
      background: #f8f9ff;
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .notification-item.unread {
      background: linear-gradient(90deg, rgba(25,118,210,0.03) 0%, rgba(255,255,255,1) 100%);
      border-left: 4px solid #1976d2;
    }

    /* Fade-out animation for deleted notifications */
    .notification-item.fade-out {
      opacity: 0;
      transform: translateX(-100%);
      transition: all 0.3s ease;
      max-height: 0;
      padding: 0 20px;
      margin: 0;
      overflow: hidden;
    }

    /* Auto-delete animation for read notifications */
    .notification-item.read {
      animation: fadeToRead 1s ease;
    }

    @keyframes fadeToRead {
      0% { opacity: 1; }
      50% { 
        background: rgba(76, 175, 80, 0.1);
        border-left-color: #4caf50;
      }
      100% { opacity: 1; }
    }

    .notification-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      position: relative;
    }

    /* Notification Type Icons */
    .icon-activity { background: rgba(33, 150, 243, 0.1); color: #2196f3; }
    .icon-update { background: rgba(255, 152, 0, 0.1); color: #ff9800; }
    .icon-status { background: rgba(156, 39, 176, 0.1); color: #9c27b0; }
    .icon-completed { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
    .icon-team-add { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
    .icon-team-remove { background: rgba(244, 67, 54, 0.1); color: #f44336; }
    .icon-team { background: rgba(63, 81, 181, 0.1); color: #3f51b5; }
    .icon-reminder { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
    .icon-test { background: rgba(158, 158, 158, 0.1); color: #9e9e9e; }
    .icon-system { background: rgba(96, 125, 139, 0.1); color: #607d8b; }
    .icon-default { background: rgba(158, 158, 158, 0.1); color: #9e9e9e; }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 6px;
      gap: 12px;
    }

    .notification-title {
      font-weight: 600;
      font-size: 0.95em;
      color: #333;
      line-height: 1.3;
    }

    .notification-badges {
      flex-shrink: 0;
    }

    .type-chip {
      font-size: 0.7em !important;
      height: 20px !important;
      border-radius: 10px !important;
      font-weight: 500 !important;
      padding: 0 8px !important;
    }

    /* Type-specific chip colors */
    .chip-activity { background: rgba(33, 150, 243, 0.1); color: #2196f3; }
    .chip-update { background: rgba(255, 152, 0, 0.1); color: #ff9800; }
    .chip-status { background: rgba(156, 39, 176, 0.1); color: #9c27b0; }
    .chip-completed { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
    .chip-team { background: rgba(63, 81, 181, 0.1); color: #3f51b5; }
    .chip-reminder { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
    .chip-test { background: rgba(158, 158, 158, 0.1); color: #9e9e9e; }
    .chip-system { background: rgba(96, 125, 139, 0.1); color: #607d8b; }
    .chip-default { background: rgba(158, 158, 158, 0.1); color: #9e9e9e; }

    .notification-message {
      font-size: 0.85em;
      color: #666;
      line-height: 1.4;
      margin-bottom: 12px;
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
      gap: 12px;
    }

    .time-info {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #999;
      font-size: 0.75em;
    }

    .time-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .quick-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .notification-item:hover .quick-actions {
      opacity: 1;
    }

    .quick-action {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .quick-action .mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .read-action {
      color: #4caf50;
    }
    .read-action:hover {
      background: rgba(76, 175, 80, 0.1);
    }

    .nav-action {
      color: #2196f3;
    }
    .nav-action:hover {
      background: rgba(33, 150, 243, 0.1);
    }

    .delete-action {
      color: #f44336;
    }
    .delete-action:hover {
      background: rgba(244, 67, 54, 0.1);
    }

    .unread-indicator {
      position: absolute;
      top: 16px;
      right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      background: linear-gradient(135deg, #1976d2, #42a5f5);
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(25, 118, 210, 0.4);
    }

    /* Enhanced Footer */
    .notification-footer {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e0e0e0;
    }

    .footer-stats {
      font-size: 0.8em;
      color: #666;
      font-weight: 500;
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }

    .footer-actions button {
      font-size: 0.85em;
      padding: 4px 12px;
      height: 32px;
      border-radius: 16px;
    }

    .settings-btn {
      color: #666;
    }

    /* Notification Type Specific Styling */
    .notification-activity_status_changed {
      border-left-color: #9c27b0;
    }

    .notification-activity_remark_added {
      border-left-color: #ff9800;
    }

    .notification-activity_assigned {
      border-left-color: #2196f3;
    }

    .notification-activity_updated {
      border-left-color: #ff9800;
    }

    .notification-activity_completed {
      border-left-color: #4caf50;
    }

    .notification-team_member_added {
      border-left-color: #4caf50;
    }

    .notification-team_member_removed {
      border-left-color: #f44336;
    }

    .notification-team_created {
      border-left-color: #3f51b5;
    }

    .notification-team_updated {
      border-left-color: #3f51b5;
    }

    .notification-system {
      border-left-color: #607d8b;
    }

    .notification-system_notification {
      border-left-color: #607d8b;
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .notification-menu {
        width: calc(100vw - 32px);
        max-width: 380px;
      }
      
      .notification-item {
        padding: 12px 16px;
      }
      
      .notification-icon {
        width: 36px;
        height: 36px;
        margin-right: 12px;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isConnected = false;
  
  // Computed properties
  get readCount(): number {
    return this.notifications.filter(n => n.isRead).length;
  }
  
  // Enhanced UI states
  hasNewNotification = false;
  shouldShake = false;
  isLoading = false;
  isRefreshing = false;
  
  // Filter and settings
  selectedFilter = 'all';
  filterOptions = [
    { value: 'all', label: 'All', icon: 'list' },
    { value: 'unread', label: 'Unread', icon: 'fiber_manual_record' },
    { value: 'activity', label: 'Activity', icon: 'assignment' },
    { value: 'team', label: 'Team', icon: 'group' },
    { value: 'system', label: 'System', icon: 'settings' }
  ];
  
  notificationSettings: NotificationSettings = {
    soundEnabled: true,
    volume: 70,
    showBadge: true,
    autoMarkAsRead: false,
    autoMarkAsReadDelay: 5,
    autoDeleteOnRead: true,
    autoDeleteDelay: 1
  };
  
  private subscriptions: Subscription[] = [];
  private shakeTimeout?: any;
  private autoMarkTimeout?: any;

  // Computed property for filtered notifications
  get filteredNotifications(): Notification[] {
    if (!this.notifications.length) return [];
    
    switch (this.selectedFilter) {
      case 'unread':
        return this.notifications.filter(n => !n.isRead);
      case 'activity':
        return this.notifications.filter(n => 
          n.type === 'ACTIVITY_STATUS_CHANGED' || 
          n.type === 'ACTIVITY_REMARK_ADDED' || 
          n.type === 'ACTIVITY_ASSIGNED' ||
          n.type === 'ACTIVITY_UPDATED' ||
          n.type === 'ACTIVITY_COMPLETED'
        );
      case 'team':
        return this.notifications.filter(n => 
          n.type === 'TEAM_MEMBER_ADDED' || 
          n.type === 'TEAM_MEMBER_REMOVED' ||
          n.type === 'TEAM_CREATED' ||
          n.type === 'TEAM_UPDATED'
        );
      case 'system':
        return this.notifications.filter(n => 
          n.type === 'SYSTEM' || 
          n.type === 'SYSTEM_NOTIFICATION' ||
          n.type === 'SYSTEM_MAINTENANCE'
        );
      default:
        return this.notifications;
    }
  }

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.loadSettings();
  }

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

    // Load initial notifications
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.notificationService.cleanup();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications.slice(0, 10); // Show only recent 10
        this.updateUnreadCount();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.snackBar.open('Failed to load notifications', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onBellClick(): void {
    this.loadNotifications();
    this.triggerShakeAnimation();
  }

  private triggerShakeAnimation(): void {
    if (this.unreadCount > 0) {
      this.shouldShake = true;
      if (this.shakeTimeout) {
        clearTimeout(this.shakeTimeout);
      }
      this.shakeTimeout = setTimeout(() => {
        this.shouldShake = false;
      }, 600);
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id.toString()).subscribe({
        next: () => {
          notification.isRead = true;
          this.updateUnreadCount();
          
          // Auto-delete notification after marking as read (if enabled)
          if (this.notificationSettings.autoDeleteOnRead) {
            setTimeout(() => {
              this.deleteNotification(notification);
            }, this.notificationSettings.autoDeleteDelay * 1000); // Convert to milliseconds
          }
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => {
          if (!n.isRead) {
            n.isRead = true;
          }
        });
        this.updateUnreadCount();
        this.snackBar.open('All notifications marked as read', 'Close', { duration: 2000 });
        
        // Auto-delete all notifications if setting is enabled
        if (this.notificationSettings.autoDeleteOnRead) {
          setTimeout(() => {
            this.deleteAllReadNotifications();
          }, this.notificationSettings.autoDeleteDelay * 1000);
        }
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.snackBar.open('Failed to mark notifications as read', 'Close', { duration: 3000 });
      }
    });
  }

  clearAllReadNotifications(): void {
    const readNotifications = this.notifications.filter(n => n.isRead);
    
    if (readNotifications.length === 0) {
      this.snackBar.open('No read notifications to clear', 'Close', { duration: 2000 });
      return;
    }

    // Simple confirmation using native confirm dialog
    const confirmed = confirm(`Are you sure you want to clear ${readNotifications.length} read notification(s)? This action cannot be undone.`);
    
    if (confirmed) {
      this.deleteAllReadNotifications();
      this.snackBar.open(`Cleared ${readNotifications.length} read notifications`, 'Close', { duration: 3000 });
    }
  }

  private deleteAllReadNotifications(): void {
    const readNotifications = this.notifications.filter(n => n.isRead);
    readNotifications.forEach(notification => {
      this.deleteNotification(notification);
    });
  }

  deleteNotification(notification: Notification): void {
    // Add fade-out class for animation
    const notificationElement = document.querySelector(`[data-notification-id="${notification.id}"]`);
    if (notificationElement) {
      notificationElement.classList.add('fade-out');
    }

    // Wait for animation before actually removing from array
    setTimeout(() => {
      this.notificationService.deleteNotification(notification.id.toString()).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          // Remove fade-out class if deletion failed
          if (notificationElement) {
            notificationElement.classList.remove('fade-out');
          }
          this.snackBar.open('Failed to delete notification', 'Close', { duration: 3000 });
        }
      });
    }, 300); // Wait for fade animation
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

    // Update unread count
    this.updateUnreadCount();
    
    // Trigger bell animation for new notifications
    this.hasNewNotification = true;
    this.triggerShakeAnimation();
    
    // Reset new notification flag after animation
    setTimeout(() => {
      this.hasNewNotification = false;
    }, 3000);

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
      'ACTIVITY_STATUS_CHANGED': 'Status Change',
      'ACTIVITY_REMARK_ADDED': 'Remark',
      'ACTIVITY_ASSIGNED': 'Assignment',
      'ACTIVITY_UPDATED': 'Update',
      'ACTIVITY_COMPLETED': 'Completion',
      'TEAM_MEMBER_ADDED': 'Team Join',
      'TEAM_MEMBER_REMOVED': 'Team Leave',
      'TEAM_CREATED': 'New Team',
      'TEAM_UPDATED': 'Team Update',
      'SYSTEM': 'System',
      'SYSTEM_NOTIFICATION': 'System',
      'TEST': 'Test'
    };
    return typeMap[type] || type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
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

  // Enhanced UI Methods
  refreshNotifications(): void {
    this.isRefreshing = true;
    this.loadNotifications();
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
  }

  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }

  getEmptyStateIcon(): string {
    switch (this.selectedFilter) {
      case 'unread': return 'drafts';
      case 'activity': return 'assignment';
      case 'team': return 'group';
      case 'system': return 'settings';
      default: return 'notifications_none';
    }
  }

  getEmptyStateTitle(): string {
    switch (this.selectedFilter) {
      case 'unread': return 'No unread notifications';
      case 'activity': return 'No activity notifications';
      case 'team': return 'No team notifications';
      case 'system': return 'No system notifications';
      default: return 'No notifications';
    }
  }

  getEmptyStateMessage(): string {
    switch (this.selectedFilter) {
      case 'unread': return 'All caught up! You have no unread notifications.';
      case 'activity': return 'No recent activity updates to show.';
      case 'team': return 'No team-related notifications at the moment.';
      case 'system': return 'No system notifications to display.';
      default: return 'When you receive notifications, they will appear here.';
    }
  }

  getNotificationClasses(notification: Notification): string {
    const classes = ['notification-item'];
    if (!notification.isRead) classes.push('unread');
    if (notification.type) classes.push(`notification-${notification.type.toLowerCase()}`);
    return classes.join(' ');
  }

  onNotificationClick(notification: Notification): void {
    this.markAsRead(notification);
    
    // Auto-navigate if activity or team ID is present
    if (notification.relatedActivityId) {
      this.router.navigate(['/activities', notification.relatedActivityId]);
    } else if (notification.relatedTeamId) {
      this.router.navigate(['/teams', notification.relatedTeamId]);
    }
  }

  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'ACTIVITY_STATUS_CHANGED': 'swap_horiz',
      'ACTIVITY_REMARK_ADDED': 'comment',
      'ACTIVITY_ASSIGNED': 'assignment_ind',
      'ACTIVITY_UPDATED': 'update',
      'ACTIVITY_COMPLETED': 'check_circle',
      'TEAM_MEMBER_ADDED': 'person_add',
      'TEAM_MEMBER_REMOVED': 'person_remove',
      'TEAM_CREATED': 'group_add',
      'TEAM_UPDATED': 'group',
      'SYSTEM': 'settings',
      'SYSTEM_NOTIFICATION': 'info',
      'reminder': 'alarm',
      'test': 'bug_report'
    };
    return iconMap[type] || 'notifications';
  }

  getNotificationIconClass(type: string): string {
    const classMap: { [key: string]: string } = {
      'ACTIVITY_STATUS_CHANGED': 'icon-status',
      'ACTIVITY_REMARK_ADDED': 'icon-update',
      'ACTIVITY_ASSIGNED': 'icon-activity',
      'ACTIVITY_UPDATED': 'icon-update',
      'ACTIVITY_COMPLETED': 'icon-completed',
      'TEAM_MEMBER_ADDED': 'icon-team-add',
      'TEAM_MEMBER_REMOVED': 'icon-team-remove',
      'TEAM_CREATED': 'icon-team',
      'TEAM_UPDATED': 'icon-team',
      'SYSTEM': 'icon-system',
      'SYSTEM_NOTIFICATION': 'icon-system',
      'reminder': 'icon-reminder',
      'test': 'icon-test'
    };
    return classMap[type] || 'icon-default';
  }

  getTypeChipClass(type: string): string {
    const classMap: { [key: string]: string } = {
      'ACTIVITY_STATUS_CHANGED': 'chip-status',
      'ACTIVITY_REMARK_ADDED': 'chip-update',
      'ACTIVITY_ASSIGNED': 'chip-activity',
      'ACTIVITY_UPDATED': 'chip-update',
      'ACTIVITY_COMPLETED': 'chip-completed',
      'TEAM_MEMBER_ADDED': 'chip-team',
      'TEAM_MEMBER_REMOVED': 'chip-team',
      'TEAM_CREATED': 'chip-team',
      'TEAM_UPDATED': 'chip-team',
      'SYSTEM': 'chip-system',
      'SYSTEM_NOTIFICATION': 'chip-system',
      'reminder': 'chip-reminder',
      'test': 'chip-test'
    };
    return classMap[type] || 'chip-default';
  }

  // Quick actions
  quickMarkAsRead(event: Event, notificationId: number): void {
    event.stopPropagation();
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      this.markAsRead(notification);
    }
  }

  quickNavigate(event: Event, notificationId: number): void {
    event.stopPropagation();
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      this.onNotificationClick(notification);
    }
  }

  quickDelete(event: Event, notificationId: number): void {
    event.stopPropagation();
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      this.deleteNotification(notification);
    }
  }

  // Settings and configuration
  loadSettings(): void {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(savedSettings) };
      } catch (e) {
        console.warn('Failed to load notification settings:', e);
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
  }

  openSettings(): void {
    this.snackBar.open('Notification settings will be available soon', 'Close', { duration: 3000 });
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}
