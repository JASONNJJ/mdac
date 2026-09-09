import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import {
  FileText,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Lock,
  FileSpreadsheet,
} from 'lucide-react';

interface HomeProps {
  onStartApply: () => void;
  onCheckStatus: () => void;
  onViewPrivacy: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onStartApply,
  onCheckStatus,
  onViewPrivacy,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-100 bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Third-party Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200/80 text-blue-900 text-xs font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>{t.disclaimerShort}</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-950 tracking-tight leading-[1.15] max-w-3xl mx-auto">
            <span className="block text-slate-800">{t.heroTitleLine1}</span>
            <span className="block text-blue-900">{t.heroTitleLine2}</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Action CTA and Subtext */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-start-apply-btn"
              onClick={onStartApply}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>{t.heroCta}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="hero-check-status-btn"
              onClick={onCheckStatus}
              className="w-full sm:w-auto px-6 py-4 rounded-xl border border-slate-300 text-slate-700 hover:text-blue-900 hover:bg-slate-50 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>{t.heroCheckStatus}</span>
            </button>
          </div>

          {/* Required Notice Below Button */}
          <div className="mt-5 text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <span>第三方旅行协助服务</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-amber-700 font-semibold">并非马来西亚政府官方网站</span>
          </div>
        </div>
      </section>

      {/* Three Advantage Service Cards */}
      <section className="py-16 md:py-20 bg-slate-50/60 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-950 tracking-tight">
              贴心细致的入境申报协助体验
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              免去繁杂排查，协助您规范整理入境所需各项文字项目。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Advantage 1 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5 ring-1 ring-blue-100">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                1. {t.feat1Title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.feat1Desc}
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>中英双语即时核对指导</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>表单草稿自动实时保存</span>
                </li>
              </ul>
            </div>

            {/* Advantage 2 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 ring-1 ring-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                2. {t.feat2Title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.feat2Desc}
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>严格不收集护照或证件照片</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>敏感信息访问审计日志留存</span>
                </li>
              </ul>
            </div>

            {/* Advantage 3 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-5 ring-1 ring-indigo-100">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                3. {t.feat3Title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.feat3Desc}
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>工作人员人工核查格式疏漏</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>专属申请编号随时查询进度</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps Timeline Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-950 tracking-tight">
              清晰便捷的协助申报流程
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              只需大约 3-5 分钟，完成所有资料的准备与复核。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-base">填写基本资料</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                按照有效护照登记姓名、护照号码、签发有效期与国籍。
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-base">规划行程与住宿</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                补充抵马日期、交通方式、航班口岸及在马酒店或居所地址。
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-base">核对并安全提交</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                一键对比全部填写项，确认真实性与隐私条款后提交。
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h4 className="font-bold text-slate-900 text-base">获取专属编号</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                系统生成格式如 MEA-20260909-000123 专属编号，随时查询。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strict Privacy & Compliance Callout */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">
                全面隐私保护 · 拒绝过度索权
              </h3>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                我们尊重并保护您的个人隐私权。本平台严格遵循数据最小化原则，绝不收集护照照片、居民身份证扫描件、银行卡信息或登录密码等非必要敏感资料。
              </p>
            </div>
            <button
              id="home-view-privacy-btn"
              onClick={onViewPrivacy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shrink-0"
            >
              阅读完整隐私政策
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
