import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { Shield, Lock, FileText, AlertCircle, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';

interface PrivacyProps {
  onBack: () => void;
}

export const Privacy: React.FC<PrivacyProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Back Navigation */}
        <button
          type="button"
          id="privacy-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回上一页</span>
        </button>

        {/* Main Document Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2.5 text-blue-900 mb-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t.privacyTitle}
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {t.privacyLastUpdated} · Malaysia Entry Assistance 个人数据保护与合规声明
            </p>
          </div>

          {/* Section 1: Data Minimization & What We Collect */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              1. 我们收集哪些资料 (Data We Collect)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              为了向您提供入境申报信息整理与填写协助服务，我们仅收集您在表单中主动录入的必要文字信息：
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
              <li><strong>身份基本信息：</strong>姓名拼音（姓氏与名字）、出生日期、出生国籍、性别；</li>
              <li><strong>护照申报项：</strong>护照签发国、护照号码、签发日期与有效期至；</li>
              <li><strong>行程信息：</strong>抵马日期、预计离境日期、入境交通方式（航班号/口岸/航次）、旅行目的；</li>
              <li><strong>在马居留信息：</strong>预订酒店或住所名称、详细地址、城市及所在州属；</li>
              <li><strong>联络信息：</strong>电子邮箱地址、联系手机号码（含国家区号）。</li>
            </ul>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>严格的数据最小化承诺：</strong>本网站绝不收集您的护照原件扫描件、身份证原件照片、手持证件照、银行卡/支付卡密码或个人财务账户信息。
              </span>
            </div>
          </section>

          {/* Section 2: Why We Collect */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              2. 为什么收集这些资料 (Purpose of Collection)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              收集上述资料的唯一目的是：核对用户填写的入境信息是否完整、规范拼音格式、协助预先整理出境入境所需的申报材料，并在处理完成或发生异常时通过邮件或电话及时通知您。
            </p>
          </section>

          {/* Section 3: How We Use */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              3. 如何使用您的信息 (How It Is Used)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              您的个人资料仅由经过严格身份验证与保密协议授权的专职客服及审核专员在受保护的后台系统中处理。我们绝对不会将您的个人数据出售、出租或转让给任何商业广告公司或第三方营销机构。
            </p>
          </section>

          {/* Section 4: Retention */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              4. 资料保存期限 (Data Retention)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              您的入境协助申请资料默认在完成服务之日起保存 30 天，以便您在旅途中随时核对行程或联系客服补发信息。30 天后，系统将自动对敏感字段进行不可逆销毁或归档脱敏处理。
            </p>
          </section>

          {/* Section 5: Access Control */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              5. 谁可以访问数据 (Who Has Access)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              平台实行基于角色的严格访问控制（RBAC）：普通访客无法查询或遍历任何他人的申请；管理员访问后台敏感字段时默认处于脱敏遮蔽状态（如 G1234****），解除脱敏查看需要二次点击并自动记录于不可篡改的操作审计日志中。
            </p>
          </section>

          {/* Section 6: Security Protection */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              6. 我们如何保护您的数据 (Security Measures)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  TLS 256 位传输加密
                </span>
                <p className="text-slate-500">所有数据通道全程采用 HTTPS 强加密协议，防止中间人拦截窃听。</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  独立云端安全存储
                </span>
                <p className="text-slate-500">采用 Firestore 安全访问控制规则与权限隔离，杜绝越权访问。</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  全链路操作审计
                </span>
                <p className="text-slate-500">后台管理人员的每一次查看、修改或导出行为均记录不可更改的日志。</p>
              </div>
            </div>
          </section>

          {/* Section 7: User Right to Delete */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              7. 用户如何申请删除资料 (Right to Erasure)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              您享有个人数据的撤回与永久删除权。若您希望在服务完成后立即清除您的申请记录，可通过以下方式申请：
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-1">
              <p>发送申请至邮箱：<strong className="text-blue-600">privacy@malaysia-entry.com</strong></p>
              <p>邮件主题格式：【申请删除资料】+ 您的申请编号（如 MEA-20260909-000123）</p>
              <p className="text-slate-400">核对身份无误后，我们将在 24 个工作小时内完成物理删除并回信确认。</p>
            </div>
          </section>

          {/* Section 8: Third-Party Service Disclaimer */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              8. 第三方服务性质与非官方声明 (Third-Party Disclaimer)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Malaysia Entry Assistance 是一家完全独立运营的第三方咨询协助服务提供商。本平台不隶属于马来西亚政府、移民局或任何官方机构。我们收取的协助服务费用（如有）仅涵盖专业资料核查、格式转换与协助咨询成本，并不代表签证规费或官方保证。
            </p>
          </section>

          {/* Bottom Mandatory Box */}
          <div className="pt-6 border-t border-slate-200">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 text-xs sm:text-sm text-amber-950">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 mb-1">
                  “本网站为第三方旅行协助服务，并非马来西亚政府官方网站。”
                </p>
                <p className="text-amber-800/90 text-xs leading-relaxed">
                  旅客有权自行前往马来西亚移民局官方门户办理相关入境手续。选择本站服务即代表您委托我们为您提供预填报与格式规范协助。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
