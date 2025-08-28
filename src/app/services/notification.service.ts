import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Notification } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api/notifications';
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  // Observable for real-time notifications
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  // Observable for connection status
  private connectionSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionSubject.asObservable();

  // Observable for unread count
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get HTTP headers with authorization
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Initialize WebSocket connection for real-time notifications
   */
  connectWebSocket(token: string): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const wsUrl = `ws://localhost:3000/ws/notifications?token=${token}`;
    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = () => {
      // console.log('WebSocket connected for notifications');
      this.connectionSubject.next(true);
      this.reconnectAttempts = 0;
    };

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log('WebSocket message received:', data);

        if (data.type === 'notification') {
          this.notificationSubject.next(data.data);
          this.updateUnreadCount();
        } else if (data.type === 'connection') {
          // console.log('WebSocket connection confirmed:', data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.websocket.onclose = (event) => {
      // console.log('WebSocket connection closed:', event.reason);
      this.connectionSubject.next(false);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          this.connectWebSocket(token);
        }, this.reconnectInterval);
      }
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.connectionSubject.next(false);
    }
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`, {
      headers: this.getHeaders()
    });
  }

  markAsRead(notificationId: string): Observable<any> {
    return new Observable(observer => {
      this.http.put(`${this.apiUrl}/${notificationId}/read`, {}, {
        headers: this.getHeaders()
      }).subscribe({
        next: (response) => {
          // Update unread count after marking as read
          this.updateUnreadCount();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  markAllAsRead(): Observable<any> {
    return new Observable(observer => {
      this.http.put(`${this.apiUrl}/read-all`, {}, {
        headers: this.getHeaders()
      }).subscribe({
        next: (response) => {
          // Update unread count after marking all as read
          this.updateUnreadCount();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`, {
      headers: this.getHeaders()
    });
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`, {
      headers: this.getHeaders()
    });
  }

  createTestNotification(): Observable<any> {
    return this.http.post(`${this.apiUrl}/test`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCountSubject.next(response.count);
      },
      error: (error) => {
        console.error('Error fetching notification counts:', error);
      }
    });
  }

  /**
   * Initialize notification service
   */
  initialize(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.connectWebSocket(token);
      this.updateUnreadCount();
    }
  }

  /**
   * Cleanup on logout
   */
  cleanup(): void {
    this.disconnectWebSocket();
    this.unreadCountSubject.next(0);
  }
}
