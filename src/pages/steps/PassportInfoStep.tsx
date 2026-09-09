import React from 'react';
import { PassportInfo } from '../../types/application.ts';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { ShieldAlert, AlertCircle, FileCheck, Info } from 'lucide-react';

interface Props {
  data: PassportInfo;
  errors: Record<string, string>;
  onChange: (field: keyof PassportInfo, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PassportInfoStep: React.FC<Props> = ({
  data,
  errors,
  onChange,
  onNext,
  onPrev,
}) => {
  const { t } = useLanguage();

  const handlePassportNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto uppercase and remove surrounding spaces
    const cleanVal = e.target.value.toUpperCase().replace(/\s+/g, '');
    onChange('passportNumber', cleanVal);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xl">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <h2>{t.passportTitle}</h2>
        </div>
        <p className="text-slate-500 text-sm mt-1">{t.passportSubtitle}</p>
      </div>

      {/* Guidance and Privacy No-Photo Alert */}
      <div className="space-y-2">
        <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>{t.passportTip}</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 flex items-center gap-2 text-xs text-emerald-900">
          <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t.passportNoPhotoNotice}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Passport Country */}
        <div>
          <label
            htmlFor="passportCountry"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldPassportCountry} <span className="text-red-500">*</span>
          </label>
          <input
            id="passportCountry"
            type="text"
            value={data.passportCountry}
            placeholder="e.g. China / Singapore"
            onChange={(e) => onChange('passportCountry', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.passportCountry
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.passportCountry && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.passportCountry}
            </p>
          )}
        </div>

        {/* Passport Number */}
        <div>
          <label
            htmlFor="passportNumber"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldPassportNumber} <span className="text-red-500">*</span>
          </label>
          <input
            id="passportNumber"
            type="text"
            value={data.passportNumber}
            placeholder="e.g. G54289012"
            maxLength={18}
            onChange={handlePassportNumberChange}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 transition-all ${
              errors.passportNumber
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            自动转大写，包含英文字母与数字。
          </span>
          {errors.passportNumber && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.passportNumber}
            </p>
          )}
        </div>

        {/* Passport Issue Date */}
        <div>
          <label
            htmlFor="issueDate"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldPassportIssueDate} <span className="text-red-500">*</span>
          </label>
          <input
            id="issueDate"
            type="date"
            value={data.issueDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange('issueDate', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.issueDate
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.issueDate && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.issueDate}
            </p>
          )}
        </div>

        {/* Passport Expiry Date */}
        <div>
          <label
            htmlFor="expiryDate"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldPassportExpiryDate} <span className="text-red-500">*</span>
          </label>
          <input
            id="expiryDate"
            type="date"
            value={data.expiryDate}
            onChange={(e) => onChange('expiryDate', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.expiryDate
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.expiryDate && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.expiryDate}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          id="btn-step2-prev"
          onClick={onPrev}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition-all"
        >
          {t.btnPrev}
        </button>
        <button
          type="button"
          id="btn-step2-next"
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-98 text-sm"
        >
          {t.btnNext}
        </button>
      </div>
    </div>
  );
};
