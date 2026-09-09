import React, { useState, useEffect } from 'react';
import {
  PersonalInfo,
  PassportInfo,
  TravelInfo,
  AccommodationInfo,
  ContactInfo,
  ServicePlan,
  EntryApplication,
} from '../types/application.ts';
import { storageService } from '../services/storageService.ts';
import { planService } from '../services/planService.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { PersonalInfoStep } from './steps/PersonalInfoStep.tsx';
import { PassportInfoStep } from './steps/PassportInfoStep.tsx';
import { TravelInfoStep } from './steps/TravelInfoStep.tsx';
import { AccommodationStep } from './steps/AccommodationStep.tsx';
import { ReviewStep } from './steps/ReviewStep.tsx';
import { ServicePlanStep } from '../components/wizard/ServicePlanStep.tsx';
import { PaymentStep } from '../components/wizard/PaymentStep.tsx';
import { PaymentSuccessStep } from '../components/wizard/PaymentSuccessStep.tsx';
import { PaymentFailedStep } from '../components/wizard/PaymentFailedStep.tsx';
import { Save, AlertCircle } from 'lucide-react';

interface Props {
  onGoHome: () => void;
  onCheckStatus: (appId: string) => void;
}

const initialPersonalInfo: PersonalInfo = {
  surname: '',
  givenName: '',
  dateOfBirth: '',
  birthCity: '',
  birthCountry: '',
  gender: '',
  nationality: '',
};

const initialPassportInfo: PassportInfo = {
  passportCountry: '',
  passportNumber: '',
  issueDate: '',
  expiryDate: '',
};

const initialTravelInfo: TravelInfo = {
  arrivalDate: '',
  departureDate: '',
  arrivalMethod: 'Flight',
  flightNumber: '',
  arrivalAirport: '',
  lastEmbarkationCountry: '',
  purpose: 'Tourism',
};

const initialAccommodation: AccommodationInfo = {
  accommodationType: 'Hotel',
  accommodationName: '',
  address: '',
  city: '',
  state: '',
  contactPhone: '',
};

const initialContactInfo: ContactInfo = {
  email: '',
  phoneCountryCode: '+86',
  phoneNumber: '',
};

