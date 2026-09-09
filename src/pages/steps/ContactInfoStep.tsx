import React from 'react';
import { ContactInfo } from '../../types/application.ts';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { Mail, AlertCircle, Info } from 'lucide-react';

interface Props {
  data: ContactInfo;
  errors: Record<string, string>;
  onChange: (field: keyof ContactInfo, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const COUNTRY_CODES = [
  { code: '+86', country: 'China (+86)' },
  { code: '+60', country: 'Malaysia (+60)' },
  { code: '+65', country: 'Singapore (+65)' },
  { code: '+66', country: 'Thailand (+66)' },
  { code: '+62', country: 'Indonesia (+62)' },
  { code: '+91', country: 'India (+91)' },
  { code: '+1', country: 'US / Canada (+1)' },
  { code: '+44', country: 'United Kingdom (+44)' },
  { code: '+81', country: 'Japan (+81)' },
  { code: '+82', country: 'South Korea (+82)' },
  { code: '+61', country: 'Australia (+61)' },
  { code: '+84', country: 'Vietnam (+84)' },
];

export const ContactInfoStep: React.FC<Props> = ({
  data,
  errors,
  onChange,
  onNext,
  onPrev,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xl">
          <Mail className="w-5 h-5 text-blue-600" />
          <h2>{t.contactTitle}</h2>
        </div>
        <p className="text-slate-500 text-sm mt-1">{t.contactSubtitle}</p>
      </div>

      <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span>{t.contactTip}</span>
      </div>

      <div className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldEmail} <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            placeholder="e.g. traveler@example.com"
            onChange={(e) => onChange('email', e.target.value.trim())}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone with Country Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            {t.fieldPhoneNumber} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              id="phoneCountryCode"
              value={data.phoneCountryCode}
              onChange={(e) => onChange('phoneCountryCode', e.target.value)}
              className="w-44 px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shrink-0"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.country}
                </option>
              ))}
            </select>
            <input
              id="phoneNumber"
              type="tel"
              value={data.phoneNumber}
              placeholder="e.g. 13800138000"
              onChange={(e) => onChange('phoneNumber', e.target.value.replace(/[^\d]/g, ''))}
              className={`flex-1 px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.phoneNumber
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
              }`}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.phoneNumber}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          id="btn-step5-prev"
          onClick={onPrev}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition-all"
        >
          {t.btnPrev}
        </button>
        <button
          type="button"
          id="btn-step5-next"
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-98 text-sm"
        >
          {t.btnNext}
        </button>
      </div>
    </div>
  );
};
