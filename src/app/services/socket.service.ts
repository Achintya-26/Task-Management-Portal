import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  constructor(private authService: AuthService) {
    // Don't auto-connect - we're using WebSocket notifications now
  }

  connect(): void {
    if (!this.socket) {
      // Only connect if explicitly requested
      this.socket = io('http://localhost:3000'); // Update to Spring Boot port if needed
    }
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  joinTeam(teamId: string): void {
    if (this.socket) {
      this.socket.emit('join-team', teamId);
    }
  }

  leaveTeam(teamId: string): void {
    if (this.socket) {
      this.socket.emit('leave-team', teamId);
    }
  }

  leaveAllRooms(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  onTeamUpdated(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('team_updated', data => observer.next(data));
      }
    });
  }

  onActivityCreated(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('activity_created', data => observer.next(data));
      }
    });
  }

  onActivityUpdated(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('activity_updated', data => observer.next(data));
      }
    });
  }
}
