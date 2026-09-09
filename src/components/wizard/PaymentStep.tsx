import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { ServicePlan, EntryApplication } from '../../types/application.ts';
import { paymentService, CheckoutResponse } from '../../services/paymentService.ts';
import {
  Lock,
  ShieldCheck,
  CreditCard,
  Building2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';

interface PaymentStepProps {
  applicationData: Partial<EntryApplication>;
  selectedPlan: ServicePlan;
  onPaymentSuccess: (paymentInfo: {
    paymentId: string;
    applicationId: string;
    amount: number;
    currency: string;
    paidAt: string;
    paymentMethod: string;
  }) => void;
  onPaymentFailed: (errorInfo: {
    reason: string;
    applicationId?: string;
    amount: number;
    currency: string;
  }) => void;
  onPrev: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  applicationData,
  selectedPlan,
  onPaymentSuccess,
  onPaymentFailed,
  onPrev,
}) => {
  const { t, language } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'fpx'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerConfig, setProviderConfig] = useState<{ isConfigured: boolean; mode: string }>({
    isConfigured: false,
    mode: 'test',
  });
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<CheckoutResponse | null>(null);

  // Applicant info
  const applicantName = `${applicationData.personalInfo?.surname || ''} ${applicationData.personalInfo?.givenName || ''}`.trim() || 'APPLICANT';
  const passportNumber = applicationData.passportInfo?.passportNumber || 'N/A';
  const applicantEmail = applicationData.contactInfo?.email || 'customer@example.com';
  const displayAppId = applicationData.applicationId || 'DRAFT-' + Date.now().toString().slice(-6);

  useEffect(() => {
    async function checkConfig() {
      const cfg = await paymentService.getConfig();
      setProviderConfig({ isConfigured: cfg.isConfigured, mode: cfg.mode });
    }
    checkConfig();
  }, []);

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Send planId and customer metadata to backend.
      // Notice: price is looked up AUTHORITATIVELY on server side!
      const checkout = await paymentService.createCheckoutSession({
        planId: selectedPlan.id,
        applicationId: displayAppId,
        customerName: applicantName,
        customerEmail: applicantEmail,
      });

      if (checkout.isConfigured && checkout.checkoutUrl) {
        // Redirect to official Stripe Checkout hosted page
        window.location.href = checkout.checkoutUrl;
        return;
      }

      // If Stripe secret key is not configured in current sandbox environment,
      // present safe simulation gateway
      setSandboxResponse(checkout);
      setShowSandboxModal(true);
    } catch (err: any) {
      setError(err.message || '创建支付会话失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  // Safe Sandbox test confirmation
  const handleConfirmSandbox = async (shouldFail = false) => {
    if (!sandboxResponse) return;
    setLoading(true);
    try {
      const res = await paymentService.confirmTestPayment({
        paymentId: sandboxResponse.paymentId,
        applicationId: displayAppId,
        paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card (Visa/Mastercard)' : 'FPX Online Banking',
        shouldFail,
      });

      setShowSandboxModal(false);

      if (res.success && res.status === 'paid') {
        onPaymentSuccess({
          paymentId: res.payment.id,
          applicationId: displayAppId,
          amount: res.payment.amount,
          currency: res.payment.currency,
          paidAt: res.payment.paidAt || new Date().toISOString(),
          paymentMethod: res.payment.paymentMethod,
        });
      } else {
        onPaymentFailed({
          reason: shouldFail ? '用户测试卡被发卡行拒绝交易 (Card declined: Insufficient funds)' : '支付未完成',
          applicationId: displayAppId,
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
        });
      }
    } catch (err: any) {
      setError(err.message || '模拟支付处理失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
          <Lock className="w-3.5 h-3.5 text-blue-700" />
          <span>256-Bit SSL 银行级安全加密通道</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t.paymentTitle || 'Malaysia Entry Card Assistance Fee (马来西亚入境卡协助服务费)'}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          {t.paymentSubtitle || '请核对您的申请信息与应付金额，并通过安全通道完成在线支付。'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">支付会话遇到问题</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Left Details & Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Application Details & Payment Method (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Applicant & Application Snapshot */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>申请人信息确认 (Applicant Summary)</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">申请人姓名 (Name)</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {applicantName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">护照号码 (Passport No.)</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block font-mono">
                  {passportNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">申请凭证编号 (Reference ID)</span>
                <span className="font-mono text-blue-800 font-semibold mt-0.5 block">
                  {displayAppId}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">通知邮箱 (Email)</span>
                <span className="text-slate-900 font-medium mt-0.5 block truncate">
                  {applicantEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              {language === 'zh' ? '选择支付渠道 (Select Payment Channel)' : 'Payment Method'}
            </h3>
            <div className="space-y-3">
              {/* Credit / Debit Card */}
              <label
                id="radio-pay-card"
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        Credit / Debit Card (信用卡 / 借记卡)
                      </div>
                      <div className="text-xs text-slate-500">
                        Visa, Mastercard, American Express, UnionPay (银联)
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">VISA</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">Mastercard</span>
                </div>
              </label>

              {/* FPX Online Banking */}
              <label
                id="radio-pay-fpx"
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'fpx'
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="fpx"
                    checked={paymentMethod === 'fpx'}
                    onChange={() => setPaymentMethod('fpx')}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        FPX Online Banking (马来西亚本地网银)
                      </div>
                      <div className="text-xs text-slate-500">
                        Maybank2u, CIMB Clicks, Public Bank, RHB, Hong Leong
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  MY Local
                </span>
              </label>
            </div>

            {/* Strict Security Reminder */}
            <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {t.paymentSecurityNote || '支付由安全支付网关处理。我们不会保存您的银行卡信息。'}
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  所有卡号输入、CVV 和安全验证均在国际 PCI-DSS Level 1 认证的加密环境中完成，本站服务器严禁留存任何卡片敏感凭据。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Fee Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="font-bold text-base text-slate-100">
                  {t.paymentSummary || '订单费用明细'}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-blue-300 rounded border border-slate-700">
                  {providerConfig.isConfigured ? 'Stripe Checkout' : 'Sandbox Gateway'}
                </span>
              </div>

              {/* Line items */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start text-slate-300">
                  <div>
                    <span className="font-medium text-white block">{selectedPlan.name}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 max-w-[200px]">
                      {selectedPlan.description}
                    </span>
                  </div>
                  <span className="font-semibold text-white text-sm">
                    {selectedPlan.currency} {selectedPlan.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>入境卡填报协助服务费 (Assistance Fee)</span>
                  <span>包含</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>国际支付网关通道费 (Gateway Fee)</span>
                  <span className="text-emerald-400">RM 0.00 (免费)</span>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">应付总金额 (Total Payable)</span>
                    <span className="text-[11px] text-slate-500">含税收与技术支持</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-blue-400 mr-1.5">{selectedPlan.currency}</span>
                    <span className="text-3xl font-black text-white">
                      {selectedPlan.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <div className="mt-6">
                <button
                  type="button"
                  id="btn-trigger-payment"
                  disabled={loading}
                  onClick={handleInitiatePayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.btnProcessingPayment || '正在连接安全网关...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        {t.btnPayNow || '立即安全付款'} · {selectedPlan.currency} {selectedPlan.price.toFixed(2)}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  PCI-DSS 认证
                </span>
                <span>•</span>
                <span>即时下发受理编号</span>
                <span>•</span>
                <span>退款保障</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <button
          type="button"
          id="btn-payment-prev"
          disabled={loading}
          onClick={onPrev}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
        >
          {t.btnPrev} (重选套餐)
        </button>
      </div>

      {/* ============================================================
          Safe Sandbox / Test Gateway Modal
          Allows testing success and failure flows reliably
          when live Stripe credentials are not bound to container.
         ============================================================ */}
      {showSandboxModal && sandboxResponse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  安全支付测试沙盒 (Sandbox Gateway)
                </h3>
                <p className="text-xs text-slate-500">
                  验证前后端订单支付、状态同步与异常处理
                </p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg space-y-1.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">申请凭证:</span>
                  <span className="font-mono font-semibold text-slate-900">{displayAppId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">服务套餐:</span>
                  <span className="font-medium text-slate-900">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">结算金额:</span>
                  <span className="font-bold text-blue-900 text-sm">
                    {selectedPlan.currency} {selectedPlan.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">支付渠道:</span>
                  <span className="text-slate-900">
                    {paymentMethod === 'card' ? 'Visa / Mastercard (Test)' : 'FPX Online Banking (Test)'}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-[11px]">
                提示：本环境处于开发与测试预览模式。点击下方按钮可分别模拟<b>支付成功</b>生成正式申请凭证，或模拟<b>银行卡扣款失败</b>测试重新支付流程。
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                id="btn-sandbox-success"
                disabled={loading}
                onClick={() => handleConfirmSandbox(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>模拟支付成功 (Simulate Payment Success)</span>
              </button>

              <button
                type="button"
                id="btn-sandbox-fail"
                disabled={loading}
                onClick={() => handleConfirmSandbox(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>模拟支付被拒/失败 (Simulate Card Declined)</span>
              </button>

              <button
                type="button"
                id="btn-sandbox-cancel"
                disabled={loading}
                onClick={() => setShowSandboxModal(false)}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
