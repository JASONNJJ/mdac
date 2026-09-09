import { AdminLog, AdminLogAction } from '../types/application.ts';
import { db, isFirebaseConfigured } from '../firebase/config.ts';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const LOCAL_LOGS_KEY = 'mea_admin_audit_logs';

export const auditService = {
  async logAction(action: AdminLogAction, applicationId?: string, details?: string, adminEmail: string = 'admin@malaysia-entry.com'): Promise<void> {
    const logItem: AdminLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      adminUid: 'admin_primary',
      adminEmail,
      action,
      applicationId: applicationId || 'SYSTEM',
      details: details || '',
      timestamp: new Date().toISOString(),
    };

    // Firebase storage if enabled
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'adminLogs'), logItem);
      } catch (e) {
        // Fallback to local
      }
    }

    // Always store to local logs as well
    try {
      const existing = this.getLocalLogs();
      existing.unshift(logItem);
      // Keep recent 200 logs
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(existing.slice(0, 200)));
    } catch {
      // Ignore quota errors
    }
  },

  getLocalLogs(): AdminLog[] {
    try {
      const data = localStorage.getItem(LOCAL_LOGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }

    // Initial default logs for initial preview
    const initialLogs: AdminLog[] = [
      {
        id: 'log_init_01',
        adminUid: 'admin_primary',
        adminEmail: 'admin@malaysia-entry.com',
        action: 'ADMIN_LOGIN',
        applicationId: 'SYSTEM',
        details: 'Admin logged into portal from secure IP',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'log_init_02',
        adminUid: 'admin_primary',
        adminEmail: 'admin@malaysia-entry.com',
        action: 'CHANGE_STATUS',
        applicationId: 'MEA-20260908-000101',
        details: 'Status changed from New to Processing',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'log_init_03',
        adminUid: 'admin_primary',
        adminEmail: 'admin@malaysia-entry.com',
        action: 'EDIT_APPLICATION',
        applicationId: 'MEA-20260908-000101',
        details: 'Updated internal note: Customer confirmed flight schedule KLIA2',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      }
    ];
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(initialLogs));
    return initialLogs;
  },

  async getLogs(): Promise<AdminLog[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(100));
        const snap = await getDocs(q);
        const logs: AdminLog[] = [];
        snap.forEach((doc) => {
          logs.push({ ...doc.data(), id: doc.id } as AdminLog);
        });
        if (logs.length > 0) return logs;
      } catch (e) {
        // fallback
      }
    }
    return this.getLocalLogs();
  }
};
