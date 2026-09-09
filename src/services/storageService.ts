import { EntryApplication, ApplicationStatus, PaymentStatus } from '../types/application.ts';
import { db, isFirebaseConfigured } from '../firebase/config.ts';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'mea_applications_data';
const DRAFT_STORAGE_KEY = 'mea_application_draft_v1';

// Seed sample data for preview & immediate testability
const SEED_APPLICATIONS: EntryApplication[] = [
  {
    id: 'app_seed_1',
    applicationId: 'MEA-20260909-000123',
    personalInfo: {
      surname: 'ZHANG',
      givenName: 'WEI',
      dateOfBirth: '1992-05-18',
      birthCity: 'Beijing',
      birthCountry: 'China',
      gender: 'Male',
      nationality: 'China',
    },
    passportInfo: {
      passportCountry: 'China',
      passportNumber: 'G54289012',
      issueDate: '2020-04-10',
      expiryDate: '2030-04-09',
    },
    travelInfo: {
      arrivalDate: '2026-09-15',
      departureDate: '2026-09-22',
      arrivalMethod: 'Flight',
      flightNumber: 'MH361',
      arrivalAirport: 'Kuala Lumpur International Airport (KLIA)',
      lastEmbarkationCountry: 'China',
      purpose: 'Tourism',
    },
    accommodation: {
      accommodationType: 'Hotel',
      accommodationName: 'Grand Hyatt Kuala Lumpur',
      address: '12 Jalan Pinang, Kuala Lumpur City Centre',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan Kuala Lumpur',
      contactPhone: '+60 3 2182 1234',
    },
    contactInfo: {
      email: 'zhangwei.travel@gmail.com',
      phoneCountryCode: '+86',
      phoneNumber: '13812345678',
    },
    status: 'Processing',
    paymentStatus: 'Paid',
    planId: 'plan_standard',
    planName: 'Standard Service (标准服务)',
    amount: 49.00,
    currency: 'MYR',
    paymentId: 'pay_20260909_001',
    paidAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    adminNotes: '客户已确认吉隆坡接机与行程单，资料完备。',
    confirmedTruth: true,
    agreedPrivacy: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'app_seed_2',
    applicationId: 'MEA-20260909-000124',
    personalInfo: {
      surname: 'SMITH',
      givenName: 'ALEXANDER JAMES',
      dateOfBirth: '1988-11-03',
      birthCity: 'London',
      birthCountry: 'United Kingdom',
      gender: 'Male',
      nationality: 'United Kingdom',
    },
    passportInfo: {
      passportCountry: 'United Kingdom',
      passportNumber: 'UK98712345',
      issueDate: '2022-01-15',
      expiryDate: '2032-01-14',
    },
    travelInfo: {
      arrivalDate: '2026-09-18',
      departureDate: '2026-09-25',
      arrivalMethod: 'Flight',
      flightNumber: 'BA033',
      arrivalAirport: 'Kuala Lumpur International Airport (KLIA)',
      lastEmbarkationCountry: 'United Kingdom',
      purpose: 'Business',
    },
    accommodation: {
      accommodationType: 'Hotel',
      accommodationName: 'The Westin Kuala Lumpur',
      address: '199 Jalan Bukit Bintang',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan Kuala Lumpur',
      contactPhone: '+60 3 2731 8333',
    },
    contactInfo: {
      email: 'alex.smith.corp@outlook.com',
      phoneCountryCode: '+44',
      phoneNumber: '7700900123',
    },
    status: 'New',
    paymentStatus: 'Paid',
    planId: 'plan_premium',
    planName: 'Premium Fast-Track (优先加急服务)',
    amount: 89.00,
    currency: 'MYR',
    paymentId: 'pay_20260909_002',
    paidAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    adminNotes: '',
    confirmedTruth: true,
    agreedPrivacy: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'app_seed_3',
    applicationId: 'MEA-20260908-000101',
    personalInfo: {
      surname: 'TAN',
      givenName: 'MEI LING',
      dateOfBirth: '1995-08-24',
      birthCity: 'Singapore',
      birthCountry: 'Singapore',
      gender: 'Female',
      nationality: 'Singapore',
    },
    passportInfo: {
      passportCountry: 'Singapore',
      passportNumber: 'E7654321K',
      issueDate: '2021-06-20',
      expiryDate: '2031-06-19',
    },
    travelInfo: {
      arrivalDate: '2026-09-12',
      departureDate: '2026-09-14',
      arrivalMethod: 'Land',
      flightNumber: '',
      arrivalAirport: '',
      lastEmbarkationCountry: 'Singapore',
      purpose: 'Visiting Friends / Family',
    },
    accommodation: {
      accommodationType: 'Private Residence',
      accommodationName: 'Auntie Tan Residence',
      address: 'No 45, Jalan Indah 15/2, Bukit Indah',
      city: 'Johor Bahru',
      state: 'Johor',
      contactPhone: '+60 12 789 4321',
    },
    contactInfo: {
      email: 'meiling.tan95@yahoo.com',
      phoneCountryCode: '+65',
      phoneNumber: '91234567',
    },
    status: 'Completed',
    paymentStatus: 'Paid',
    planId: 'plan_standard',
    planName: 'Standard Service (标准服务)',
    amount: 49.00,
    currency: 'MYR',
    paymentId: 'pay_20260908_003',
    paidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    adminNotes: '协助表格核对完毕，已向用户发送申报指导文件。',
    confirmedTruth: true,
    agreedPrivacy: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'app_seed_4',
    applicationId: 'MEA-20260907-000088',
    personalInfo: {
      surname: 'YAMAMOTO',
      givenName: 'KENJI',
      dateOfBirth: '1985-03-12',
      birthCity: 'Osaka',
      birthCountry: 'Japan',
      gender: 'Male',
      nationality: 'Japan',
    },
    passportInfo: {
      passportCountry: 'Japan',
      passportNumber: 'TR4820199',
      issueDate: '2019-09-01',
      expiryDate: '2029-08-31',
    },
    travelInfo: {
      arrivalDate: '2026-09-20',
      departureDate: '2026-09-27',
      arrivalMethod: 'Flight',
      flightNumber: 'JL723',
      arrivalAirport: 'Penang International Airport',
      lastEmbarkationCountry: 'Japan',
      purpose: 'Tourism',
    },
    accommodation: {
      accommodationType: 'Hotel',
      accommodationName: 'Eastern & Oriental Hotel',
      address: '10 Farquhar Street, George Town',
      city: 'George Town',
      state: 'Penang',
      contactPhone: '+60 4 222 2000',
    },
    contactInfo: {
      email: 'yamamoto.k@globaltravel.jp',
      phoneCountryCode: '+81',
      phoneNumber: '9012345678',
    },
    status: 'Completed',
    paymentStatus: 'Paid',
    planId: 'plan_vip',
    planName: 'VIP Concierge Package (尊享VIP管家礼遇)',
    amount: 159.00,
    currency: 'MYR',
    paymentId: 'pay_20260907_004',
    paidAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    adminNotes: '槟城行程资料完整已处理。',
    confirmedTruth: true,
    agreedPrivacy: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'app_seed_5',
    applicationId: 'MEA-20260906-000072',
    personalInfo: {
      surname: 'KIM',
      givenName: 'SOO JIN',
      dateOfBirth: '1998-12-05',
      birthCity: 'Seoul',
      birthCountry: 'South Korea',
      gender: 'Female',
      nationality: 'South Korea',
    },
    passportInfo: {
      passportCountry: 'South Korea',
      passportNumber: 'M90218432',
      issueDate: '2023-02-10',
      expiryDate: '2033-02-09',
    },
    travelInfo: {
      arrivalDate: '2026-09-10',
      departureDate: '2026-09-16',
      arrivalMethod: 'Flight',
      flightNumber: 'KE671',
      arrivalAirport: 'Kota Kinabalu International Airport',
      lastEmbarkationCountry: 'South Korea',
      purpose: 'Tourism',
    },
    accommodation: {
      accommodationType: 'Apartment',
      accommodationName: 'The Shore Kota Kinabalu Residence',
      address: 'Jalan Tun Fuad Stephens',
      city: 'Kota Kinabalu',
      state: 'Sabah',
      contactPhone: '+60 88 123 456',
    },
    contactInfo: {
      email: 'kim.soojin@naver.com',
      phoneCountryCode: '+82',
      phoneNumber: '1098765432',
    },
    status: 'Cancelled',
    paymentStatus: 'Refunded',
    planId: 'plan_standard',
    planName: 'Standard Service (标准服务)',
    amount: 49.00,
    currency: 'MYR',
    paymentId: 'pay_20260906_005',
    paidAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    adminNotes: '用户申请取消行程协助。',
    confirmedTruth: true,
    agreedPrivacy: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

export const storageService = {
  // Generate unique formatted Application ID: MEA-YYYYMMDD-XXXXXX
  generateApplicationId(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `MEA-${yyyy}${mm}${dd}-${randomNum}`;
  },

  // Save or update application
  async saveApplication(
    appData: Omit<EntryApplication, 'id' | 'applicationId' | 'status' | 'createdAt' | 'updatedAt'> & {
      id?: string;
      applicationId?: string;
      status?: ApplicationStatus;
      paymentStatus?: PaymentStatus;
    }
  ): Promise<EntryApplication> {
    const now = new Date().toISOString();
    const applicationId = appData.applicationId || this.generateApplicationId();
    const id = appData.id || 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newApp: EntryApplication = {
      ...appData,
      id,
      applicationId,
      status: appData.status || 'New',
      paymentStatus: appData.paymentStatus || 'Pending',
      adminNotes: appData.adminNotes || '',
      createdAt: now,
      updatedAt: now,
    };

    // Firebase save
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'applications', applicationId), newApp);
      } catch (err) {
        // Fallback to local
      }
    }

    // Local save
    const currentList = this.getAllLocal();
    const existingIndex = currentList.findIndex((a) => a.applicationId === applicationId);
    if (existingIndex !== -1) {
      currentList[existingIndex] = newApp;
    } else {
      currentList.unshift(newApp);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentList));

    // Clear draft once successfully saved
    this.clearDraft();

    return newApp;
  },

  // Update Application Payment Status
  async updateApplicationPaymentStatus(
    applicationId: string,
    paymentStatus: PaymentStatus,
    extra?: {
      planId?: string;
      planName?: string;
      amount?: number;
      currency?: string;
      paymentId?: string;
      paidAt?: string;
    }
  ): Promise<EntryApplication | null> {
    const now = new Date().toISOString();
    const updates: Partial<EntryApplication> = {
      paymentStatus,
      updatedAt: now,
      ...extra,
    };
    if (paymentStatus === 'Paid' && !extra?.paidAt) {
      updates.paidAt = now;
    }

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'applications', applicationId);
        await updateDoc(docRef, updates);
      } catch {
        // fallback
      }
    }

    const all = this.getAllLocal();
    const index = all.findIndex((a) => a.applicationId === applicationId);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
      return all[index];
    }
    return null;
  },

  // Get all applications (Admin)
  async getAllApplications(): Promise<EntryApplication[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const apps: EntryApplication[] = [];
        snap.forEach((d) => {
          apps.push(d.data() as EntryApplication);
        });
        if (apps.length > 0) return apps;
      } catch (err) {
        // Fallback to local
      }
    }
    return this.getAllLocal();
  },

  // Local helper
  getAllLocal(): EntryApplication[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // initialize seeds
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_APPLICATIONS));
    return SEED_APPLICATIONS;
  },

  // Find by Application ID
  async getByApplicationId(appId: string): Promise<EntryApplication | null> {
    const cleaned = appId.trim().toUpperCase();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'applications', cleaned);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as EntryApplication;
        }
      } catch {
        // fallback to local
      }
    }
    const all = this.getAllLocal();
    return all.find((a) => a.applicationId.toUpperCase() === cleaned) || null;
  },

  // Update Status & Notes (Admin)
  async updateApplicationAdmin(
    applicationId: string,
    updates: Partial<Pick<EntryApplication, 'status' | 'paymentStatus' | 'adminNotes' | 'personalInfo' | 'passportInfo' | 'travelInfo' | 'accommodation' | 'contactInfo'>>
  ): Promise<EntryApplication | null> {
    const now = new Date().toISOString();
    let updatedApp: EntryApplication | null = null;

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'applications', applicationId);
        await updateDoc(docRef, { ...updates, updatedAt: now });
      } catch {
        // fallback
      }
    }

    const all = this.getAllLocal();
    const index = all.findIndex((a) => a.applicationId === applicationId);
    if (index !== -1) {
      all[index] = {
        ...all[index],
        ...updates,
        updatedAt: now,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
      updatedApp = all[index];
    }
    return updatedApp;
  },

  // Delete Application (Admin)
  async deleteApplication(applicationId: string): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'applications', applicationId));
      } catch {
        // fallback
      }
    }
    const all = this.getAllLocal();
    const filtered = all.filter((a) => a.applicationId !== applicationId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Draft persistence
  saveDraft(draftData: any): void {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        data: draftData,
        savedAt: Date.now(),
      }));
    } catch {
      // Ignore
    }
  },

  loadDraft(): any | null {
    try {
      const item = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        // Valid within 7 days
        if (Date.now() - parsed.savedAt < 7 * 86400000) {
          return parsed.data;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
  },

  // Sensitive data mask helpers
  maskPassport(passportNumber: string): string {
    if (!passportNumber) return '***';
    const trimmed = passportNumber.trim();
    if (trimmed.length <= 4) return trimmed[0] + '***';
    return trimmed.substring(0, 4) + '****';
  },

  maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***@***';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return name[0] + '***@' + domain;
    return name.substring(0, 3) + '***@' + domain;
  },

  maskPhone(code: string, phone: string): string {
    if (!phone) return '***';
    const cleanPhone = phone.trim();
    if (cleanPhone.length <= 4) return `${code} ***`;
    const start = cleanPhone.slice(0, 3);
    const end = cleanPhone.slice(-4);
    return `${code} ${start}****${end}`;
  }
};