export const ApplicationWizard: React.FC<Props> = ({ onGoHome, onCheckStatus }) => {
  const { t } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initialPersonalInfo);
  const [passportInfo, setPassportInfo] = useState<PassportInfo>(initialPassportInfo);
  const [travelInfo, setTravelInfo] = useState<TravelInfo>(initialTravelInfo);
  const [accommodation, setAccommodation] = useState<AccommodationInfo>(initialAccommodation);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(initialContactInfo);

  // Selected Service Plan & Payment State
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [isPaymentFailed, setIsPaymentFailed] = useState(false);
  const [paymentFailureReason, setPaymentFailureReason] = useState<string>('');
  const [completedPayment, setCompletedPayment] = useState<{
    paymentId?: string;
    paidAt?: string;
    paymentMethod?: string;
    amount?: number;
    currency?: string;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedAppId, setCompletedAppId] = useState<string | null>(null);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Load draft on mount & check for Stripe return redirect query params
  useEffect(() => {
    // 1. Check URL parameters for return from Stripe checkout
    const url = new URL(window.location.href);
    const searchParams = url.searchParams || new URLSearchParams(window.location.hash.split('?')[1] || '');
    const paymentStatusParam = searchParams.get('payment_status');
    const returnedAppId = searchParams.get('app_id');

    if (paymentStatusParam === 'success' && returnedAppId) {
      setCompletedAppId(returnedAppId);
      setStep(8);
      // Update local storage if needed
      storageService.updateApplicationAdmin(returnedAppId, {
        paymentStatus: 'paid',
        status: 'processing',
      });
      return;
    } else if (paymentStatusParam === 'failed') {
      setIsPaymentFailed(true);
      setPaymentFailureReason('Stripe 支付页面已取消或扣款未完成');
      setStep(7);
      return;
    }

    // 2. Load draft if exists
    const draft = storageService.loadDraft();
    if (draft) {
      if (draft.personalInfo) setPersonalInfo(draft.personalInfo);
      if (draft.passportInfo) setPassportInfo(draft.passportInfo);
      if (draft.travelInfo) setTravelInfo(draft.travelInfo);
      if (draft.accommodation) setAccommodation(draft.accommodation);
      if (draft.contactInfo) setContactInfo(draft.contactInfo);
      if (draft.step && draft.step <= 6) setStep(draft.step);
    }

    // 3. Load default active plan
    planService.getActivePlans().then((plans) => {
      if (plans.length > 0) {
        const defaultPlan = plans.find((p) => p.recommended) || plans[0];
        setSelectedPlan(defaultPlan);
      }
    });
  }, []);

  // Auto-save draft on form changes
  useEffect(() => {
    if (step < 7) {
      storageService.saveDraft({
        step,
        personalInfo,
        passportInfo,
        travelInfo,
        accommodation,
        contactInfo,
      });
      setDraftSavedToast(true);
      const timer = setTimeout(() => setDraftSavedToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [step, personalInfo, passportInfo, travelInfo, accommodation, contactInfo]);

  // Validation routines
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!personalInfo.surname.trim()) errs.surname = t.valRequired;
    else if (!/^[A-Za-z\s\-'.]+$/.test(personalInfo.surname.trim())) {
      errs.surname = t.valNameCharacters;
    }

    if (!personalInfo.givenName.trim()) errs.givenName = t.valRequired;
    else if (!/^[A-Za-z\s\-'.]+$/.test(personalInfo.givenName.trim())) {
      errs.givenName = t.valNameCharacters;
    }

    if (!personalInfo.dateOfBirth) errs.dateOfBirth = t.valRequired;
    if (!personalInfo.gender) errs.gender = t.valRequired;
    if (!personalInfo.nationality) errs.nationality = t.valRequired;
    if (!personalInfo.birthCountry.trim()) errs.birthCountry = t.valRequired;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!passportInfo.passportCountry.trim()) errs.passportCountry = t.valRequired;
    if (!passportInfo.passportNumber.trim()) {
      errs.passportNumber = t.valRequired;
    } else if (passportInfo.passportNumber.trim().length < 5) {
      errs.passportNumber = t.valInvalidPassport;
    }

    if (!passportInfo.issueDate) errs.issueDate = t.valRequired;
    if (!passportInfo.expiryDate) {
      errs.expiryDate = t.valRequired;
    } else if (passportInfo.issueDate && passportInfo.expiryDate <= passportInfo.issueDate) {
      errs.expiryDate = t.valExpiryBeforeIssue;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!travelInfo.arrivalDate) errs.arrivalDate = t.valRequired;
    if (!travelInfo.arrivalMethod) errs.arrivalMethod = t.valRequired;
    if (!travelInfo.purpose) errs.purpose = t.valRequired;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!accommodation.accommodationType) errs.accommodationType = t.valRequired;
    if (!accommodation.accommodationName.trim()) errs.accommodationName = t.valRequired;
    if (!accommodation.address.trim()) errs.address = t.valRequired;
    if (!accommodation.city.trim()) errs.city = t.valRequired;
    if (!accommodation.state.trim()) errs.state = t.valRequired;

    if (!contactInfo.email.trim()) {
      errs.email = t.valRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email.trim())) {
      errs.email = t.valInvalidEmail;
    }

    if (!contactInfo.phoneNumber.trim()) {
      errs.phoneNumber = t.valRequired;
    } else if (!/^\d{6,15}$/.test(contactInfo.phoneNumber.trim())) {
      errs.phoneNumber = t.valPhoneDigits;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
    else if (step === 4 && validateStep4()) setStep(5);
    else if (step === 5) setStep(6);
    else if (step === 6 && selectedPlan) setStep(7);
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrors({});
    setIsPaymentFailed(false);
    if (step > 1) setStep(step - 1);
  };

  // Called from Step 5 (ReviewStep)
  const handleConfirmReview = () => {
    setStep(6); // Move to Select Service Plan
  };

  // Called when payment succeeds in Step 7
  const handlePaymentSuccess = async (paymentInfo: {
    paymentId: string;
    applicationId: string;
    amount: number;
    currency: string;
    paidAt: string;
    paymentMethod: string;
  }) => {
    setIsSubmitting(true);
    try {
      // Save application with payment details to persistent database
      const createdApp = await storageService.saveApplication({
        personalInfo,
        passportInfo,
        travelInfo,
        accommodation,
        contactInfo,
        confirmedTruth: true,
        agreedPrivacy: true,
        paymentStatus: 'paid',
        planId: selectedPlan?.id || 'standard',
        planName: selectedPlan?.name || 'Standard Service',
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        paymentId: paymentInfo.paymentId,
        paidAt: paymentInfo.paidAt,
        status: 'processing',
      });

      setCompletedAppId(createdApp.applicationId);
      setCompletedPayment({
        paymentId: paymentInfo.paymentId,
        paidAt: paymentInfo.paidAt,
        paymentMethod: paymentInfo.paymentMethod,
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
      });
      storageService.clearDraft();
      setIsPaymentFailed(false);
      setStep(8); // Proceed to success screen
    } catch (err: any) {
      setSubmitError('保存申请记录失败: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called when payment fails in Step 7
  const handlePaymentFailed = (errorInfo: {
    reason: string;
    applicationId?: string;
    amount: number;
    currency: string;
  }) => {
    setPaymentFailureReason(errorInfo.reason);
    setIsPaymentFailed(true);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-50 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Progress Bar Component */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden mb-6">
          <ProgressBar
            currentStep={step}
            totalSteps={8}
            onStepClick={(targetStep) => {
              if (targetStep < step && step < 8) {
                setIsPaymentFailed(false);
                setStep(targetStep);
              }
            }}
          />

          {/* Form Content Container */}
          <div className="p-5 sm:p-8">
            {/* Auto save badge */}
            {step < 8 && !isPaymentFailed && (
              <div className="flex justify-end mb-3">
                <div
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium transition-opacity duration-300 ${
                    draftSavedToast ? 'text-emerald-700 opacity-100' : 'text-slate-400 opacity-60'
                  }`}
                >
                  <Save className="w-3 h-3" />
                  <span>{t.btnSaveDraft}</span>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <PersonalInfoStep
                data={personalInfo}
                errors={errors}
                onChange={(f, v) => setPersonalInfo((prev) => ({ ...prev, [f]: v }))}
                onNext={handleNext}
              />
            )}

            {/* Step 2: Passport Info */}
            {step === 2 && (
              <PassportInfoStep
                data={passportInfo}
                errors={errors}
                onChange={(f, v) => setPassportInfo((prev) => ({ ...prev, [f]: v }))}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {/* Step 3: Travel Info */}
            {step === 3 && (
              <TravelInfoStep
                data={travelInfo}
                errors={errors}
                onChange={(f, v) => setTravelInfo((prev) => ({ ...prev, [f]: v }))}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {/* Step 4: Accommodation Info & Contact */}
            {step === 4 && (
              <AccommodationStep
                data={accommodation}
                errors={errors}
                onChange={(f, v) => setAccommodation((prev) => ({ ...prev, [f]: v }))}
                contactData={contactInfo}
                contactErrors={errors}
                onContactChange={(f, v) => setContactInfo((prev) => ({ ...prev, [f]: v }))}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {/* Step 5: Review & Confirmation */}
            {step === 5 && (
              <ReviewStep
                personalInfo={personalInfo}
                passportInfo={passportInfo}
                travelInfo={travelInfo}
                accommodation={accommodation}
                contactInfo={contactInfo}
                isSubmitting={isSubmitting}
                submitError={submitError}
                onEditStep={(targetStep) => setStep(targetStep)}
                onSubmit={handleConfirmReview}
                onPrev={handlePrev}
              />
            )}

            {/* Step 6: Select Service Plan */}
            {step === 6 && (
              <ServicePlanStep
                selectedPlanId={selectedPlan?.id}
                onSelectPlan={(plan) => setSelectedPlan(plan)}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {/* Step 7: Online Payment (or Payment Failed View) */}
            {step === 7 && selectedPlan && !isPaymentFailed && (
              <PaymentStep
                applicationData={{
                  personalInfo,
                  passportInfo,
                  travelInfo,
                  accommodation,
                  contactInfo,
                }}
                selectedPlan={selectedPlan}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
                onPrev={handlePrev}
              />
            )}

            {step === 7 && isPaymentFailed && (
              <PaymentFailedStep
                reason={paymentFailureReason}
                applicationId="MEA-PENDING"
                planName={selectedPlan?.name}
                amount={selectedPlan?.price || 0}
                currency={selectedPlan?.currency || 'MYR'}
                onTryAgain={() => setIsPaymentFailed(false)}
                onPrev={() => {
                  setIsPaymentFailed(false);
                  setStep(6);
                }}
              />
            )}

            {/* Step 8: Payment & Application Success Screen */}
            {step === 8 && completedAppId && (
              <PaymentSuccessStep
                applicationId={completedAppId}
                planName={selectedPlan?.name || 'Standard Service'}
                amount={completedPayment?.amount || selectedPlan?.price || 49}
                currency={completedPayment?.currency || selectedPlan?.currency || 'MYR'}
                paymentId={completedPayment?.paymentId}
                paymentMethod={completedPayment?.paymentMethod}
                paidAt={completedPayment?.paidAt}
                applicantName={`${personalInfo.surname} ${personalInfo.givenName}`.trim()}
                passportNumber={passportInfo.passportNumber}
                onViewApplication={() => onCheckStatus(completedAppId)}
                onHome={onGoHome}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
