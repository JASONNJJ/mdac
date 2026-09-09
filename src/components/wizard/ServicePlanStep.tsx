import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { ServicePlan } from '../../types/application.ts';
import { planService } from '../../services/planService.ts';
import { Check, ShieldCheck, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface ServicePlanStepProps {
  selectedPlanId?: string;
  onSelectPlan: (plan: ServicePlan) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ServicePlanStep: React.FC<ServicePlanStepProps> = ({
  selectedPlanId,
  onSelectPlan,
  onNext,
  onPrev,
}) => {
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      setLoading(true);
      try {
        const data = await planService.getActivePlans();
        setPlans(data);
        if (data.length > 0 && !selectedPlanId) {
          // Default to recommended or first active plan
          const recommended = data.find((p) => p.recommended) || data[0];
          onSelectPlan(recommended);
        }
      } catch (err: any) {
        setError('无法加载服务套餐，请刷新重试。');
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const handleChoose = (plan: ServicePlan) => {
    onSelectPlan(plan);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t.plansTitle || '选择服务套餐 (Select Service Plan)'}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          {t.plansSubtitle || '根据您的出行需求选择最合适的入境协助服务方案。所有价格透明，无隐藏收费。'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">正在加载实时服务套餐及官方定价...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                onClick={() => handleChoose(plan)}
                className={`relative rounded-xl transition-all cursor-pointer flex flex-col justify-between border-2 p-6 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    {language === 'zh' ? '推荐优选' : 'Recommended'}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="my-5 pb-5 border-b border-slate-100 flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-slate-500">{plan.currency}</span>
                    <span className="text-3xl font-black text-slate-900">
                      {plan.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400">/ {language === 'zh' ? '每位申请人' : 'per applicant'}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {(plan.features && plan.features.length > 0 ? plan.features : [
                      '入境申报资料合规格式化整理',
                      '专属协助编号生成与全天候状态查询',
                      '客服双语支持协助答疑',
                    ]).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Selection button */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    id={`btn-choose-${plan.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoose(plan);
                    }}
                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4" />
                        {language === 'zh' ? '已选择此套餐' : 'Plan Selected'}
                      </>
                    ) : (
                      language === 'zh' ? '选择此方案' : 'Select Plan'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust & Guarantee Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0" />
          <span>服务费保障：如因服务平台自身技术错误导致无法申报，承诺全额退款。</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>支持多币种国际信用卡与本地网络转账</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <button
          type="button"
          id="btn-plan-prev"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
        >
          {t.btnPrev}
        </button>
        <button
          type="button"
          id="btn-plan-next"
          disabled={!selectedPlanId}
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>{t.btnNext}：{t.step7}</span>
        </button>
      </div>
    </div>
  );
};
