import React from 'react';
import { PersonalInfo } from '../../types/application.ts';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { User, AlertCircle, Info } from 'lucide-react';

interface Props {
  data: PersonalInfo;
  errors: Record<string, string>;
  onChange: (field: keyof PersonalInfo, value: any) => void;
  onNext: () => void;
}

const NATIONALITY_OPTIONS = [
  'China',
  'Malaysia',
  'Singapore',
  'Indonesia',
  'Thailand',
  'Vietnam',
  'India',
  'United Kingdom',
  'United States',
  'Australia',
  'Japan',
  'South Korea',
  'Other',
];

export const PersonalInfoStep: React.FC<Props> = ({
  data,
  errors,
  onChange,
  onNext,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xl">
          <User className="w-5 h-5 text-blue-600" />
          <h2>{t.personalTitle}</h2>
        </div>
        <p className="text-slate-500 text-sm mt-1">{t.personalSubtitle}</p>
      </div>

      {/* Helpful Guidance Alert */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span>{t.namePassportTip}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Surname */}
        <div>
          <label
            htmlFor="surname"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldSurname} <span className="text-red-500">*</span>
          </label>
          <input
            id="surname"
            type="text"
            value={data.surname}
            placeholder="e.g. ZHANG"
            onChange={(e) => onChange('surname', e.target.value.toUpperCase())}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.surname
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.surname && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.surname}
            </p>
          )}
        </div>

        {/* Given Name */}
        <div>
          <label
            htmlFor="givenName"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldGivenName} <span className="text-red-500">*</span>
          </label>
          <input
            id="givenName"
            type="text"
            value={data.givenName}
            placeholder="e.g. WEI"
            onChange={(e) => onChange('givenName', e.target.value.toUpperCase())}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.givenName
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.givenName && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.givenName}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldDob} <span className="text-red-500">*</span>
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.dateOfBirth
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="gender"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldGender} <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            value={data.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.gender
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          >
            <option value="">-- 请选择 / Please Select --</option>
            <option value="Male">{t.genderMale}</option>
            <option value="Female">{t.genderFemale}</option>
            <option value="Other">{t.genderOther}</option>
          </select>
          {errors.gender && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.gender}
            </p>
          )}
        </div>

        {/* Nationality */}
        <div>
          <label
            htmlFor="nationality"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldNationality} <span className="text-red-500">*</span>
          </label>
          <select
            id="nationality"
            value={data.nationality}
            onChange={(e) => onChange('nationality', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.nationality
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          >
            <option value="">-- 请选择国籍 / Select Nationality --</option>
            {NATIONALITY_OPTIONS.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.nationality && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.nationality}
            </p>
          )}
        </div>

        {/* Country of Birth */}
        <div>
          <label
            htmlFor="birthCountry"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldBirthCountry} <span className="text-red-500">*</span>
          </label>
          <input
            id="birthCountry"
            type="text"
            value={data.birthCountry}
            placeholder="e.g. China"
            onChange={(e) => onChange('birthCountry', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.birthCountry
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.birthCountry && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.birthCountry}
            </p>
          )}
        </div>

        {/* City of Birth */}
        <div className="md:col-span-2">
          <label
            htmlFor="birthCity"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldBirthCity} (选填 / Optional)
          </label>
          <input
            id="birthCity"
            type="text"
            value={data.birthCity}
            placeholder="e.g. Shanghai / Beijing"
            onChange={(e) => onChange('birthCity', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Navigation button */}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="button"
          id="btn-step1-next"
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-98 text-sm"
        >
          {t.btnNext}
        </button>
      </div>
    </div>
  );
};
