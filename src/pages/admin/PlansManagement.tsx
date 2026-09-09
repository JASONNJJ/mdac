import React, { useState, useEffect } from 'react';
import { ServicePlan } from '../../types/application.ts';
import { planService } from '../../services/planService.ts';
import { auditService } from '../../services/auditService.ts';
import { authService } from '../../services/authService.ts';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
  DollarSign,
  Save,
  X,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export const PlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 49,
    currency: 'MYR',
    active: true,
    recommended: false,
    featuresText: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await planService.getAllPlans();
      setPlans(data);
    } catch (err: any) {
      setError('无法获取服务套餐列表: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: 49,
      currency: 'MYR',
      active: true,
      recommended: false,
      featuresText: '入境卡填报指引与资料核对\n专属客服人工通道支持\n全天候申请状态追踪',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (plan: ServicePlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      active: plan.active,
      recommended: !!plan.recommended,
      featuresText: (plan.features || []).join('\n'),
    });
    setShowModal(true);
  };

  const handleToggleActive = async (plan: ServicePlan) => {
    try {
      const updated = await planService.togglePlanActive(plan.id, !plan.active);
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? updated : p)));
      auditService.logAction(
        'TOGGLE_SERVICE_PLAN',
        plan.id,
        `将套餐 [${plan.name}] 状态切换为: ${!plan.active ? '启用 (Active)' : '停用 (Disabled)'}`,
        currentUser?.email || 'admin'
      );
    } catch (err: any) {
      alert('切换状态失败: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await planService.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
      auditService.logAction(
        'DELETE_SERVICE_PLAN',
        id,
        `删除了服务套餐: [${name}] (ID: ${id})`,
        currentUser?.email || 'admin'
      );
    } catch (err: any) {
      alert('删除失败: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请填写套餐名称');
      return;
    }
    if (formData.price < 0) {
      alert('价格不能低于0');
      return;
    }

    setSaving(true);
    try {
      const features = formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      if (editingPlan) {
        const updated = await planService.updatePlan(editingPlan.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          currency: formData.currency,
          active: formData.active,
          recommended: formData.recommended,
          features,
        });
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? updated : p)));
        auditService.logAction(
          'EDIT_SERVICE_PLAN',
          editingPlan.id,
          `修改套餐 [${formData.name}] 定价与配置: RM ${formData.price}`,
          currentUser?.email || 'admin'
        );
      } else {
        const created = await planService.createPlan({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          currency: formData.currency,
          active: formData.active,
          recommended: formData.recommended,
          features,
        });
        setPlans((prev) => [...prev, created]);
        auditService.logAction(
          'CREATE_SERVICE_PLAN',
          created.id,
          `新建服务套餐 [${formData.name}]: RM ${formData.price}`,
          currentUser?.email || 'admin'
        );
      }
      setShowModal(false);
    } catch (err: any) {
      alert('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span>服务套餐定价与管理 (Service Plans)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            动态维护前台展示的服务协助收费方案。只有处于<b>已启用 (Active)</b> 状态的套餐才会开放给用户下单。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPlans}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="刷新"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            id="btn-create-new-plan"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>新建服务套餐 (Create Plan)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Plans Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">套餐名称 (Name)</th>
                <th className="py-3 px-4">定价 (Price)</th>
                <th className="py-3 px-4">前台状态 (Status)</th>
                <th className="py-3 px-4">特色亮点 (Features)</th>
                <th className="py-3 px-4 text-right">操作 (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    暂无服务套餐配置
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{plan.name}</span>
                            {plan.recommended && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> 推荐
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate">
                            {plan.description}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: {plan.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-black text-slate-900 text-sm">
                        {plan.currency} {plan.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {plan.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          已启用 (Active)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          <XCircle className="w-3 h-3" />
                          已停用 (Disabled)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 max-w-sm">
                        {(plan.features || []).slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="truncate">{feat}</li>
                        ))}
                        {(plan.features || []).length > 3 && (
                          <li className="text-slate-400">+{plan.features.length - 3} 项更多权益</li>
                        )}
                      </ul>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(plan)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          plan.active
                            ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50 border-slate-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                        }`}
                        title={plan.active ? '停用此套餐' : '启用此套餐'}
                      >
                        {plan.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(plan)}
                        className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors"
                        title="编辑套餐"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(plan.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="删除套餐"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-2">确认删除套餐？</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              删除后该方案将从数据库永久移除，前台将无法再选择。现有已付订单的历史记录不受影响。
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = plans.find((p) => p.id === deleteConfirmId);
                  if (target) handleDelete(target.id, target.name);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingPlan ? '编辑服务套餐' : '新建服务套餐'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  套餐名称 (Plan Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  placeholder="e.g. Standard Assistance / 加急优先审核套餐"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  简要描述 (Description)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  placeholder="e.g. 标准申报协助，24小时内处理完成"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    收费价格 (Price) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    币种 (Currency)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.currency}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  服务权益列表 (Features - 每行一项)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  placeholder="例如：
入境卡申报指引
双语人工客服协助
专属处理时效保障"
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 font-sans"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">在前台开放销售 (Active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.recommended}
                    onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">推荐优选标签</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? '保存中...' : '确认保存'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
