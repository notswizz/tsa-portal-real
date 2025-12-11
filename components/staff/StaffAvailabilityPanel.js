export default function StaffAvailabilityPanel({
  shows,
  loadingShows,
  selectedShowId,
  dateOptions,
  selectedDates,
  availabilitySaving,
  availabilityError,
  availabilityHistory,
  hasSubmittedForSelectedShow,
  onShowChange,
  onToggleDate,
  onSubmit,
}) {
  const formatDateLabel = (value) => {
    if (!value || typeof value !== "string") return value;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatShortDate = (value) => {
    if (!value || typeof value !== "string") return value;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const selectedShow = shows.find((s) => s.id === selectedShowId);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sa-pinkLight to-pink-100 sm:h-11 sm:w-11 sm:rounded-xl">
            <svg className="h-4 w-4 text-sa-pink sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-sa-navy sm:text-lg">
              Share Your Availability
            </h2>
            <p className="mt-0.5 text-xs text-sa-slate sm:mt-1 sm:text-sm">
              Select a show and mark the days you can work.
            </p>
          </div>
        </div>
        
        {/* Help link - hidden on mobile */}
        <a
          href="mailto:lillian@thesmithagency.net"
          className="hidden items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-medium text-sa-slate ring-1 ring-slate-100 transition-all hover:bg-white hover:shadow-sm sm:inline-flex"
        >
          <svg className="h-4 w-4 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Need Help?
        </a>
      </div>

      {/* Show Selection Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Show Selector */}
        <div className="space-y-2">
          <label htmlFor="show" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sa-navy">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-sa-pink/10 text-[10px] font-bold text-sa-pink">
              1
            </span>
            Select Show
          </label>
          
          {loadingShows ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
              <svg className="h-5 w-5 animate-spin text-sa-pink" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-sa-slate">Loading shows...</span>
            </div>
          ) : shows.length === 0 ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-4 text-center">
              <svg className="mx-auto h-8 w-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm font-medium text-amber-800">No Active Shows</p>
              <p className="mt-1 text-xs text-amber-600">Check back soon for new opportunities.</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {shows.map((show) => {
                const isSelected = selectedShowId === show.id;
                const hasSubmitted = availabilityHistory.some(
                  (entry) => entry.showId === show.id
                );
                
                return (
                  <button
                    key={show.id}
                    type="button"
                    onClick={() => onShowChange(show.id)}
                    className={`relative rounded-lg border-2 p-3 text-left transition-all duration-200 sm:rounded-xl sm:p-4 ${
                      isSelected
                        ? "border-sa-pink bg-sa-pinkLight/50 ring-2 ring-sa-pink/20"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                    }`}
                  >
                    {hasSubmitted && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                    <p className={`text-sm font-medium sm:text-base ${isSelected ? "text-sa-pink" : "text-sa-navy"}`}>
                      {show.name || "Untitled show"}
                    </p>
                    {show.startDate && show.endDate && (
                      <p className="mt-0.5 text-[11px] text-sa-slate sm:mt-1 sm:text-xs">
                        {formatShortDate(show.startDate)} – {formatShortDate(show.endDate)}
                      </p>
                    )}
                    {show.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-sa-slate sm:mt-1 sm:text-xs">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {show.location}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Date Selection */}
        {selectedShowId && dateOptions.length > 0 && (
          <div className="animate-fade-in space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sa-navy">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-sa-pink/10 text-[10px] font-bold text-sa-pink">
                2
              </span>
              Select Available Dates
              <span className="ml-auto text-[10px] font-normal normal-case text-sa-slate">
                {selectedDates.length} of {dateOptions.length} selected
              </span>
            </label>

            {/* Quick actions */}
            {!hasSubmittedForSelectedShow && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    dateOptions.forEach((opt) => {
                      if (!selectedDates.includes(opt.value)) {
                        onToggleDate(opt.value);
                      }
                    });
                  }}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-sa-slate transition hover:bg-slate-200"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    selectedDates.forEach((d) => onToggleDate(d));
                  }}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-sa-slate transition hover:bg-slate-200"
                >
                  Clear All
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {dateOptions.map((option) => {
                const isChecked = selectedDates.includes(option.value);
                const isDisabled = hasSubmittedForSelectedShow;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && onToggleDate(option.value)}
                    className={`group relative flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left transition-all duration-200 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3 ${
                      isChecked
                        ? "border-sa-pink bg-sa-pinkLight/40"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    } ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  >
                    <span
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all sm:h-5 sm:w-5 sm:rounded-md ${
                        isChecked
                          ? "border-sa-pink bg-sa-pink"
                          : "border-slate-300 bg-white group-hover:border-sa-pink/50"
                      }`}
                    >
                      {isChecked && (
                        <svg className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className={`text-xs font-medium sm:text-sm ${isChecked ? "text-sa-pink" : "text-sa-navy"}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {selectedShowId && (
          <div className="pt-2">
            {hasSubmittedForSelectedShow ? (
              <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 ring-1 ring-green-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Availability Submitted</p>
                  <p className="text-xs text-green-600">
                    Need to make a change?{" "}
                    <a href="mailto:lillian@thesmithagency.net" className="font-medium underline">
                      Contact the office
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={availabilitySaving || selectedDates.length === 0}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sa-pink to-[#ff5fa8] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sa-pink/25 transition-all hover:shadow-xl hover:shadow-sa-pink/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {availabilitySaving ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Availability
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            )}

            {availabilityError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {availabilityError}
              </div>
            )}
          </div>
        )}
      </form>

      {/* Availability History */}
      {availabilityHistory.length > 0 && (
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sa-navy">
              <svg className="h-4 w-4 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Your Submissions
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-sa-slate">
              {availabilityHistory.length} show{availabilityHistory.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {availabilityHistory.map((entry) => {
              const dates = Array.isArray(entry.availableDates)
                ? entry.availableDates
                : Array.isArray(entry.dates)
                ? entry.dates
                : [];
              const show = shows.find((s) => s.id === entry.showId) || null;
              const title = show?.name || "Show availability";

              return (
                <div
                  key={entry.id}
                  className="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                        <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sa-navy">{title}</p>
                        <p className="text-xs text-sa-slate">
                          {dates.length} day{dates.length !== 1 ? "s" : ""} available
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {dates.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {dates.map((value) => (
                        <span
                          key={value}
                          className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-sa-navy ring-1 ring-slate-100"
                        >
                          {formatShortDate(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
