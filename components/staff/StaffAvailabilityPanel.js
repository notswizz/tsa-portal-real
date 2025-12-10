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
    // Expecting YYYY-MM-DD
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
          Share your availability
        </p>
        <p className="mt-2 text-sm text-sa-slate">
          Choose a show and select the days you&apos;re available to work.
        </p>
        <p className="mt-1 text-[11px] text-sa-slate">
          Questions about your schedule? Email{" "}
          <a
            href="mailto:lillian@thesmithagency.net"
            className="font-medium text-sa-pink underline-offset-2 hover:underline"
          >
            lillian@thesmithagency.net
          </a>
          .
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 text-sm text-sa-slate"
      >
        <div className="space-y-1">
          <label
            htmlFor="show"
            className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
          >
            Show
          </label>
          <select
            id="show"
            required
            value={selectedShowId}
            onChange={(event) => onShowChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
          >
            <option value="">
              {loadingShows ? "Loading shows..." : "Select a show"}
            </option>
            {shows.map((show) => (
              <option key={show.id} value={show.id}>
                {show.name || "Untitled show"}
              </option>
            ))}
          </select>
          {shows.length === 0 && !loadingShows && (
            <p className="mt-1 text-[11px] text-sa-slate">
              There are no active shows yet. Check back soon.
            </p>
          )}
        </div>

        {selectedShowId && dateOptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sa-slate">
              Available days
            </p>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {dateOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-sa-slate shadow-inner"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-sa-pink focus:ring-sa-pink/40"
                    checked={selectedDates.includes(option.value)}
                    disabled={hasSubmittedForSelectedShow}
                    onChange={() => !hasSubmittedForSelectedShow && onToggleDate(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={
            availabilitySaving ||
            !selectedShowId ||
            selectedDates.length === 0 ||
            hasSubmittedForSelectedShow
          }
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-sa-pink px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#ff0f80] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {availabilitySaving ? "Saving availability..." : "Save availability"}
        </button>

        {availabilityError && (
          <p className="text-xs text-red-600" role="alert">
            {availabilityError}
          </p>
        )}

        {hasSubmittedForSelectedShow && (
          <p className="text-[11px] text-sa-slate">
            You&apos;ve already submitted availability for this show. If you need
            to make a change, email{" "}
            <a
              href="mailto:lillian@thesmithagency.net"
              className="font-medium text-sa-pink underline-offset-2 hover:underline"
            >
              lillian@thesmithagency.net
            </a>
            .
          </p>
        )}
      </form>

      {availabilityHistory.length > 0 && (
        <section className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
            Your availability
          </p>
          <div className="space-y-2">
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
                  className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-xs text-sa-slate shadow-inner"
                >
                  <p className="font-semibold text-sa-navy">{title}</p>
                  {dates.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dates.map((value) => (
                        <span
                          key={value}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-sa-slate"
                        >
                          {formatDateLabel(value)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1">No days selected yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}
