import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { Shield, Lock, FileCheck2, AlertCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Prominent Legal Notice Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 mb-10">
          <div className="flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p className="font-semibold text-white">
                {t.disclaimerBanner}
              </p>
              <p className="text-slate-400">
                Malaysia Entry Assistance 是一家独立的第三方旅行申报协助咨询机构，旨在帮助旅客整理、核验并安全递接入境申报所需的文字信息。本网站不提供签证签发、不保证口岸通关，亦与马来西亚移民局或政府各部无官方隶属关系。
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                MEA
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                Malaysia Entry Assistance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              为赴马旅行、商务、探亲及留学人员提供清晰严谨的入境卡信息申报协助。全流程采用 TLS 256 位加密存储与访问控制，保障数据隐私。
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                TLS 256 位传输加密
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-400" />
                免传证件原件保护
              </span>
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                审计合规
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              服务导航
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  id="footer-nav-home"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  {t.navHome}
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-apply"
                  onClick={() => onNavigate('apply')}
                  className="hover:text-white transition-colors"
                >
                  {t.navApply}
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-status"
                  onClick={() => onNavigate('status')}
                  className="hover:text-white transition-colors"
                >
                  {t.navStatus}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Admin */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              合规与支持
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  id="footer-nav-privacy"
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors"
                >
                  {t.navPrivacy}
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-admin"
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white transition-colors"
                >
                  {t.navAdmin} (管理员)
                </button>
              </li>
              <li className="pt-2 text-xs text-slate-500">
                服务咨询: support@malaysia-entry.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Malaysia Entry Assistance. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Independent Travel Information Preparation & Assistance Services
          </p>
        </div>
      </div>
    </footer>
  );
};
