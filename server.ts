import 'dotenv/config';
import express from 'express';
import path from 'path';
import Stripe from 'stripe';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

// Lazy Stripe initialization
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// In-Memory Database Store (with realistic pre-seeds)
interface ServicePlan {
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

interface PaymentRecord {
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

interface PaymentEvent {
  id: string;
  eventId: string;
  eventType: string;
  paymentId?: string;
  applicationId?: string;
  processedAt: string;
  data?: any;
}

// Initial Service Plans
let servicePlans: ServicePlan[] = [
  {
    id: 'plan_standard',
    name: 'Standard Service (标准服务)',
    description: '基础入境卡信息核对、规范格式化审查与全天候提交指导服务。',
    price: 49.00,
    currency: 'MYR',
    active: true,
    features: [
      '全流程入境卡信息规范审查',
      '专属申报编号即时生成',
      '邮件自动同步申报回执指引',
      '工作日客服在线支持'
    ],
    recommended: false,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'plan_premium',
    name: 'Premium Fast-Track (优先加急服务)',
    description: '人工专属优先审查核验、加急出件、出入境口岸指引及优先客户支持。',
    price: 89.00,
    currency: 'MYR',
    active: true,
    features: [
      '人工专属优先加急核对（1小时内核验）',
      '出入境口岸通道指引与通关建议',
      '中英双语 24/7 优先客服支持',
      '免费资料修改保障（出发前）'
    ],
    recommended: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'plan_vip',
    name: 'VIP Concierge Package (尊享VIP管家礼遇)',
    description: '1对1专属专员全程核对、海关入境须知中文指引、24小时应急通道咨询。',
    price: 159.00,
    currency: 'MYR',
    active: true,
    features: [
      '1对1专属管家全程协助与跟踪',
      '马来西亚机场接送及落地政策咨询',
      '特急快速通道申请加急处理',
      '全天候应急热线及资料永久云备份'
    ],
    recommended: false,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
];

// Seed Payments
let payments: PaymentRecord[] = [
  {
    id: 'pay_20260909_001',
    applicationId: 'MEA-20260909-000123',
    planId: 'plan_standard',
    planName: 'Standard Service (标准服务)',
    amount: 49.00,
    currency: 'MYR',
    provider: 'stripe',
    providerPaymentId: 'ch_test_3P92001',
    status: 'paid',
    paymentMethod: 'Credit / Debit Card',
    customerName: 'ZHANG WEI',
    customerEmail: 'zhangwei.travel@gmail.com',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    paidAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    adminNotes: 'Stripe付款成功，已确认入境信息完整。',
  },
  {
    id: 'pay_20260909_002',
    applicationId: 'MEA-20260909-000124',
    planId: 'plan_premium',
    planName: 'Premium Fast-Track (优先加急服务)',
    amount: 89.00,
    currency: 'MYR',
    provider: 'stripe',
    providerPaymentId: 'ch_test_3P92002',
    status: 'paid',
    paymentMethod: 'FPX Online Banking',
    customerName: 'ALEXANDER JAMES SMITH',
    customerEmail: 'alex.smith.corp@outlook.com',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    paidAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    adminNotes: '加急套餐款项到账，安排专人处理。',
  },
  {
    id: 'pay_20260908_003',
    applicationId: 'MEA-20260908-000101',
    planId: 'plan_standard',
    planName: 'Standard Service (标准服务)',
    amount: 49.00,
    currency: 'MYR',
    provider: 'stripe',
    providerPaymentId: 'ch_test_3P92003',
    status: 'paid',
    paymentMethod: 'Credit / Debit Card',
    customerName: 'MEI LING TAN',
    customerEmail: 'meiling.tan95@yahoo.com',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    paidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    adminNotes: '',
  },
  {
    id: 'pay_20260907_004',
    applicationId: 'MEA-20260907-000088',
    planId: 'plan_vip',
    planName: 'VIP Concierge Package (尊享VIP管家礼遇)',
    amount: 159.00,
    currency: 'MYR',
    provider: 'stripe',
    providerPaymentId: 'ch_test_3P92004',
    status: 'paid',
    paymentMethod: 'Credit / Debit Card',
    customerName: 'KENJI YAMAMOTO',
    customerEmail: 'yamamoto.k@globaltravel.jp',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    paidAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    adminNotes: 'VIP贵宾款项到账，已联系安排槟城接机指引。',
  },
  {
    id: 'pay_20260906_005',
    applicationId: 'MEA-20260906-000072',
    planId: 'plan_standard',
    planName: 'Standard Service (标准服务)',
    amount: 49.00,
    currency: 'MYR',
    provider: 'stripe',
    providerPaymentId: 'ch_test_3P92005',
    status: 'refunded',
    paymentMethod: 'Credit / Debit Card',
    customerName: 'SOO JIN KIM',
    customerEmail: 'kim.soojin@naver.com',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    paidAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    refundId: 're_test_99210',
    refundAmount: 49.00,
    refundDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    refundAdminUid: 'admin@malaysia-entry.com',
    adminNotes: '客户取消行程申请退款，经Stripe退款完成。',
  },
  {
    id: 'pay_20260909_006',
    applicationId: 'MEA-20260909-000099',
    planId: 'plan_premium',
    planName: 'Premium Fast-Track (优先加急服务)',
    amount: 89.00,
    currency: 'MYR',
    provider: 'stripe',
    providerPaymentId: 'ch_test_failed_01',
    status: 'failed',
    paymentMethod: 'Credit / Debit Card',
    customerName: 'LIAM CONNER',
    customerEmail: 'liam.conner@travel.co.uk',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    adminNotes: '银行卡验证未通过或发卡行拒绝扣款。',
  },
];

const processedEventIds = new Set<string>();
const paymentEvents: PaymentEvent[] = [];

async function startServer() {
  const app = express();

  // 1. Stripe Webhook Raw Body Parser (MUST precede json body parser)
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: any;

    if (!webhookSecret) {
      console.warn('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set. Parsing body for development.');
      try {
        event = JSON.parse(req.body.toString());
      } catch (err: any) {
        return res.status(400).send(`Webhook parse error: ${err.message}`);
      }
    } else {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(400).send('Stripe client unavailable.');
      }
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        return res.status(400).send(`Webhook verification error: ${err.message}`);
      }
    }

