export type Gender = 'Male' | 'Female' | 'Other';

export type ArrivalMethod = 'Flight' | 'Land' | 'Sea';

export type TravelPurpose = 'Tourism' | 'Business' | 'Visiting Friends / Family' | 'Education' | 'Other';

export type AccommodationType = 'Hotel' | 'Apartment' | 'Private Residence' | 'Other';

export type ApplicationStatus = 'New' | 'Processing' | 'Completed' | 'Cancelled' | 'processing' | 'cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'pending' | 'paid' | 'failed' | 'refunded';

export interface ServicePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  active: boolean;
  features?: string[];
  recommended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  applicationId: string;
  userId?: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  provider: 'stripe';
  providerPaymentId?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  refundId?: string;
  refundAmount?: number;
  refundDate?: string;
  refundAdminUid?: string;
  adminNotes?: string;
}

export interface PaymentEvent {
  id: string;
  eventId: string;
  eventType: string;
  paymentId?: string;
  applicationId?: string;
  processedAt: string;
  data?: any;
}

export interface PersonalInfo {
  surname: string;
  givenName: string;
  dateOfBirth: string;
  birthCity: string;
  birthCountry: string;
  gender: Gender | '';
  nationality: string;
}

export interface PassportInfo {
  passportCountry: string;
  passportNumber: string;
  issueDate: string;
  expiryDate: string;
}

export interface TravelInfo {
  arrivalDate: string;
  departureDate: string;
  arrivalMethod: ArrivalMethod | '';
  flightNumber: string;
  arrivalAirport: string;
  lastEmbarkationCountry: string;
  purpose: TravelPurpose | '';
}

export interface AccommodationInfo {
  accommodationType: AccommodationType | '';
  accommodationName: string;
  address: string;
  city: string;
  state: string;
  contactPhone: string;
}

export interface ContactInfo {
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
}

export interface EntryApplication {
  id: string;
  applicationId: string;
  personalInfo: PersonalInfo;
  passportInfo: PassportInfo;
  travelInfo: TravelInfo;
  accommodation: AccommodationInfo;
  contactInfo: ContactInfo;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  planId?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  paymentId?: string;
  paidAt?: string;
  adminNotes?: string;
  confirmedTruth: boolean;
  agreedPrivacy: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminLogAction =
  | 'VIEW_APPLICATION'
  | 'VIEW_SENSITIVE_DATA'
  | 'EDIT_APPLICATION'
  | 'UPDATE_APPLICATION'
  | 'EXPORT_APPLICATIONS'
  | 'CHANGE_STATUS'
  | 'DELETE_APPLICATION'
  | 'ADMIN_LOGIN'
  | 'REFUND_PAYMENT'
  | 'REFUND_ORDER'
  | 'CREATE_SERVICE_PLAN'
  | 'EDIT_SERVICE_PLAN'
  | 'TOGGLE_SERVICE_PLAN'
  | 'DELETE_SERVICE_PLAN';

export interface AdminLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: AdminLogAction;
  applicationId?: string;
  details?: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
  displayName?: string;
  createdAt: string;
}
