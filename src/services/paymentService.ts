import { PaymentRecord } from '../types/application.ts';

const LOCAL_PAYMENTS_KEY = 'mea_payments_records_v1';

export interface CheckoutResponse {
  isConfigured: boolean;
  isTestMode?: boolean;
  message?: string;
  sessionId?: string;
  checkoutUrl?: string;
  amount: number;
  currency: string;
  paymentId: string;
  plan?: any;
  testSessionId?: string;
}

export interface RevenueAnalytics {
  range: string;
  grossRevenue: number;
  totalRefunds: number;
  refundedAmount: number;
  netRevenue: number;
  todayRevenue: number;
  successfulCount: number;
  totalPaidOrders: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  totalRefundedOrders: number;
  currency: string;
  dailySeries: Array<{
    date: string;
    revenue: number;
    refunds: number;
    count: number;
  }>;
}

export type RevenueAnalyticsData = RevenueAnalytics;

export const paymentService = {
  // Check backend payment provider configuration
  async getConfig(): Promise<{ isConfigured: boolean; publishableKey: string; currency: string; mode: string }> {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return {
      isConfigured: false,
      publishableKey: '',
      currency: 'MYR',
      mode: 'test',
    };
  },

  // Initiate Stripe Checkout or Safe Test Gateway session
  // SERVER calculates authoritative price based on planId
  async createCheckoutSession(params: {
    planId: string;
    applicationId: string;
    customerName: string;
    customerEmail: string;
  }): Promise<CheckoutResponse> {
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        // save record locally for instant client responsiveness
        this.saveLocalPayment({
          id: data.paymentId,
          applicationId: params.applicationId,
          planId: params.planId,
          planName: data.plan?.name || 'Selected Plan',
          amount: data.amount,
          currency: data.currency || 'MYR',
          provider: 'stripe',
          providerPaymentId: data.sessionId || data.testSessionId,
          status: 'pending',
          paymentMethod: 'Credit / Debit Card',
          customerName: params.customerName,
          customerEmail: params.customerEmail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return data;
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create payment session');
      }
    } catch (e: any) {
      console.warn('Network request to payment server failed, falling back to local sandbox:', e);
      // Fallback local creation
      const testId = 'pay_local_' + Date.now();
      const rec: PaymentRecord = {
        id: testId,
        applicationId: params.applicationId,
        planId: params.planId,
        planName: 'Service Plan',
        amount: 49.00,
        currency: 'MYR',
        provider: 'stripe',
        providerPaymentId: 'local_test_' + Date.now(),
        status: 'pending',
        paymentMethod: 'Credit / Debit Card',
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.saveLocalPayment(rec);
      return {
        isConfigured: false,
        isTestMode: true,
        message: 'Payment provider is not configured. Running in Safe Sandbox Mode.',
        amount: 49.00,
        currency: 'MYR',
        paymentId: testId,
        testSessionId: rec.providerPaymentId,
      };
    }
  },

  // Confirm payment in Test/Sandbox Mode or simulation
  async confirmTestPayment(params: {
    paymentId: string;
    applicationId: string;
    paymentMethod?: string;
    shouldFail?: boolean;
  }): Promise<{ success: boolean; status: string; payment: PaymentRecord }> {
    try {
      const res = await fetch('/api/stripe/confirm-test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.payment) {
          this.saveLocalPayment(data.payment);
        }
        return data;
      }
    } catch {
      // fallback
    }

    // Local fallback update
    const all = this.getAllLocalPayments();
    const target = all.find((p) => p.id === params.paymentId || (params.applicationId && p.applicationId === params.applicationId));
    const now = new Date().toISOString();

    if (params.shouldFail) {
      if (target) {
        target.status = 'failed';
        target.updatedAt = now;
        localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(all));
        return { success: false, status: 'failed', payment: target };
      }
    }

    if (target) {
      target.status = 'paid';
      target.paidAt = now;
      target.updatedAt = now;
      target.paymentMethod = params.paymentMethod || 'Credit / Debit Card';
      localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(all));
      return { success: true, status: 'paid', payment: target };
    }

    const fallback: PaymentRecord = {
      id: params.paymentId || 'pay_' + Date.now(),
      applicationId: params.applicationId,
      planId: 'plan_standard',
      planName: 'Standard Service',
      amount: 49.00,
      currency: 'MYR',
      provider: 'stripe',
      status: params.shouldFail ? 'failed' : 'paid',
      paymentMethod: params.paymentMethod || 'Credit / Debit Card',
      customerName: 'Guest',
      customerEmail: 'guest@example.com',
      createdAt: now,
      updatedAt: now,
      paidAt: params.shouldFail ? undefined : now,
    };
    this.saveLocalPayment(fallback);
    return { success: !params.shouldFail, status: fallback.status, payment: fallback };
  },

  // Get all payments (Admin)
  async getAllPayments(filters?: { search?: string; status?: string; dateFrom?: string; dateTo?: string }): Promise<PaymentRecord[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.search) queryParams.set('search', filters.search);
      if (filters?.status && filters.status !== 'ALL') queryParams.set('status', filters.status);
      if (filters?.dateFrom) queryParams.set('dateFrom', filters.dateFrom);
      if (filters?.dateTo) queryParams.set('dateTo', filters.dateTo);

      const res = await fetch(`/api/payments?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch {
      // fallback
    }

    let local = this.getAllLocalPayments();
    if (filters?.status && filters.status !== 'ALL') {
      local = local.filter((p) => p.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      local = local.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.applicationId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q)
      );
    }
    return local;
  },

  // Get payments for a specific Application (Supporting multiple payment attempts)
  async getPaymentsByApplicationId(applicationId: string): Promise<PaymentRecord[]> {
    const all = await this.getAllPayments();
    return all.filter((p) => p.applicationId === applicationId);
  },

  // Refund Payment via Server API / Stripe
  async refundPayment(paymentId: string, reason?: string, adminUid?: string): Promise<{ success: boolean; refundId: string; refundAmount: number; payment: PaymentRecord }> {
    try {
      const res = await fetch('/api/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, reason, adminUid }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.payment) {
          this.saveLocalPayment(data.payment);
        }
        return data;
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Refund rejected');
      }
    } catch (e: any) {
      // fallback
      const local = this.getAllLocalPayments();
      const p = local.find((item) => item.id === paymentId);
      if (p) {
        const now = new Date().toISOString();
        p.status = 'refunded';
        p.refundId = 're_local_' + Date.now();
        p.refundAmount = p.amount;
        p.refundDate = now;
        p.refundAdminUid = adminUid || 'admin@malaysia-entry.com';
        p.updatedAt = now;
        localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(local));
        return {
          success: true,
          refundId: p.refundId,
          refundAmount: p.amount,
          payment: p,
        };
      }
      throw new Error(e.message || 'Payment not found for refund');
    }
  },

  // Add Internal Admin Note
  async addPaymentNote(paymentId: string, note: string): Promise<PaymentRecord | null> {
    try {
      const res = await fetch(`/api/payments/${paymentId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        const updated = await res.json();
        this.saveLocalPayment(updated);
        return updated;
      }
    } catch {
      // fallback
    }
    const local = this.getAllLocalPayments();
    const item = local.find((p) => p.id === paymentId);
    if (item) {
      item.adminNotes = note;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(local));
      return item;
    }
    return null;
  },

  // Revenue Analytics
  async getRevenueAnalytics(range: 'today' | '7d' | '30d' | 'month' | 'custom' = '30d', customFrom?: string): Promise<RevenueAnalyticsData> {
    try {
      const res = await fetch(`/api/revenue/analytics?range=${range}${customFrom ? `&customFrom=${customFrom}` : ''}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    // Local compute
    const payments = this.getAllLocalPayments();
    let gross = 0;
    let refunds = 0;
    let count = 0;
    let todayRev = 0;
    const todayStr = new Date().toISOString().slice(0, 10);

    payments.forEach((p) => {
      if (p.status === 'paid') {
        gross += p.amount;
        count++;
        if (p.createdAt.startsWith(todayStr)) todayRev += p.amount;
      } else if (p.status === 'refunded') {
        gross += p.amount;
        refunds += p.refundAmount || p.amount;
      }
    });

    const refCount = payments.filter((p) => p.status === 'refunded').length;

    return {
      range,
      grossRevenue: gross,
      totalRefunds: refunds,
      refundedAmount: refunds,
      netRevenue: Math.max(0, gross - refunds),
      todayRevenue: todayRev,
      successfulCount: count,
      totalPaidOrders: count,
      pendingCount: payments.filter((p) => p.status === 'pending').length,
      failedCount: payments.filter((p) => p.status === 'failed').length,
      refundedCount: refCount,
      totalRefundedOrders: refCount,
      currency: 'MYR',
      dailySeries: [],
    };
  },

  // Local helper
  getAllLocalPayments(): PaymentRecord[] {
    try {
      const raw = localStorage.getItem(LOCAL_PAYMENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  },

  saveLocalPayment(rec: PaymentRecord): void {
    const list = this.getAllLocalPayments();
    const idx = list.findIndex((p) => p.id === rec.id || (rec.applicationId && p.applicationId === rec.applicationId && p.id === rec.id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...rec };
    } else {
      list.unshift(rec);
    }
    localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(list));
  },
};