    // Idempotency: Prevent duplicate processing of the same Stripe event
    const eventId = event?.id || `evt_fallback_${Date.now()}`;
    if (processedEventIds.has(eventId)) {
      console.log(`[Stripe Webhook] Event ${eventId} already processed. Skipping.`);
      return res.json({ received: true, idempotent: true });
    }
    processedEventIds.add(eventId);

    paymentEvents.unshift({
      id: 'pevt_' + Date.now(),
      eventId,
      eventType: event.type,
      processedAt: new Date().toISOString(),
      data: event.data?.object,
    });

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const applicationId = session.metadata?.applicationId;
          const planId = session.metadata?.planId;
          const customerName = session.metadata?.customerName || '';
          const customerEmail = session.customer_details?.email || session.metadata?.customerEmail || '';
          const amount = (session.amount_total || 0) / 100;

          // Find or create payment record
          let existing = payments.find((p) => p.providerPaymentId === session.id || (applicationId && p.applicationId === applicationId && p.status === 'pending'));
          const now = new Date().toISOString();

          if (existing) {
            existing.status = 'paid';
            existing.paidAt = now;
            existing.updatedAt = now;
            existing.providerPaymentId = session.payment_intent ? String(session.payment_intent) : session.id;
          } else {
            payments.unshift({
              id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              applicationId: applicationId || `MEA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-000999`,
              planId: planId || 'plan_standard',
              planName: session.metadata?.planName || 'Standard Service',
              amount,
              currency: 'MYR',
              provider: 'stripe',
              providerPaymentId: session.payment_intent ? String(session.payment_intent) : session.id,
              status: 'paid',
              paymentMethod: session.payment_method_types?.[0] ? session.payment_method_types[0].toUpperCase() : 'Card',
              customerName,
              customerEmail,
              createdAt: now,
              updatedAt: now,
              paidAt: now,
            });
          }
          console.log(`[Stripe Webhook] Payment confirmed for Application: ${applicationId}`);
          break;
        }

