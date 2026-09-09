import React, { useState, useEffect } from 'react';
import { EntryApplication } from '../types/application.ts';
import { storageService } from '../services/storageService.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Plane,
  FileText,
  CreditCard,
  Download,
} from 'lucide-react';

interface Props {
  initialAppId?: string;
  onApplyNew: () => void;
}

export const StatusCheck: React.FC<Props> = ({ initialAppId = '', onApplyNew }) => {
  const { t } = useLanguage();
  const [searchAppId, setSearchAppId] = useState(initialAppId);
  const [verifyKey, setVerifyKey] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [application, setApplication] = useState<EntryApplication | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialAppId) {
      setSearchAppId(initialAppId);
      // Auto trigger search if seeded
      handleSearch(initialAppId);
    }
  }, [initialAppId]);

  const handleSearch = async (overrideId?: string) => {
    const targetId = (overrideId || searchAppId).trim();
    if (!targetId) {
      setErrorMessage('请输入申请编号');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const found = await storageService.getByApplicationId(targetId);
      if (!found) {
        setApplication(null);
        setErrorMessage(t.statusNotFound);
      } else {
        // If verifyKey is provided, verify matching email or passport
        if (verifyKey.trim()) {
          const cleanKey = verifyKey.trim().toUpperCase();
          const matchEmail = found.contactInfo.email.toUpperCase() === cleanKey;
          const matchPassport = found.passportInfo.passportNumber.toUpperCase() === cleanKey;
          if (!matchEmail && !matchPassport) {
            setApplication(null);
            setErrorMessage('验证信息不匹配，请输入该申请关联的电子邮箱或护照号码。');
            setIsSearching(false);
            return;
          }
        }
        setApplication(found);
      }
    } catch {
      setErrorMessage('查询失败，请检查网络后重试。');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: EntryApplication['status']) => {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5" />
            <span>新提交 (New) - 待审核</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>处理中 (Processing) - 正在协助核对</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>已处理 (Completed) - 整理完毕</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <XCircle className="w-3.5 h-3.5" />
            <span>已取消 (Cancelled)</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-50 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
            {t.statusCheckTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            {t.statusCheckSubtitle}
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-8">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="query-appid"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                {t.labelAppId} <span className="text-red-500">*</span>
              </label>
              <input
                id="query-appid"
                type="text"
                value={searchAppId}
                placeholder={t.searchAppIdPlaceholder}
                onChange={(e) => setSearchAppId(e.target.value.toUpperCase().trim())}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all uppercase"
              />
            </div>

            <div>
              <label
                htmlFor="query-verifykey"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                验证信息 (填写的邮箱 或 护照号码)
              </label>
              <input
                id="query-verifykey"
                type="text"
                value={verifyKey}
                placeholder={t.searchVerifyPlaceholder}
                onChange={(e) => setVerifyKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                用于保护您的申报隐私。若留空，仅返回基础脱敏状态。
              </span>
            </div>

            <button
              id="query-status-btn"
              disabled={isSearching}
              onClick={() => handleSearch()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? '正在查询...' : t.btnQuery}</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 text-sm mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">查询结果提示</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Found Application Details */}
        {application && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-0">
            {/* Header Status Strip */}
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  申请编号
                </span>
                <span className="font-mono text-lg font-bold text-blue-950">
                  {application.applicationId}
                </span>
              </div>
              <div>{getStatusBadge(application.status)}</div>
            </div>

            {/* Information Grid */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">申请人姓名</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {application.personalInfo.surname} {application.personalInfo.givenName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">国籍 / 地区</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {application.personalInfo.nationality}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">护照号码 (已脱敏)</span>
                  <span className="font-mono font-bold text-slate-700 text-sm">
                    {storageService.maskPassport(application.passportInfo.passportNumber)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">入境日期</span>
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {application.travelInfo.arrivalDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">交通方式</span>
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-blue-600" />
                    {application.travelInfo.arrivalMethod}
                    {application.travelInfo.flightNumber && ` (${application.travelInfo.flightNumber})`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">提交时间</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {new Date(application.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Status & Service Plan Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      服务套餐与账单状态 (Payment & Service Plan)
                    </span>
                  </div>
                  <div>
                    {application.paymentStatus === 'paid' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        已完成付款 (Paid)
                      </span>
                    )}
                    {application.paymentStatus === 'refunded' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        已退款 (Refunded)
                      </span>
                    )}
                    {(!application.paymentStatus || application.paymentStatus === 'pending') && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                        <Clock className="w-3.5 h-3.5" />
                        待支付 (Pending)
                      </span>
                    )}
                    {application.paymentStatus === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3.5 h-3.5" />
                        扣款未成功 (Failed)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block">选订套餐方案:</span>
                    <span className="font-semibold text-slate-800">
                      {application.planName || 'Standard Service'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">服务费用:</span>
                    <span className="font-bold text-slate-900">
                      {application.currency || 'MYR'} {(application.amount || 49).toFixed(2)}
                    </span>
                  </div>
                  {application.paymentId && (
                    <div>
                      <span className="text-slate-400 block">Stripe 支付凭据号:</span>
                      <span className="font-mono text-slate-700 truncate block">
                        {application.paymentId}
                      </span>
                    </div>
                  )}
                </div>

                {application.paymentStatus === 'paid' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>打印 / 下载服务凭证收据 (Download Receipt)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Status Note Description */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
                <p className="font-semibold mb-1">服务进度说明：</p>
                {application.status === 'New' && (
                  <p>您的资料已安全进入服务队列，工作人员将为您核对字段完整度与格式要求。</p>
                )}
                {application.status === 'Processing' && (
                  <p>工作人员正在处理您的入境卡填写协助，请保持邮箱畅通以接收最终资料确认文件。</p>
                )}
                {application.status === 'Completed' && (
                  <p>您的申请协助已完成，相关填报建议与指引已通过电子邮箱发送，请查收。</p>
                )}
                {application.status === 'Cancelled' && (
                  <p>该申请已应用户要求或因不可抗力已取消。</p>
                )}
              </div>

              {/* Important Disclaimer Notice */}
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  重要说明：本状态反馈由 Malaysia Entry Assistance 第三方服务机构提供，并不代表马来西亚移民局官方审批或入境通关许可。旅客通关决定权由入境口岸移民局官员独立裁量。
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Apply Callout */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 mb-2">需要准备新的入境申请？</p>
          <button
            id="status-apply-new-btn"
            onClick={onApplyNew}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            + 立即填写新的申请表单
          </button>
        </div>
      </div>
    </div>
  );
};
