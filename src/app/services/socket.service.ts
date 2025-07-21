import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor(private authService: AuthService) {
    this.socket = io('http://localhost:3000');
  }

  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  joinTeam(teamId: string): void {
    this.socket.emit('join-team', teamId);
  }

  onTeamUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('team_updated', data => observer.next(data));
    });
  }

  onActivityCreated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('activity_created', data => observer.next(data));
    });
  }

  onActivityUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('activity_updated', data => observer.next(data));
    });
  }
}
