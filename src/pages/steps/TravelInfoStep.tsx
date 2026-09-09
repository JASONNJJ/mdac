import React from 'react';
import { TravelInfo, ArrivalMethod, TravelPurpose } from '../../types/application.ts';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import { Plane, AlertCircle, Calendar } from 'lucide-react';

interface Props {
  data: TravelInfo;
  errors: Record<string, string>;
  onChange: (field: keyof TravelInfo, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const AIRPORTS = [
  'Kuala Lumpur International Airport (KLIA)',
  'Kuala Lumpur International Airport 2',
  'Penang International Airport',
  'Langkawi International Airport',
  'Johor Bahru / Senai International Airport',
  'Kota Kinabalu International Airport',
  'Other',
];

export const TravelInfoStep: React.FC<Props> = ({
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
          <Plane className="w-5 h-5 text-blue-600" />
          <h2>{t.travelTitle}</h2>
        </div>
        <p className="text-slate-500 text-sm mt-1">{t.travelSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Arrival Date */}
        <div>
          <label
            htmlFor="arrivalDate"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldArrivalDate} <span className="text-red-500">*</span>
          </label>
          <input
            id="arrivalDate"
            type="date"
            value={data.arrivalDate}
            onChange={(e) => onChange('arrivalDate', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.arrivalDate
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          />
          {errors.arrivalDate && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.arrivalDate}
            </p>
          )}
        </div>

        {/* Departure Date */}
        <div>
          <label
            htmlFor="departureDate"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldDepartureDate}
          </label>
          <input
            id="departureDate"
            type="date"
            value={data.departureDate}
            min={data.arrivalDate || undefined}
            onChange={(e) => onChange('departureDate', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Arrival Method */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            {t.fieldArrivalMethod} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['Flight', 'Land', 'Sea'] as ArrivalMethod[]).map((method) => {
              const isSelected = data.arrivalMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  id={`method-${method.toLowerCase()}`}
                  onClick={() => onChange('arrivalMethod', method)}
                  className={`py-3 px-4 rounded-xl border text-center text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {method === 'Flight' && t.methodFlight}
                  {method === 'Land' && t.methodLand}
                  {method === 'Sea' && t.methodSea}
                </button>
              );
            })}
          </div>
          {errors.arrivalMethod && (
            <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.arrivalMethod}
            </p>
          )}
        </div>

        {/* Flight Specific Info */}
        {data.arrivalMethod === 'Flight' && (
          <>
            <div>
              <label
                htmlFor="flightNumber"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                {t.fieldFlightNumber} (例如 / e.g. MH361 / AK512)
              </label>
              <input
                id="flightNumber"
                type="text"
                value={data.flightNumber}
                placeholder="e.g. MH361"
                onChange={(e) => onChange('flightNumber', e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="arrivalAirport"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                {t.fieldArrivalAirport}
              </label>
              <select
                id="arrivalAirport"
                value={data.arrivalAirport}
                onChange={(e) => onChange('arrivalAirport', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
              >
                <option value="">-- 请选择机场 / Select Airport --</option>
                {AIRPORTS.map((airport) => (
                  <option key={airport} value={airport}>
                    {airport}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Last Embarkation Country */}
        <div>
          <label
            htmlFor="lastEmbarkationCountry"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldLastEmbarkation} (选填 / Optional)
          </label>
          <input
            id="lastEmbarkationCountry"
            type="text"
            value={data.lastEmbarkationCountry}
            placeholder="e.g. China / Singapore"
            onChange={(e) => onChange('lastEmbarkationCountry', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Travel Purpose */}
        <div>
          <label
            htmlFor="travelPurpose"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            {t.fieldPurpose} <span className="text-red-500">*</span>
          </label>
          <select
            id="travelPurpose"
            value={data.purpose}
            onChange={(e) => onChange('purpose', e.target.value as TravelPurpose)}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.purpose
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
            }`}
          >
            <option value="">-- 请选择目的 / Select Purpose --</option>
            <option value="Tourism">{t.purposeTourism}</option>
            <option value="Business">{t.purposeBusiness}</option>
            <option value="Visiting Friends / Family">{t.purposeVisiting}</option>
            <option value="Education">{t.purposeEducation}</option>
            <option value="Other">{t.purposeOther}</option>
          </select>
          {errors.purpose && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.purpose}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          id="btn-step3-prev"
          onClick={onPrev}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition-all"
        >
          {t.btnPrev}
        </button>
        <button
          type="button"
          id="btn-step3-next"
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-98 text-sm"
        >
          {t.btnNext}
        </button>
      </div>
    </div>
  );
};
