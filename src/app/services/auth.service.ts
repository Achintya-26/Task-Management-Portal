import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from '../models';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; // Spring Boot backend
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            // Immediately load user from token for instant UI update
            this.loadUserFromToken();
            // Then optionally verify with backend in the background
            this.verifyCurrentUserInBackground();
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            // Immediately load user from token for instant UI update
            this.loadUserFromToken();
            // Then optionally verify with backend in the background
            this.verifyCurrentUserInBackground();
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Basic token validation - check if it's not expired
    try {
      const payload = this.parseJWT(token);
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      // Token is malformed, clear it
      this.logout();
      return false;
    }
  }

  // Initialize authentication state
  private initializeAuth(): void {
    const token = this.getToken();
    console.log('Initializing auth, token exists:', !!token);
    
    if (token && this.isTokenValid(token)) {
      console.log('Token is valid, loading user info');
      // Immediately load user from token for instant UI update
      this.loadUserFromToken();
      // Then verify with backend in the background
      this.verifyCurrentUserInBackground();
    } else if (token) {
      console.log('Token exists but is invalid, clearing');
      // Token exists but is invalid, clear it
      this.logout();
    } else {
      console.log('No token found');
    }
  }

  // Check if token is valid without making HTTP request
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.parseJWT(token);
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }

  // Parse JWT token to get payload
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  // Remove client-side role checking - always verify with backend
  isAdmin(): Observable<boolean> {
    return this.verifyRole('admin');
  }

  isUser(): Observable<boolean> {
    return this.verifyRole('user');
  }

  private verifyRole(requiredRole: string): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.http.get<{hasRole: boolean}>(`${this.apiUrl}/auth/verify-role/${requiredRole}`)
      .pipe(
        map(response => response.hasRole),
        catchError(() => of(false))
      );
  }

  // Load user info from backend (gracefully handle failures)
  private loadCurrentUser(): void {
    if (this.getToken()) {
      console.log('Loading current user from backend');
      this.verifyCurrentUser().subscribe({
        next: (user) => {
          console.log('User verified successfully:', user);
          this.currentUserSubject.next(user);
        },
        error: (error) => {
          console.warn('Failed to verify user token:', error);
          // Don't immediately logout - the backend might be down
          // Only clear if it's a 401 Unauthorized (invalid token)
          if (error.status === 401) {
            console.log('401 error - token invalid, logging out');
            this.logout();
          } else {
            console.log('Non-401 error, trying to load from token');
            // For other errors (network, 500, etc.), try to extract user from token
            this.loadUserFromToken();
          }
        }
      });
    }
  }

  // Fallback: Extract user info from JWT token
  private loadUserFromToken(): void {
    const token = this.getToken();
    console.log('Loading user from token');
    
    if (token) {
      try {
        const payload = this.parseJWT(token);
        console.log('Token payload:', payload);
        
        // Check if token is expired
        if (payload.exp * 1000 <= Date.now()) {
          console.log('Token is expired, logging out');
          this.logout();
          return;
        }

        const user: User = {
          id: payload.userId,
          empId: payload.empId || payload.sub, // fallback to 'sub' if empId not present
          name: payload.name,
          role: payload.role || 'user' // default role
        };
        
        console.log('User loaded from token:', user);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Invalid token:', error);
        this.logout();
      }
    }
  }

  // Always verify with backend
  verifyCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }

  // Background verification without affecting UI
  private verifyCurrentUserInBackground(): void {
    this.verifyCurrentUser().subscribe({
      next: (user) => {
        console.log('Background verification successful:', user);
        // Update the user data if different from token
        this.currentUserSubject.next(user);
      },
      error: (error) => {
        console.warn('Background verification failed:', error);
        // Only logout if it's a 401 (invalid token)
        if (error.status === 401) {
          this.logout();
        }
        // For other errors, keep the user from token
      }
    });
  }

  // Method to check permissions for specific actions
  canAccessAdminDashboard(): Observable<boolean> {
    return this.isAdmin();
  }

  canManageUsers(): Observable<boolean> {
    return this.isAdmin();
  }

  // Method to refresh user data without full re-authentication
  refreshUserData(): void {
    if (this.getToken()) {
      this.loadCurrentUser();
    }
  }

  // Method to check if user needs to re-authenticate
  shouldReAuthenticate(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = this.parseJWT(token);
      const timeToExpiry = payload.exp * 1000 - Date.now();
      // Re-authenticate if token expires in less than 5 minutes
      return timeToExpiry < 5 * 60 * 1000;
    } catch (error) {
      return true;
    }
  }
}