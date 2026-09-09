import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { AlertTriangle, RefreshCw, MessageSquare, ShieldAlert, ArrowLeft } from 'lucide-react';

interface PaymentFailedStepProps {
  reason: string;
  applicationId?: string;
  planName?: string;
  amount: number;
  currency: string;
  onTryAgain: () => void;
  onPrev: () => void;
}

export const PaymentFailedStep: React.FC<PaymentFailedStepProps> = ({
  reason,
  applicationId = 'DRAFT-TEMP',
  planName = 'Standard Service',
  amount,
  currency,
  onTryAgain,
  onPrev,
}) => {
  const { t, language } = useLanguage();
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      {/* Top Warning Icon & Title */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-xs ring-8 ring-rose-50">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.paymentFailedTitle || '支付未成功 (Payment Failed)'}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            {t.paymentFailedSubtitle || '您的银行卡未完成扣款。您可以重新尝试支付，无需重新填写申请资料。'}
          </p>
        </div>
      </div>

      {/* Failure Reason Card */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-xs text-rose-900">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-rose-950">未完成扣款原因 (Failure Reason):</span>
            <span className="font-medium mt-0.5 block">{reason || '银行卡扣款未被通过或用户取消交易。'}</span>
          </div>
        </div>

        {/* Retained application data note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">临时保存凭据:</span>
            <span className="font-mono font-semibold text-slate-800">{applicationId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">待结算套餐:</span>
            <span className="font-semibold text-slate-800">{planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">待结算金额:</span>
            <span className="font-bold text-slate-900">{currency} {amount.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 text-emerald-700 text-[11px] font-medium">
            ✓ 您的所有个人资料、护照及住宿信息已完整妥善保留，无需从头重新填写。
          </div>
        </div>

        <div className="text-slate-500 text-[11px] leading-relaxed">
          常见可能原因：发卡行开启了国际跨境支付限制、卡片可用额度不足、或者短信 3D-Secure 验证码超时。您可以更换其他信用卡或使用本地网银 (FPX) 重新尝试。
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          id="btn-try-again-payment"
          onClick={onTryAgain}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t.btnTryAgain || '重新支付 (Try Again)'}</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="btn-change-plan-or-info"
            onClick={onPrev}
            className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>更换套餐 / 核对资料</span>
          </button>

          <button
            type="button"
            id="btn-contact-support-failed"
            onClick={() => setShowSupportModal(true)}
            className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t.btnContactSupport || '联系客服协助'}</span>
          </button>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-2">支付协助支持</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              如遇多次扣款失败，我们可提供其他支付协助方式。请保留凭证号：
              <span className="font-mono font-bold text-blue-900 block mt-1">{applicationId}</span>
            </p>
            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
              <div>📧 <b>紧急客服：</b> billing@malaysia-entry.com</div>
              <div>💬 <b>在线客服：</b> 每日 08:00 - 23:00 在线</div>
            </div>
            <button
              type="button"
              id="btn-close-failed-support"
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
