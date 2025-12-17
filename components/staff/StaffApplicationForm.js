import AddressAutocomplete from "./AddressAutocomplete";

export default function StaffApplicationForm({
  phone,
  location,
  college,
  address,
  dressSize,
  shoeSize,
  instagram,
  experience,
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
  onSubmit,
}) {
  const inputClasses =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sa-navy placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20 hover:border-slate-300";

  return (
    <div className="space-y-6">
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
              Complete Your Profile
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-sa-slate">
              Share a few details so we can match you with the right opportunities. 
              Once submitted, our team will review and unlock your full staff dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sa-pink text-xs font-bold text-white shadow-sm">
          1
        </div>
        <div className="h-0.5 flex-1 rounded-full bg-slate-100">
          <div className="h-full w-1/3 rounded-full bg-sa-pink" />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-400">
          2
        </div>
        <div className="h-0.5 flex-1 rounded-full bg-slate-100" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-400">
          3
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Contact Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sa-pink/10 text-xs font-semibold text-sa-pink">
              1
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-sa-navy">
              Contact Information
            </h3>
          </div>
          
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
                  required
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
                  required
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
              <AddressAutocomplete
                id="address"
                required
                value={address}
                onChange={onChangeAddress}
                className={inputClasses}
                placeholder="Start typing your address..."
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
        </div>

        {/* Sizing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sa-pink/10 text-xs font-semibold text-sa-pink">
              2
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-sa-navy">
              Sizing Information
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="dressSize" className="block text-xs font-medium text-sa-slate">
                Dress Size <span className="text-sa-pink">*</span>
              </label>
              <input
                id="dressSize"
                type="text"
                required
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
                required
                value={shoeSize}
                onChange={(event) => onChangeShoeSize(event.target.value)}
                className={inputClasses}
                placeholder="e.g., 7, 8.5, 9"
              />
            </div>
          </div>
        </div>

        {/* Social & Experience Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sa-pink/10 text-xs font-semibold text-sa-pink">
              3
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-sa-navy">
              Social & Experience
            </h3>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="instagram" className="block text-xs font-medium text-sa-slate">
              Instagram Handle <span className="text-sa-pink">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </span>
              <input
                id="instagram"
                type="text"
                placeholder="@username"
                required
                value={instagram}
                onChange={(event) => onChangeInstagram(event.target.value)}
                className={`${inputClasses} pl-11`}
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
        </div>

        {/* Submit Section */}
        <div className="space-y-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sa-pink to-[#ff5fa8] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-sa-pink/25 transition-all duration-300 hover:shadow-xl hover:shadow-sa-pink/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting Application...
              </>
            ) : (
              <>
                Submit Application
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>

          {saveError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
              <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {saveError}
            </div>
          )}

          <p className="text-center text-[11px] text-sa-slate">
            By submitting, you agree to be contacted by The Smith Agency about work opportunities.
          </p>
        </div>
      </form>
    </div>
  );
}
