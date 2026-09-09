import React from 'react';
import { AccommodationInfo, AccommodationType, ContactInfo } from '../../types/application.ts';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { Building2, AlertCircle, Mail } from 'lucide-react';

interface Props {
  data: AccommodationInfo;
  errors: Record<string, string>;
  onChange: (field: keyof AccommodationInfo, value: any) => void;
  contactData?: ContactInfo;
  contactErrors?: Record<string, string>;
  onContactChange?: (field: keyof ContactInfo, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const MALAYSIAN_STATES = [
  'Wilayah Persekutuan Kuala Lumpur',
  'Wilayah Persekutuan Putrajaya',
  'Wilayah Persekutuan Labuan',
  'Selangor',
  'Penang',
  'Johor',
  'Sabah',
  'Sarawak',
  'Melaka',
  'Perak',
  'Kedah',
  'Negeri Sembilan',
  'Pahang',
  'Terengannu',
  'Kelantan',
  'Perlis',
];

export const AccommodationStep: React.FC<Props> = ({
  data,
  errors,
  onChange,
  contactData,
  contactErrors = {} as Record<string, string>,
  onContactChange,
  onNext,
  onPrev,
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xl">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2>{t.accomTitle}</h2>
        </div>
        <p className="text-slate-500 text-sm mt-1">{t.accomSubtitle}</p>
      </div>

      <div className="space-y-5">
        {/* Accommodation Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            {t.fieldAccomType} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['Hotel', 'Apartment', 'Private Residence', 'Other'] as AccommodationType[]).map(
              (accType) => {
                const isSelected = data.accommodationType === accType;
                return (
                  <button
                    key={accType}
                    type="button"
                    id={`type-${accType.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onChange('accommodationType', accType)}
                    className={`py-3 px-3 rounded-xl border text-center text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {accType === 'Hotel' && t.typeHotel}
                    {accType === 'Apartment' && t.typeApartment}
                    {accType === 'Private Residence' && t.typePrivate}
                    {accType === 'Other' && t.typeOther}
                  </button>
                );
              }
            )}
          </div>
          {errors.accommodationType && (
            <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.accommodationType}
            </p>
          )}
        </div>

        {/* Accommodation Name */}
        <div>
          <label
            htmlFor="accommodationName"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldAccomName} <span className="text-red-500">*</span>
          </label>
          <input
            id="accommodationName"
            type="text"
            value={data.accommodationName}
            placeholder="e.g. Hilton Kuala Lumpur / Airbnb Residence"
            onChange={(e) => onChange('accommodationName', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.accommodationName
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.accommodationName && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.accommodationName}
            </p>
          )}
        </div>

        {/* Street Address (Multi-line) */}
        <div>
          <label
            htmlFor="address"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldAddress} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            rows={3}
            value={data.address}
            placeholder="e.g. 3, Jalan Stesen Sentral, Kuala Lumpur Sentral"
            onChange={(e) => onChange('address', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.address
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.address && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.address}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              {t.fieldCity} <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              type="text"
              value={data.city}
              placeholder="e.g. Kuala Lumpur"
              onChange={(e) => onChange('city', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.city
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
              }`}
            />
            {errors.city && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.city}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label
              htmlFor="state"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              {t.fieldState} <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              value={data.state}
              onChange={(e) => onChange('state', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.state
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
              }`}
            >
              <option value="">-- 请选择州属 / Select State --</option>
              {MALAYSIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.state}
              </p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label
              htmlFor="contactPhone"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              {t.fieldAccomPhone} (选填 / Optional)
            </label>
            <input
              id="contactPhone"
              type="text"
              value={data.contactPhone}
              placeholder="e.g. +60 3 2264 2264"
              onChange={(e) => onChange('contactPhone', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Integrated Applicant Contact Info Section */}
        {contactData && onContactChange && (
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'zh' ? '申报通知接收与联系方式 (Contact for Notifications)' : 'Contact Information'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              用于接收电子申报回执、状态更新提醒及服务协助。请确保邮箱输入准确。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-7">
                <label htmlFor="applicantEmail" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {t.fieldEmail} <span className="text-red-500">*</span>
                </label>
                <input
                  id="applicantEmail"
                  type="email"
                  value={contactData.email}
                  placeholder="e.g. yourname@example.com"
                  onChange={(e) => onContactChange('email', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                    contactErrors.email
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
                  }`}
                />
                {contactErrors.email && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {contactErrors.email}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="dialCode" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  区号
                </label>
                <input
                  id="dialCode"
                  type="text"
                  value={contactData.phoneCountryCode}
                  placeholder="+86"
                  onChange={(e) => onContactChange('phoneCountryCode', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="applicantPhone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  手机号码 <span className="text-red-500">*</span>
                </label>
                <input
                  id="applicantPhone"
                  type="tel"
                  value={contactData.phoneNumber}
                  placeholder="13800000000"
                  onChange={(e) => onContactChange('phoneNumber', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                    contactErrors.phoneNumber
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
                  }`}
                />
                {contactErrors.phoneNumber && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {contactErrors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          id="btn-step4-prev"
          onClick={onPrev}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition-all"
        >
          {t.btnPrev}
        </button>
        <button
          type="button"
          id="btn-step4-next"
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-98 text-sm"
        >
          {t.btnNext}
        </button>
      </div>
    </div>
  );
};
