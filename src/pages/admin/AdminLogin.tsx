import React, { useState } from 'react';
import { authService } from '../../services/authService.ts';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { Lock, Mail, AlertCircle, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onLoginSuccess, onBackToSite }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('admin@malaysia-entry.com');
  const [password, setPassword] = useState('Admin@2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || '登录失败，请核对账号密码。');
      }
    } catch {
      setError('系统连接失败，请检查网络后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-900 mb-6 mx-auto block transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回前台网站</span>
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-950 text-white flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6 text-blue-300" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.adminLoginTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {t.adminLoginSubtitle}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                {t.fieldAdminEmail}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                {t.fieldAdminPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all font-mono"
                />
              </div>
            </div>

            <button
              id="admin-submit-login"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>验证身份中...</span>
                </>
              ) : (
                <span>{t.btnLogin}</span>
              )}
            </button>
          </form>

          {/* Preset Demo credentials hint */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">管理员演示凭据已预置：</span>
              <span className="font-mono block text-[11px] mt-0.5 text-blue-800">
                邮箱: admin@malaysia-entry.com
              </span>
              <span className="font-mono block text-[11px] text-blue-800">
                密码: Admin@2026!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
