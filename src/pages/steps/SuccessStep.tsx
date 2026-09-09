import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { CheckCircle, Copy, Check, Search, Home, ShieldAlert } from 'lucide-react';

interface Props {
  applicationId: string;
  onCheckStatus: (appId: string) => void;
  onGoHome: () => void;
}

export const SuccessStep: React.FC<Props> = ({
  applicationId,
  onCheckStatus,
  onGoHome,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 text-center max-w-xl mx-auto space-y-6">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {t.successTitle}
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
          {t.successSubtitle}
        </p>
      </div>

      {/* Application ID Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          {t.labelAppId}
        </span>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-xl sm:text-2xl font-bold text-blue-950 tracking-wider">
            {applicationId}
          </span>
          <button
            type="button"
            id="copy-appid-btn"
            onClick={handleCopy}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 transition-colors"
            title="复制编号 / Copy ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-500">{t.successDesc}</p>
      </div>

      {/* Crucial Non-Government Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-left flex items-start gap-3 text-xs text-amber-950 leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-900 mb-0.5">服务性质重要说明</span>
          <span>{t.successNotice}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          id="success-check-status-btn"
          onClick={() => onCheckStatus(applicationId)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm transition-all"
        >
          <Search className="w-4 h-4" />
          <span>{t.btnCheckStatus}</span>
        </button>
        <button
          type="button"
          id="success-home-btn"
          onClick={onGoHome}
          className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>{t.btnBackHome}</span>
        </button>
      </div>
    </div>
  );
};
