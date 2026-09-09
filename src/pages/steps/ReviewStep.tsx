import React, { useState } from 'react';
import {
  PersonalInfo,
  PassportInfo,
  TravelInfo,
  AccommodationInfo,
  ContactInfo,
} from '../../types/application.ts';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import {
  CheckCircle2,
  Edit3,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

interface Props {
  personalInfo: PersonalInfo;
  passportInfo: PassportInfo;
  travelInfo: TravelInfo;
  accommodation: AccommodationInfo;
  contactInfo: ContactInfo;
  isSubmitting: boolean;
  submitError: string | null;
  onEditStep: (step: number) => void;
  onSubmit: (confirmedTruth: boolean, agreedPrivacy: boolean) => void;
  onPrev: () => void;
}

export const ReviewStep: React.FC<Props> = ({
  personalInfo,
  passportInfo,
  travelInfo,
  accommodation,
  contactInfo,
  isSubmitting,
  submitError,
  onEditStep,
  onSubmit,
  onPrev,
}) => {
  const { t } = useLanguage();
  const [confirmedTruth, setConfirmedTruth] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmitClick = () => {
    if (!confirmedTruth || !agreedPrivacy) {
      setValidationError(t.agreeError);
      return;
    }
    setValidationError(null);
    onSubmit(confirmedTruth, agreedPrivacy);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xl">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <h2>{t.reviewTitle}</h2>
        </div>
        <p className="text-slate-500 text-sm mt-1">{t.reviewSubtitle}</p>
      </div>

      {/* Submission Error Alert */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">提交失败</p>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {/* Validation Error Alert */}
      {validationError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Review Section 1: Personal Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            {t.step1}: {t.personalTitle}
          </h3>
          <button
            type="button"
            id="edit-step-1"
            onClick={() => onEditStep(1)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t.btnEdit}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
          <div>
            <span className="text-slate-400 block">{t.fieldSurname}</span>
            <span className="font-semibold text-slate-800 text-sm">{personalInfo.surname || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldGivenName}</span>
            <span className="font-semibold text-slate-800 text-sm">{personalInfo.givenName || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldDob}</span>
            <span className="font-semibold text-slate-800">{personalInfo.dateOfBirth || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldGender}</span>
            <span className="font-semibold text-slate-800">{personalInfo.gender || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldNationality}</span>
            <span className="font-semibold text-slate-800">{personalInfo.nationality || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldBirthCountry}</span>
            <span className="font-semibold text-slate-800">{personalInfo.birthCountry || '-'}</span>
          </div>
        </div>
      </div>

      {/* Review Section 2: Passport Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            {t.step2}: {t.passportTitle}
          </h3>
          <button
            type="button"
            id="edit-step-2"
            onClick={() => onEditStep(2)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t.btnEdit}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-xs">
          <div>
            <span className="text-slate-400 block">{t.fieldPassportCountry}</span>
            <span className="font-semibold text-slate-800">{passportInfo.passportCountry || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldPassportNumber}</span>
            <span className="font-mono font-bold text-blue-900 text-sm tracking-wide">
              {passportInfo.passportNumber || '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldPassportIssueDate}</span>
            <span className="font-semibold text-slate-800">{passportInfo.issueDate || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldPassportExpiryDate}</span>
            <span className="font-semibold text-slate-800">{passportInfo.expiryDate || '-'}</span>
          </div>
        </div>
      </div>

      {/* Review Section 3: Travel Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            {t.step3}: {t.travelTitle}
          </h3>
          <button
            type="button"
            id="edit-step-3"
            onClick={() => onEditStep(3)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t.btnEdit}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
          <div>
            <span className="text-slate-400 block">{t.fieldArrivalDate}</span>
            <span className="font-semibold text-slate-800">{travelInfo.arrivalDate || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldDepartureDate}</span>
            <span className="font-semibold text-slate-800">{travelInfo.departureDate || '未指定'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldArrivalMethod}</span>
            <span className="font-semibold text-slate-800">{travelInfo.arrivalMethod || '-'}</span>
          </div>
          {travelInfo.arrivalMethod === 'Flight' && (
            <>
              <div>
                <span className="text-slate-400 block">{t.fieldFlightNumber}</span>
                <span className="font-mono font-bold text-slate-800">{travelInfo.flightNumber || '-'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">{t.fieldArrivalAirport}</span>
                <span className="font-semibold text-slate-800">{travelInfo.arrivalAirport || '-'}</span>
              </div>
            </>
          )}
          <div>
            <span className="text-slate-400 block">{t.fieldPurpose}</span>
            <span className="font-semibold text-slate-800">{travelInfo.purpose || '-'}</span>
          </div>
        </div>
      </div>

      {/* Review Section 4: Accommodation Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            {t.step4}: {t.accomTitle}
          </h3>
          <button
            type="button"
            id="edit-step-4"
            onClick={() => onEditStep(4)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t.btnEdit}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
          <div>
            <span className="text-slate-400 block">{t.fieldAccomType}</span>
            <span className="font-semibold text-slate-800">{accommodation.accommodationType || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldAccomName}</span>
            <span className="font-semibold text-slate-800">{accommodation.accommodationName || '-'}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400 block">{t.fieldAddress}</span>
            <span className="font-semibold text-slate-800 whitespace-pre-line">{accommodation.address || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldCity} / {t.fieldState}</span>
            <span className="font-semibold text-slate-800">{accommodation.city} · {accommodation.state}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldAccomPhone}</span>
            <span className="font-semibold text-slate-800">{accommodation.contactPhone || '无'}</span>
          </div>
        </div>
      </div>

      {/* Review Section 5: Contact Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            {t.step5}: {t.contactTitle}
          </h3>
          <button
            type="button"
            id="edit-step-5"
            onClick={() => onEditStep(5)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t.btnEdit}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
          <div>
            <span className="text-slate-400 block">{t.fieldEmail}</span>
            <span className="font-semibold text-slate-800">{contactInfo.email || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.fieldPhoneNumber}</span>
            <span className="font-semibold text-slate-800">
              {contactInfo.phoneCountryCode} {contactInfo.phoneNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Declarations Checkboxes */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3.5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            id="confirm-truth-checkbox"
            type="checkbox"
            checked={confirmedTruth}
            onChange={(e) => setConfirmedTruth(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span className="text-xs sm:text-sm text-slate-800 leading-snug select-none font-medium">
            {t.confirmTruth}
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            id="confirm-privacy-checkbox"
            type="checkbox"
            checked={agreedPrivacy}
            onChange={(e) => setAgreedPrivacy(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span className="text-xs sm:text-sm text-slate-800 leading-snug select-none font-medium">
            {t.confirmPrivacy}
          </span>
        </label>

        <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5 border-t border-slate-200/80">
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>数据通过端到端 TLS 256 位加密存储与传输，严格执行独立访问控制。</span>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          id="btn-review-prev"
          disabled={isSubmitting}
          onClick={onPrev}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition-all disabled:opacity-50"
        >
          {t.btnPrev}
        </button>
        <button
          type="button"
          id="btn-confirm-proceed-plans"
          disabled={isSubmitting}
          onClick={handleSubmitClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-sm hover:shadow transition-all active:scale-98 text-sm flex items-center gap-2 disabled:opacity-75 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.btnSubmitting}</span>
            </>
          ) : (
            <span>{t.btnNext}：{t.step6 || '选择服务套餐'}</span>
          )}
        </button>
      </div>
    </div>
  );
};
