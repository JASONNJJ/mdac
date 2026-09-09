import React, { useState, useEffect, useMemo } from 'react';
import { EntryApplication, PaymentRecord, PaymentStatus } from '../../types/application.ts';
import { storageService } from '../../services/storageService.ts';
import { paymentService, RevenueAnalytics } from '../../services/paymentService.ts';
import { auditService } from '../../services/auditService.ts';
import { authService } from '../../services/authService.ts';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const PaymentsManagement: React.FC = () => {
  const [applications, setApplications] = useState<EntryApplication[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Refund Modal state
  const [refundTarget, setRefundTarget] = useState<{
    applicationId: string;
    paymentId?: string;
    customerName: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [refundReason, setRefundReason] = useState('客户行程变动申请取消协助');
  const [refunding, setRefunding] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, payList, stats] = await Promise.all([
        storageService.getAllApplications(),
        paymentService.getAllPayments(),
        paymentService.getRevenueAnalytics(),
      ]);
      setApplications(apps);
      setPayments(payList);
      setAnalytics(stats);
    } catch (err: any) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Orders
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const currentStatus = app.paymentStatus || 'pending';
      const matchesStatus =
        statusFilter === 'ALL' || currentStatus.toLowerCase() === statusFilter.toLowerCase();

      const fullName = `${app.personalInfo.surname} ${app.personalInfo.givenName}`.toLowerCase();
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        app.applicationId.toLowerCase().includes(s) ||
        fullName.includes(s) ||
        (app.paymentId && app.paymentId.toLowerCase().includes(s)) ||
        (app.contactInfo?.email && app.contactInfo.email.toLowerCase().includes(s));

      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchTerm]);

  // Handle Refund Execution
  const handleExecuteRefund = async () => {
    if (!refundTarget) return;
    setRefunding(true);

    try {
      const targetPaymentId = refundTarget.paymentId || 'pay_' + refundTarget.applicationId;
      await paymentService.refundPayment(targetPaymentId, refundReason);

      // Update application in local persistence
      await storageService.updateApplicationAdmin(refundTarget.applicationId, {
        paymentStatus: 'refunded',
        status: 'cancelled',
      });

      // Audit trail log
      auditService.logAction(
        'REFUND_ORDER',
        refundTarget.applicationId,
        `退款处理: 订单 [${refundTarget.applicationId}] 金额: ${refundTarget.currency} ${refundTarget.amount.toFixed(2)}, 原因: ${refundReason}`,
        currentUser?.email || 'admin'
      );

      setActionSuccessToast(`订单 ${refundTarget.applicationId} 退款已成功执行并同步状态为 Refunded`);
      setRefundTarget(null);
      setTimeout(() => setActionSuccessToast(null), 4000);
      await loadData();
    } catch (err: any) {
      alert('退款处理异常: ' + (err.message || '未知错误'));
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{actionSuccessToast}</span>
        </div>
      )}

      {/* 1. Revenue Analytics Overview (财务统计) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              总营业额 (Gross Revenue)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {analytics?.currency || 'MYR'} {analytics?.grossRevenue.toFixed(2) || '0.00'}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">累计所有成功扣款订单</span>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              净入账 (Net Revenue)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700">
              {analytics?.currency || 'MYR'} {analytics?.netRevenue.toFixed(2) || '0.00'}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">总收入扣除已退款金额</span>
          </div>
        </div>

        {/* Total Paid Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              已付款订单 (Paid Orders)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {analytics?.totalPaidOrders || 0}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">成功支付并履约中</span>
          </div>
        </div>

        {/* Refunded Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              已退款订单 (Refunded)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-800">
              {analytics?.totalRefundedOrders || 0}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              退款总额: {analytics?.currency || 'MYR'} {analytics?.refundedAmount.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索申请编号、姓名、Stripe 凭据..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'paid', 'pending', 'refunded', 'failed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && '全部订单'}
              {st === 'paid' && '已付款 (Paid)'}
              {st === 'pending' && '待支付 (Pending)'}
              {st === 'refunded' && '已退款 (Refunded)'}
              {st === 'failed' && '未完成 (Failed)'}
            </button>
          ))}
          <button
            type="button"
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200"
            title="刷新数据"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Orders List Table (订单列表) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">客户姓名 (Customer)</th>
                <th className="py-3 px-4">支付状态 (Status)</th>
                <th className="py-3 px-4">支付金额 (Amount)</th>
                <th className="py-3 px-4">支付方式 (Method)</th>
                <th className="py-3 px-4">支付/创建时间 (Time)</th>
                <th className="py-3 px-4">Stripe Payment Intent / ID</th>
                <th className="py-3 px-4 text-right">操作 (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    暂无匹配的支付订单记录
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const status = app.paymentStatus || 'pending';
                  const customerName = `${app.personalInfo.surname} ${app.personalInfo.givenName}`.trim();
                  const amount = app.amount || (status === 'paid' ? 49 : 0);
                  const currency = app.currency || 'MYR';
                  const displayTime = app.paidAt
                    ? new Date(app.paidAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : new Date(app.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Application ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-900 block">
                          {app.applicationId}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {app.planName || 'Standard Service'}
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{customerName}</div>
                        <div className="text-[11px] text-slate-400">{app.contactInfo?.email}</div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-4">
                        {status === 'paid' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid (已支付)
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3 h-3" />
                            Pending (待付款)
                          </span>
                        )}
                        {status === 'refunded' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <RotateCcw className="w-3 h-3" />
                            Refunded (已退款)
                          </span>
                        )}
                        {status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Failed (扣款失败)
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 text-sm">
                          {currency} {amount.toFixed(2)}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4">
                        <span className="text-slate-600">
                          {status === 'paid' ? 'Credit Card / Visa' : '-'}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4">
                        <span className="text-slate-600 text-[11px]">{displayTime}</span>
                      </td>

                      {/* Stripe Payment Intent ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {app.paymentId || (status === 'paid' ? `pi_${app.applicationId.slice(-8)}` : '-')}
                        </span>
                      </td>

                      {/* Actions: Refund */}
                      <td className="py-3 px-4 text-right">
                        {status === 'paid' && (
                          <button
                            type="button"
                            id={`btn-refund-${app.applicationId}`}
                            onClick={() =>
                              setRefundTarget({
                                applicationId: app.applicationId,
                                paymentId: app.paymentId,
                                customerName,
                                amount,
                                currency,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                          >
                            Refund (退款)
                          </button>
                        )}
                        {status === 'refunded' && (
                          <span className="text-slate-400 text-[11px]">退款已完成</span>
                        )}
                        {status === 'pending' && (
                          <span className="text-slate-400 text-[11px]">等待客户支付</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      {refundTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  确认执行退款 (Execute Stripe Refund)
                </h3>
                <p className="text-xs text-slate-500">
                  调用支付网关 Refund API 将款项原路退还给用户
                </p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">申请编号:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {refundTarget.applicationId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">客户姓名:</span>
                  <span className="font-semibold text-slate-900">{refundTarget.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">退款金额:</span>
                  <span className="font-bold text-rose-700 text-sm">
                    {refundTarget.currency} {refundTarget.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  退款原因备注 (Refund Reason) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="例如: 客户行程变更申请取消协助"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  注意：退款成功后，系统将自动将该订单支付状态更新为 <b>Refunded</b>，并把申请进度标记为 <b>Cancelled</b>，操作过程将写入永久审计日志。
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={refunding}
                onClick={() => setRefundTarget(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 text-xs"
              >
                取消
              </button>
              <button
                type="button"
                id="btn-confirm-refund-action"
                disabled={refunding}
                onClick={handleExecuteRefund}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 text-xs cursor-pointer"
              >
                {refunding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>正在请求网关退款...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>确认全额退款</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
