import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- This component will be used for showing toast notifications -->
    <div class="notification-container">
      <!-- Notifications will be dynamically added here -->
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 16px;
      z-index: 2000;
    }
  `]
})
export class NotificationSnackbarComponent {
  constructor() {}
}
