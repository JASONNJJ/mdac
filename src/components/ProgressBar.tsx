import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps = 8,
  onStepClick,
}) => {
  const { t } = useLanguage();

  const stepLabels = [
    t.step1, // 个人信息
    t.step2, // 护照信息
    t.step3, // 旅行信息
    t.step4, // 住宿信息
    t.step5, // 确认资料
    t.step6, // 服务套餐
    t.step7, // 在线付款
    t.step8, // 完成申请
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 py-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Mobile Simplified Progress Indicator */}
        <div className="sm:hidden flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            步骤 {currentStep} / {totalSteps}
          </span>
          <span className="text-xs font-medium text-slate-700">
            {stepLabels[currentStep - 1]}
          </span>
        </div>

        {/* Linear progress bar on small devices */}
        <div className="sm:hidden w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Desktop Step Numbers and Titles */}
        <div className="hidden sm:flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
          {/* Active progress bar line */}
          <div
            className="absolute top-4 left-6 h-0.5 bg-blue-600 -z-0 transition-all duration-300"
            style={{
              width: `${((Math.min(currentStep, totalSteps) - 1) / (totalSteps - 1)) * 92}%`,
            }}
          />

          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isClickable = onStepClick && stepNumber < currentStep;

            return (
              <div
                key={label}
                className="flex flex-col items-center relative z-10"
              >
                <button
                  type="button"
                  id={`step-btn-${stepNumber}`}
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-50 cursor-pointer hover:bg-blue-700'
                      : isCurrent
                      ? 'bg-blue-900 text-white ring-4 ring-blue-100 shadow'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                  aria-label={`Step ${stepNumber}: ${label}`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </button>
                <span
                  className={`text-xs mt-2 font-medium tracking-tight whitespace-nowrap ${
                    isCurrent
                      ? 'text-blue-950 font-bold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
