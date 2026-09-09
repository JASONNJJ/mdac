import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { CheckCircle2, Download, ExternalLink, MessageSquare, Copy, Check, ShieldCheck, Printer } from 'lucide-react';

interface PaymentSuccessStepProps {
  applicationId: string;
  planName: string;
  amount: number;
  currency: string;
  paymentId?: string;
  paymentMethod?: string;
  paidAt?: string;
  applicantName?: string;
  passportNumber?: string;
  onViewApplication: () => void;
  onHome: () => void;
}

export const PaymentSuccessStep: React.FC<PaymentSuccessStepProps> = ({
  applicationId,
  planName,
  amount,
  currency,
  paymentId,
  paymentMethod = 'Credit / Debit Card',
  paidAt = new Date().toISOString(),
  applicantName = '',
  passportNumber = '',
  onViewApplication,
  onHome,
}) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const formattedDate = new Date(paidAt).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.paymentSuccessTitle || '支付成功 (Payment Successful)'}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            {t.paymentSuccessSubtitle || '我们已成功接收您的服务款项，专属入境协助编号已生成并开始处理。'}
          </p>
        </div>
      </div>

      {/* Official Receipt Card */}
      <div id="payment-receipt-card" className="bg-white border-2 border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        {/* Paid Stamp / Badge */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">服务凭据</span>
            <span className="text-sm font-bold text-slate-800">Malaysia Entry Assistance</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PAID · 已支付</span>
          </div>
        </div>

        {/* Application ID Highlight */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <span className="text-xs text-slate-500 block mb-1">
            {t.labelAppId || 'Application ID (申请识别码)'}
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-blue-950">
              {applicationId}
            </span>
            <button
              type="button"
              id="btn-copy-success-id"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              title="复制编号"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && <span className="text-[11px] text-emerald-600 font-medium">已复制到剪贴板！</span>}
        </div>

        {/* Breakdown Items */}
        <div className="space-y-3 text-xs border-b border-slate-100 pb-5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{t.labelServicePlan || '所选套餐 (Service Plan)'}:</span>
            <span className="font-semibold text-slate-900">{planName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{t.labelAmountPaid || '支付金额 (Amount Paid)'}:</span>
            <span className="font-bold text-slate-900 text-sm">{currency} {amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{t.labelPaymentStatus || '支付状态 (Payment Status)'}:</span>
            <span className="font-semibold text-emerald-700">Paid (已支付成功)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{t.labelPaymentDate || '支付时间 (Payment Date)'}:</span>
            <span className="text-slate-700 font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">{t.labelPaymentMethod || '支付方式 (Payment Method)'}:</span>
            <span className="text-slate-700">{paymentMethod}</span>
          </div>
          {paymentId && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{t.labelTransactionId || '交易参考号 (Transaction ID)'}:</span>
              <span className="text-slate-500 font-mono">{paymentId}</span>
            </div>
          )}
          {applicantName && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">申请人:</span>
              <span className="text-slate-700 font-medium">{applicantName}</span>
            </div>
          )}
          {passportNumber && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">护照号:</span>
              <span className="text-slate-700 font-mono">{passportNumber}</span>
            </div>
          )}
        </div>

        {/* Security Note & Third-Party Notice */}
        <div className="text-[11px] text-slate-500 leading-relaxed space-y-1">
          <p className="flex items-center gap-1.5 text-slate-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            第三方旅行协助服务说明：
          </p>
          <p>
            本平台为独立第三方协助服务机构，并非马来西亚政府官方网站。工作人员将依据您填写的入境信息展开格式审核并提供入境申报指导。请妥善保存您的 Application ID 以便随时查询状态。
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <button
          type="button"
          id="btn-view-app-success"
          onClick={onViewApplication}
          className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <ExternalLink className="w-4 h-4" />
          <span>{language === 'zh' ? '查看申请 (View Application)' : 'View Application'}</span>
        </button>

        <button
          type="button"
          id="btn-download-receipt"
          onClick={handlePrintReceipt}
          className="py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{t.btnDownloadReceipt || '下载收据 (Receipt)'}</span>
        </button>

        <button
          type="button"
          id="btn-contact-support-success"
          onClick={() => setShowSupportModal(true)}
          className="py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t.btnContactSupport || '联系客服 (Support)'}</span>
        </button>
      </div>

      <div className="text-center pt-2">
        <button
          type="button"
          id="btn-back-home-success"
          onClick={onHome}
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          {t.btnBackHome || '返回首页'}
        </button>
      </div>

      {/* Customer Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-2">在线客服与协助支持</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              如果您需要修改申报信息或咨询行程，请提供您的专属编号：
              <span className="font-mono font-bold text-blue-900 block mt-1">{applicationId}</span>
            </p>
            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
              <div>📧 <b>协助邮箱：</b> support@malaysia-entry.com</div>
              <div>🕒 <b>服务时间：</b> 周一至周日 08:00 - 23:00 (GMT+8)</div>
              <div>⚡ <b>处理时效：</b> 加急套餐 1 小时内响应</div>
            </div>
            <button
              type="button"
              id="btn-close-support-modal"
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
