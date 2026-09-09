import { ServicePlan } from '../types/application.ts';

const LOCAL_PLANS_KEY = 'mea_service_plans_v1';

const DEFAULT_PLANS: ServicePlan[] = [
  {
    id: 'plan_standard',
    name: 'Standard Service (标准服务)',
    description: '基础入境卡信息核对、规范格式审查与全天候提交指导服务。',
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

export const planService = {
  // Get active plans for customer
  async getActivePlans(): Promise<ServicePlan[]> {
    try {
      const res = await fetch('/api/service-plans');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // fallback to local
    }
    return this.getLocalPlans().filter((p) => p.active);
  },

  // Get all plans (Admin)
  async getAllPlans(): Promise<ServicePlan[]> {
    try {
      const res = await fetch('/api/service-plans?all=true');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // fallback
    }
    return this.getLocalPlans();
  },

  // Get single plan by id
  async getPlanById(planId: string): Promise<ServicePlan | null> {
    const all = await this.getAllPlans();
    return all.find((p) => p.id === planId) || null;
  },

  // Create Plan (Admin)
  async createPlan(planData: Omit<ServicePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServicePlan> {
    try {
      const res = await fetch('/api/service-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const now = new Date().toISOString();
    const newPlan: ServicePlan = {
      ...planData,
      id: 'plan_' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    const local = this.getLocalPlans();
    local.push(newPlan);
    localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(local));
    return newPlan;
  },

  // Update Plan (Admin)
  async updatePlan(id: string, updates: Partial<ServicePlan>): Promise<ServicePlan | null> {
    try {
      const res = await fetch(`/api/service-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const local = this.getLocalPlans();
    const idx = local.findIndex((p) => p.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(local));
      return local[idx];
    }
    return null;
  },

  // Toggle active/inactive
  async togglePlan(id: string): Promise<ServicePlan | null> {
    try {
      const res = await fetch(`/api/service-plans/${id}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const local = this.getLocalPlans();
    const plan = local.find((p) => p.id === id);
    if (plan) {
      plan.active = !plan.active;
      plan.updatedAt = new Date().toISOString();
      localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(local));
      return plan;
    }
    return null;
  },

  async togglePlanActive(id: string, active?: boolean): Promise<ServicePlan | null> {
    if (active !== undefined) {
      return this.updatePlan(id, { active });
    }
    return this.togglePlan(id);
  },

  // Delete Plan
  async deletePlan(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/service-plans/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }

    const local = this.getLocalPlans().filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(local));
    return true;
  },

  getLocalPlans(): ServicePlan[] {
    try {
      const stored = localStorage.getItem(LOCAL_PLANS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(DEFAULT_PLANS));
    return DEFAULT_PLANS;
  },
};
