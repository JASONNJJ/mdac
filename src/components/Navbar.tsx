import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { FileText, Globe, Menu, X, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Disclaimer Top Notification Ribbon */}
      <div className="bg-amber-50 text-amber-900 border-b border-amber-200/80 px-4 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{t.disclaimerBanner}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button
            id="nav-brand-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-800 transition-colors">
              <FileText className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base sm:text-lg block tracking-tight">
                {t.brandName}
              </span>
              <span className="text-xs text-slate-500 font-normal block -mt-0.5">
                {t.brandTagline}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              id="nav-link-home"
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              {t.navHome}
            </button>
            <button
              id="nav-link-status"
              onClick={() => onNavigate('status')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'status'
                  ? 'text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              {t.navStatus}
            </button>
            <button
              id="nav-link-privacy"
              onClick={() => onNavigate('privacy')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'privacy'
                  ? 'text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              {t.navPrivacy}
            </button>
            <button
              id="nav-link-admin"
              onClick={() => onNavigate('admin')}
              className={`text-sm font-medium transition-colors ${
                currentView.startsWith('admin')
                  ? 'text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              {t.navAdmin}
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                id="lang-toggle-zh"
                onClick={() => setLang('zh')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  lang === 'zh'
                    ? 'bg-white text-blue-950 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                中文
              </button>
              <button
                id="lang-toggle-en"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  lang === 'en'
                    ? 'bg-white text-blue-950 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>

            {/* Apply Button */}
            <button
              id="nav-apply-btn"
              onClick={() => onNavigate('apply')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-98"
            >
              {t.navApply}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="mobile-lang-btn"
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center text-xs font-medium gap-1"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? 'EN' : '中'}</span>
            </button>
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <button
            id="mobile-nav-home"
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-slate-700 hover:text-blue-900"
          >
            {t.navHome}
          </button>
          <button
            id="mobile-nav-status"
            onClick={() => {
              onNavigate('status');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-slate-700 hover:text-blue-900"
          >
            {t.navStatus}
          </button>
          <button
            id="mobile-nav-privacy"
            onClick={() => {
              onNavigate('privacy');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-slate-700 hover:text-blue-900"
          >
            {t.navPrivacy}
          </button>
          <button
            id="mobile-nav-admin"
            onClick={() => {
              onNavigate('admin');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-slate-700 hover:text-blue-900"
          >
            {t.navAdmin}
          </button>
          <div className="pt-2">
            <button
              id="mobile-apply-btn"
              onClick={() => {
                onNavigate('apply');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-center shadow-sm"
            >
              {t.navApply}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
