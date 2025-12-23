import { useState } from "react";

export default function StaffApplicationForm({
  phone,
  location,
  college,
  address,
  dressSize,
  shoeSize,
  instagram,
  experience,
  resumeFile,
  resumeUploading,
  existingResumeURL,
  headshotFile,
  headshotUploading,
  existingHeadshotURL,
  headshotPreview,
  saving,
  saveError,
  onChangePhone,
  onChangeLocation,
  onChangeCollege,
  onChangeAddress,
  onChangeDressSize,
  onChangeShoeSize,
  onChangeInstagram,
  onChangeExperience,
  onChangeResume,
  onChangeHeadshot,
  onSubmit,
}) {
  const [step, setStep] = useState(1); // 1, 2, or 3
  const [stepError, setStepError] = useState("");

  const inputClasses =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sa-navy placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20 hover:border-slate-300";

  const validateStep1 = () => {
    if (!phone.trim()) {
      setStepError("Please enter your phone number.");
      return false;
    }
    if (!location) {
      setStepError("Please select your primary location.");
      return false;
    }
    if (!address.trim()) {
      setStepError("Please enter your mailing address.");
      return false;
    }
    setStepError("");
    return true;
  };

  const validateStep2 = () => {
    if (!dressSize.trim()) {
      setStepError("Please enter your dress size.");
      return false;
    }
    if (!shoeSize.trim()) {
      setStepError("Please enter your shoe size.");
      return false;
    }
    setStepError("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStepError("");
    setStep(step - 1);
  };

  const stepTitles = [
    "Contact Info",
    "Sizing",
    "Experience"
  ];

  return (
    <div className="space-y-5">
      {/* Header section */}
      <div className="rounded-2xl bg-gradient-to-br from-sa-pinkLight via-pink-50 to-white p-5 ring-1 ring-sa-pink/10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-soft">
            <svg className="h-6 w-6 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sa-pink">
              Staff Application
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-sa-navy">
              {step === 1 && "Contact Information"}
              {step === 2 && "Sizing Information"}
              {step === 3 && "Experience & Social"}
            </h2>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s, idx) => (
          <div key={s} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => {
                if (s < step) setStep(s);
              }}
              disabled={s > step}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                s === step
                  ? "bg-sa-pink text-white shadow-md shadow-sa-pink/30"
                  : s < step
                  ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {s < step ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s
              )}
            </button>
            {idx < 2 && (
              <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                s < step ? "bg-green-500" : "bg-slate-100"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-between px-1 -mt-2">
        {stepTitles.map((title, idx) => (
          <span
            key={title}
            className={`text-[10px] font-medium uppercase tracking-wider ${
              idx + 1 === step ? "text-sa-pink" : idx + 1 < step ? "text-green-600" : "text-slate-400"
            }`}
          >
            {title}
          </span>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Step 1: Contact Information */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-medium text-sa-slate">
                  Phone Number <span className="text-sa-pink">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => onChangePhone(event.target.value)}
                    className={`${inputClasses} pl-11`}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="location" className="block text-xs font-medium text-sa-slate">
                  Primary Location <span className="text-sa-pink">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <select
                    id="location"
                    value={location}
                    onChange={(event) => onChangeLocation(event.target.value)}
                    className={`${inputClasses} pl-11 appearance-none`}
                  >
                    <option value="">Select your city</option>
                    <option value="ATL">Atlanta (ATL)</option>
                    <option value="LA">Los Angeles (LA)</option>
                    <option value="DAL">Dallas (DAL)</option>
                    <option value="NYC">New York (NYC)</option>
                    <option value="LV">Las Vegas (LV)</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="address" className="block text-xs font-medium text-sa-slate">
                  Mailing Address <span className="text-sa-pink">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(event) => onChangeAddress(event.target.value)}
                  className={inputClasses}
                  placeholder="Street, City, State, ZIP"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="college" className="block text-xs font-medium text-sa-slate">
                  College/University <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  id="college"
                  type="text"
                  value={college}
                  onChange={(event) => onChangeCollege(event.target.value)}
                  className={inputClasses}
                  placeholder="Where do/did you study?"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="group relative mt-4 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sa-pink to-[#ff5fa8] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sa-pink/25 transition-all duration-300 hover:shadow-xl hover:shadow-sa-pink/30"
            >
              Next: Sizing
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}

        {/* Step 2: Sizing Information */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-sa-slate">
              We need your sizing info to ensure you&apos;re matched with the right opportunities.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="dressSize" className="block text-xs font-medium text-sa-slate">
                  Dress Size <span className="text-sa-pink">*</span>
                </label>
                <input
                  id="dressSize"
                  type="text"
                  value={dressSize}
                  onChange={(event) => onChangeDressSize(event.target.value)}
                  className={inputClasses}
                  placeholder="e.g., S, M, L or 4, 6, 8"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="shoeSize" className="block text-xs font-medium text-sa-slate">
                  Shoe Size <span className="text-sa-pink">*</span>
                </label>
                <input
                  id="shoeSize"
                  type="text"
                  value={shoeSize}
                  onChange={(event) => onChangeShoeSize(event.target.value)}
                  className={inputClasses}
                  placeholder="e.g., 7, 8.5, 9"
                />
              </div>
            </div>

            {/* Headshot Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-sa-slate">
                Headshot Photo <span className="text-sa-pink">*</span>
              </label>
              <div className="relative">
                {(existingHeadshotURL || headshotPreview) && !headshotFile ? (
                  <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl ring-2 ring-emerald-200">
                      <img 
                        src={headshotPreview || existingHeadshotURL} 
                        alt="Your headshot" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-800">Headshot uploaded</p>
                      <p className="text-xs text-emerald-600">Click below to replace</p>
                      <label
                        htmlFor="headshot-replace"
                        className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-200"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Change Photo
                      </label>
                      <input
                        id="headshot-replace"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert("File size must be less than 5MB");
                              return;
                            }
                            onChangeHeadshot(file);
                          }
                        }}
                        className="sr-only"
                      />
                    </div>
                  </div>
                ) : headshotFile ? (
                  <div className="flex items-center gap-4 rounded-xl border border-sa-pink/30 bg-sa-pinkLight/30 p-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl ring-2 ring-sa-pink/30">
                      <img 
                        src={URL.createObjectURL(headshotFile)} 
                        alt="Preview" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sa-navy truncate">{headshotFile.name}</p>
                      <p className="text-xs text-sa-slate">{(headshotFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        type="button"
                        onClick={() => onChangeHeadshot(null)}
                        className="mt-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-sa-slate shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="headshot"
                    className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 transition-all hover:border-sa-pink/50 hover:bg-sa-pinkLight/20"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                      <svg className="h-8 w-8 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-sa-navy">Upload your headshot</p>
                      <p className="text-xs text-sa-slate">Professional photo, JPG or PNG up to 5MB</p>
                    </div>
                    <input
                      id="headshot"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size must be less than 5MB");
                            return;
                          }
                          onChangeHeadshot(file);
                        }
                      }}
                      className="sr-only"
                    />
                  </label>
                )}
                {headshotUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin text-sa-pink" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium text-sa-navy">Uploading...</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-sa-slate">
                <svg className="h-3.5 w-3.5 text-sa-pink/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This photo will be used for your profile across our platform.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-sa-navy shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="group relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sa-pink to-[#ff5fa8] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sa-pink/25 transition-all duration-300 hover:shadow-xl hover:shadow-sa-pink/30"
              >
                Next: Experience
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Social & Experience */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <label htmlFor="instagram" className="block text-xs font-medium text-sa-slate">
                Instagram Handle <span className="text-sa-pink">*</span>
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-4 text-sm font-medium text-sa-pink">
                  @
                </span>
                <input
                  id="instagram"
                  type="text"
                  placeholder="username"
                  required
                  value={instagram}
                  onChange={(event) => onChangeInstagram(event.target.value.replace(/^@/, ''))}
                  className={`${inputClasses} rounded-l-none`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="experience" className="block text-xs font-medium text-sa-slate">
                Retail / Wholesale Experience <span className="text-sa-pink">*</span>
              </label>
              <textarea
                id="experience"
                required
                rows={4}
                value={experience}
                onChange={(event) => onChangeExperience(event.target.value)}
                className={`${inputClasses} resize-none`}
                placeholder="Tell us about your background working in retail, wholesale, events, or similar roles..."
              />
              <p className="flex items-center gap-1.5 text-[11px] text-sa-slate">
                <svg className="h-3.5 w-3.5 text-sa-pink/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Include any relevant experience with fashion, showrooms, or customer service.
              </p>
            </div>

            {/* Resume Upload */}
            <div className="space-y-1.5">
              <label htmlFor="resume" className="block text-xs font-medium text-sa-slate">
                Resume <span className="text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                {existingResumeURL && !resumeFile ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-800">Resume uploaded</p>
                      <p className="text-xs text-emerald-600">Click below to replace</p>
                    </div>
                    <a 
                      href={existingResumeURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-200"
                    >
                      View
                    </a>
                  </div>
                ) : resumeFile ? (
                  <div className="flex items-center gap-3 rounded-xl border border-sa-pink/30 bg-sa-pinkLight/30 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sa-pink/10">
                      <svg className="h-5 w-5 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sa-navy truncate">{resumeFile.name}</p>
                      <p className="text-xs text-sa-slate">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChangeResume(null)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-sa-slate shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="resume"
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 transition-all hover:border-sa-pink/50 hover:bg-sa-pinkLight/20"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                      <svg className="h-6 w-6 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-sa-navy">Upload your resume</p>
                      <p className="text-xs text-sa-slate">PDF, DOC, or DOCX up to 5MB</p>
                    </div>
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size must be less than 5MB");
                            return;
                          }
                          onChangeResume(file);
                        }
                      }}
                      className="sr-only"
                    />
                  </label>
                )}
                {resumeUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin text-sa-pink" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium text-sa-navy">Uploading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-sa-navy shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="group relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sa-pink to-[#ff5fa8] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sa-pink/25 transition-all duration-300 hover:shadow-xl hover:shadow-sa-pink/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {(stepError || saveError) && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {stepError || saveError}
          </div>
        )}

        {/* Footer text - only on last step */}
        {step === 3 && (
          <p className="text-center text-[11px] text-sa-slate">
            By submitting, you agree to be contacted by The Smith Agency about work opportunities.
          </p>
        )}
      </form>
    </div>
  );
}
