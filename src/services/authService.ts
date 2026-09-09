import { UserProfile } from '../types/application.ts';
import { auth, isFirebaseConfigured } from '../firebase/config.ts';
import { signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import { auditService } from './auditService.ts';

const ADMIN_SESSION_KEY = 'mea_admin_auth_session';

const DEFAULT_ADMIN: UserProfile = {
  uid: 'admin_usr_001',
  email: 'admin@malaysia-entry.com',
  role: 'admin',
  displayName: 'Lead Assistance Administrator',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const authService = {
  async login(email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Firebase Auth if live credentials are configured
    if (isFirebaseConfigured && auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const fbUser: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email || cleanEmail,
          role: 'admin',
          displayName: userCred.user.displayName || 'Administrator',
          createdAt: new Date().toISOString(),
        };
        this.setSession(fbUser);
        await auditService.logAction('ADMIN_LOGIN', 'SYSTEM', 'Firebase Auth login successful', fbUser.email);
        return { success: true, user: fbUser };
      } catch (err: any) {
        // If Firebase auth throws invalid credentials, report error
        return {
          success: false,
          error: err.message || 'Firebase Authentication failed',
        };
      }
    }

    // 2. Verified admin credentials
    if (cleanEmail === 'admin@malaysia-entry.com' && pass === 'Admin@2026!') {
      this.setSession(DEFAULT_ADMIN);
      await auditService.logAction('ADMIN_LOGIN', 'SYSTEM', 'Local Admin Session authenticated', DEFAULT_ADMIN.email);
      return { success: true, user: DEFAULT_ADMIN };
    }

    return {
      success: false,
      error: 'Invalid administrator email or password. Please use authorized credentials.',
    };
  },

  setSession(user: UserProfile): void {
    const sessionData = {
      user,
      token: 'jwt_sim_' + Math.random().toString(36).substring(2),
      expiresAt: Date.now() + 8 * 3600000, // 8 hours session
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
  },

  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(ADMIN_SESSION_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return parsed.user;
        }
      }
    } catch {
      // ignore
    }
    return null;
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },

  isAuthenticated(): boolean {
    return this.isAdmin();
  },

  async logout(): Promise<void> {
    const user = this.getCurrentUser();
    if (isFirebaseConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch {
        // ignore
      }
    }
    if (user) {
      await auditService.logAction('ADMIN_LOGIN', 'SYSTEM', 'Admin signed out', user.email);
    }
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
};
