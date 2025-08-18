import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, of, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

export function initializeAuth(): () => Observable<any> {
  return () => {
    const authService = inject(AuthService);
    
    // Give the auth service a moment to initialize
    return timer(100).pipe(
      switchMap(() => {
        // If user is logged in, try to refresh their data
        if (authService.isLoggedIn()) {
          authService.refreshUserData();
        }
        return of(true);
      }),
      take(1)
    );
  };
}