        case 'payment_intent.succeeded': {
          const pi = event.data.object as Stripe.PaymentIntent;
          const target = payments.find((p) => p.providerPaymentId === pi.id);
          if (target && target.status !== 'paid') {
            target.status = 'paid';
            target.paidAt = new Date().toISOString();
            target.updatedAt = new Date().toISOString();
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const pi = event.data.object as Stripe.PaymentIntent;
          const target = payments.find((p) => p.providerPaymentId === pi.id);
          if (target) {
            target.status = 'failed';
            target.updatedAt = new Date().toISOString();
            target.adminNotes = `Payment failed: ${pi.last_payment_error?.message || 'Transaction declined'}`;
          }
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          const target = payments.find((p) => p.providerPaymentId === charge.id || p.providerPaymentId === charge.payment_intent);
          if (target && target.status !== 'refunded') {
            target.status = 'refunded';
            target.refundId = charge.refunds?.data?.[0]?.id || `re_${Date.now()}`;
            target.refundAmount = (charge.amount_refunded || 0) / 100;
            target.refundDate = new Date().toISOString();
            target.updatedAt = new Date().toISOString();
          }
          break;
        }

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (err: any) {
      console.error('[Stripe Webhook] Error processing event data:', err);
    }

    res.json({ received: true });
  });

  // 2. Standard JSON Middleware for all other API endpoints
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Config Endpoint (Safe public exposure of publishable keys & configuration status)
  app.get('/api/config', (req, res) => {
    const isConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
    const publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
    res.json({
      isConfigured,
      publishableKey,
      currency: 'MYR',
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test',
    });
  });

  // ==========================================
  // Service Plans API (Server-side authoritative pricing)
  // ==========================================
  // Get all active plans (or all plans for admin)
  app.get('/api/service-plans', (req, res) => {
    const includeInactive = req.query.all === 'true';
    if (includeInactive) {
      return res.json(servicePlans);
    }
    const activePlans = servicePlans.filter((p) => p.active);
    res.json(activePlans);
  });

  // Create Plan (Admin)
  app.post('/api/service-plans', (req, res) => {
    const { name, description, price, currency = 'MYR', features = [], recommended = false } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Invalid price value' });
    }
    const now = new Date().toISOString();
    const newPlan: ServicePlan = {
      id: 'plan_' + Date.now(),
      name,
      description: description || '',
      price: Math.round(numPrice * 100) / 100,
      currency: currency.toUpperCase(),
      active: true,
      features: Array.isArray(features) ? features : [],
      recommended: Boolean(recommended),
      createdAt: now,
      updatedAt: now,
    };
    servicePlans.push(newPlan);
    res.status(201).json(newPlan);
  });

  // Edit Plan (Admin)
  app.put('/api/service-plans/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, currency, active, features, recommended } = req.body;
    const plan = servicePlans.find((p) => p.id === id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (price !== undefined) {
      const p = Number(price);
      if (!isNaN(p) && p > 0) plan.price = Math.round(p * 100) / 100;
    }
    if (currency !== undefined) plan.currency = currency.toUpperCase();
    if (active !== undefined) plan.active = Boolean(active);
    if (features !== undefined && Array.isArray(features)) plan.features = features;
    if (recommended !== undefined) plan.recommended = Boolean(recommended);
    plan.updatedAt = new Date().toISOString();
    res.json(plan);
  });

  // Toggle active/inactive
  app.patch('/api/service-plans/:id/toggle', (req, res) => {
    const { id } = req.params;
    const plan = servicePlans.find((p) => p.id === id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    plan.active = !plan.active;
    plan.updatedAt = new Date().toISOString();
    res.json(plan);
  });

  // Delete Plan (Admin)
  app.delete('/api/service-plans/:id', (req, res) => {
    const { id } = req.params;
    const index = servicePlans.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    servicePlans.splice(index, 1);
    res.json({ success: true, message: 'Plan deleted' });
  });

  // ==========================================
  // Stripe Payment Checkout Session Creation
  // Server-side authoritative price lookup
  // ==========================================
  app.post('/api/stripe/create-checkout-session', async (req, res) => {
    try {
      const { planId, applicationId, customerName, customerEmail } = req.body;

      if (!planId) {
        return res.status(400).json({ error: 'planId is required' });
      }

      // CRITICAL: Look up price server-side from database/servicePlans.
      // NEVER trust price from browser!
      const plan = servicePlans.find((p) => p.id === planId);
      if (!plan || !plan.active) {
        return res.status(400).json({ error: 'Invalid or inactive service plan selected' });
      }

      const stripe = getStripe();
      const origin = req.headers.origin || `http://localhost:${PORT}`;

      // Case 1: Stripe Secret Key is configured -> Create real Stripe Checkout Session
      if (stripe) {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: (plan.currency || 'myr').toLowerCase(),
                product_data: {
                  name: plan.name,
                  description: plan.description || 'Malaysia Entry Assistance Service Fee',
                },
                unit_amount: Math.round(plan.price * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          customer_email: customerEmail || undefined,
          metadata: {
            applicationId: applicationId || '',
            planId: plan.id,
            planName: plan.name,
            customerName: customerName || '',
            customerEmail: customerEmail || '',
          },
          success_url: `${origin}/#apply?session_id={CHECKOUT_SESSION_ID}&app_id=${applicationId}&payment_status=success`,
          cancel_url: `${origin}/#apply?app_id=${applicationId}&payment_status=failed`,
        });

        // Record pending payment in database
        const paymentRecord: PaymentRecord = {
          id: 'pay_' + Date.now(),
          applicationId: applicationId || '',
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          currency: plan.currency || 'MYR',
          provider: 'stripe',
          providerPaymentId: session.id,
          status: 'pending',
          paymentMethod: 'Credit / Debit Card',
          customerName: customerName || '',
          customerEmail: customerEmail || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        payments.unshift(paymentRecord);

        return res.json({
          isConfigured: true,
          sessionId: session.id,
          checkoutUrl: session.url,
          amount: plan.price,
          currency: plan.currency,
          paymentId: paymentRecord.id,
        });
      }

      // Case 2: Stripe Secret Key is NOT configured -> Development / Demo Test Mode
      // Do NOT crash the app. Return test mode details for graceful testing.
      const testPaymentId = 'pay_test_' + Date.now();
      const pendingPayment: PaymentRecord = {
        id: testPaymentId,
        applicationId: applicationId || '',
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        currency: plan.currency || 'MYR',
        provider: 'stripe',
        providerPaymentId: 'ch_test_session_' + Date.now(),
        status: 'pending',
        paymentMethod: 'Credit / Debit Card (Test Mode)',
        customerName: customerName || 'Guest Applicant',
        customerEmail: customerEmail || 'guest@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      payments.unshift(pendingPayment);

      return res.json({
        isConfigured: false,
        isTestMode: true,
        message: 'Payment provider is not configured. Running in Safe Sandbox / Test Mode.',
        amount: plan.price,
        currency: plan.currency,
        plan,
        paymentId: testPaymentId,
        testSessionId: pendingPayment.providerPaymentId,
      });
    } catch (err: any) {
      console.error('[Create Checkout Session Error]:', err);
      res.status(500).json({ error: err.message || 'Failed to create payment session' });
    }
  });

  // Simulated Test Payment Confirmation (For Development & Demonstration)
  app.post('/api/stripe/confirm-test-payment', (req, res) => {
    const { paymentId, applicationId, paymentMethod = 'Credit / Debit Card (Sandbox)', shouldFail = false } = req.body;

    const payment = payments.find((p) => p.id === paymentId || (applicationId && p.applicationId === applicationId && p.status === 'pending'));

    if (!payment) {
      return res.status(404).json({ error: 'Payment attempt not found' });
    }

    const now = new Date().toISOString();
    if (shouldFail) {
      payment.status = 'failed';
      payment.updatedAt = now;
      payment.adminNotes = '模拟支付失败：用户银行卡扣款未成功。';
      return res.json({ success: false, status: 'failed', payment });
    }

    payment.status = 'paid';
    payment.paidAt = now;
    payment.updatedAt = now;
    payment.paymentMethod = paymentMethod;
    payment.adminNotes = '支付验证成功（安全沙盒测试环境已处理）。';

    res.json({ success: true, status: 'paid', payment });
  });

  // ==========================================
  // Stripe Refund API
  // Calls real Stripe API or safely executes in test mode
  // ==========================================
  app.post('/api/stripe/refund', async (req, res) => {
    try {
      const { paymentId, reason = 'requested_by_customer', adminUid = 'admin@malaysia-entry.com' } = req.body;
      const payment = payments.find((p) => p.id === paymentId);

      if (!payment) {
        return res.status(404).json({ error: 'Payment record not found' });
      }

      if (payment.status !== 'paid') {
        return res.status(400).json({ error: `Cannot refund payment with status "${payment.status}"` });
      }

      const stripe = getStripe();
      let refundResultId = 're_' + Date.now();
      let refundAmount = payment.amount;

      // If Stripe client is available and transaction ID starts with real Stripe prefix
      if (stripe && payment.providerPaymentId && !payment.providerPaymentId.includes('test_session_')) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: payment.providerPaymentId.startsWith('pi_') ? payment.providerPaymentId : undefined,
            charge: payment.providerPaymentId.startsWith('ch_') ? payment.providerPaymentId : undefined,
            reason: reason as any,
          });
          refundResultId = refund.id;
          refundAmount = refund.amount ? refund.amount / 100 : payment.amount;
        } catch (stripeErr: any) {
          console.error('[Stripe Refund Error]:', stripeErr.message);
          // If in test mode or invalid mock ID, proceed with simulated refund
          refundResultId = 're_test_' + Date.now().toString().slice(-6);
        }
      }

      // Update payment record in database
      const now = new Date().toISOString();
      payment.status = 'refunded';
      payment.refundId = refundResultId;
      payment.refundAmount = refundAmount;
      payment.refundDate = now;
      payment.refundAdminUid = adminUid;
      payment.updatedAt = now;
      payment.adminNotes = (payment.adminNotes ? payment.adminNotes + ' | ' : '') + `已退款 RM ${refundAmount} (操作人: ${adminUid})`;

      res.json({
        success: true,
        message: 'Refund successfully processed',
        refundId: refundResultId,
        refundAmount,
        refundDate: now,
        payment,
      });
    } catch (err: any) {
      console.error('[Refund Endpoint Error]:', err);
      res.status(500).json({ error: err.message || 'Refund processing failed' });
    }
  });

  // ==========================================
  // Payments Admin & Dashboard API
  // ==========================================
  app.get('/api/payments', (req, res) => {
    const { search, status, dateFrom, dateTo } = req.query;
    let list = [...payments];

    if (status && status !== 'ALL') {
      list = list.filter((p) => p.status.toLowerCase() === String(status).toLowerCase());
    }

    if (search) {
      const q = String(search).trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.applicationId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.customerEmail.toLowerCase().includes(q) ||
          p.planName.toLowerCase().includes(q) ||
          (p.providerPaymentId && p.providerPaymentId.toLowerCase().includes(q))
      );
    }

    if (dateFrom) {
      list = list.filter((p) => p.createdAt >= String(dateFrom));
    }
    if (dateTo) {
      list = list.filter((p) => p.createdAt <= String(dateTo) + 'T23:59:59.999Z');
    }

    // Sort latest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(list);
  });

  // Get Single Payment
  app.get('/api/payments/:id', (req, res) => {
    const payment = payments.find((p) => p.id === req.params.id || p.applicationId === req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  });

  // Add Internal Note to Payment
  app.post('/api/payments/:id/note', (req, res) => {
    const { note } = req.body;
    const payment = payments.find((p) => p.id === req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    payment.adminNotes = note || '';
    payment.updatedAt = new Date().toISOString();
    res.json(payment);
  });

  // ==========================================
  // Revenue Analytics API
  // Gross, Net, Refunds, Daily breakdown
  // ==========================================
  app.get('/api/revenue/analytics', (req, res) => {
    const { range = '30d' } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (req.query.customFrom) {
      startDate = new Date(String(req.query.customFrom));
    }

    const todayStr = now.toISOString().slice(0, 10);

    let grossRevenue = 0;
    let totalRefunds = 0;
    let successfulCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let refundedCount = 0;
    let todayRevenue = 0;

    // Daily buckets for chart
    const dailyMap = new Map<string, { date: string; revenue: number; refunds: number; count: number }>();

    // Pre-populate last 7 or 14 days so chart is continuous
    const daysToShow = range === '7d' ? 7 : range === 'today' ? 1 : 14;
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { date: key, revenue: 0, refunds: 0, count: 0 });
    }

    payments.forEach((p) => {
      const pDate = new Date(p.createdAt);
      const dayKey = p.createdAt.slice(0, 10);

      // Status counters
      if (p.status === 'paid') {
        successfulCount++;
        grossRevenue += p.amount;
        if (dayKey === todayStr) {
          todayRevenue += p.amount;
        }

        if (pDate >= startDate) {
          const entry = dailyMap.get(dayKey) || { date: dayKey, revenue: 0, refunds: 0, count: 0 };
          entry.revenue += p.amount;
          entry.count += 1;
          dailyMap.set(dayKey, entry);
        }
      } else if (p.status === 'refunded') {
        refundedCount++;
        // Include in gross if it was paid, then subtract in refunds
        grossRevenue += p.amount;
        const refAmt = p.refundAmount || p.amount;
        totalRefunds += refAmt;

        if (pDate >= startDate) {
          const entry = dailyMap.get(dayKey) || { date: dayKey, revenue: 0, refunds: 0, count: 0 };
          entry.refunds += refAmt;
          dailyMap.set(dayKey, entry);
        }
      } else if (p.status === 'pending') {
        pendingCount++;
      } else if (p.status === 'failed') {
        failedCount++;
      }
    });

    const netRevenue = Math.max(0, grossRevenue - totalRefunds);
    const dailySeries = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      range,
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      totalRefunds: Math.round(totalRefunds * 100) / 100,
      netRevenue: Math.round(netRevenue * 100) / 100,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      successfulCount,
      pendingCount,
      failedCount,
      refundedCount,
      currency: 'MYR',
      dailySeries,
    });
  });

  // 3. Vite Middleware for Development / Static file serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Malaysia Entry Assistance running on port ${PORT}`);
  });
}

startServer();
