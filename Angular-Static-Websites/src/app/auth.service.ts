import { Injectable } from '@angular/core';

/**
 * Simple dashboard lock.
 * Change the password here. It is stored in the browser session only,
 * so the dashboard asks again after the tab is closed.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'dashboard_unlocked';
  private readonly PASSWORD = '12345678';

  isLoggedIn(): boolean {
    try { return sessionStorage.getItem(this.KEY) === '1'; } catch { return false; }
  }

  login(password: string): boolean {
    if (password !== this.PASSWORD) return false;
    try { sessionStorage.setItem(this.KEY, '1'); } catch { /* ignore */ }
    return true;
  }

  logout(): void {
    try { sessionStorage.removeItem(this.KEY); } catch { /* ignore */ }
  }
}
