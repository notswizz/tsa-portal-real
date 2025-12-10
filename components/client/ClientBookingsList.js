import React from "react";

function parseYmdToDate(ymd) {
  if (!ymd || typeof ymd !== "string") return null;
  const [yearStr, monthStr, dayStr] = ymd.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return null;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateLabel(ymd) {
  const d = parseYmdToDate(ymd);
  if (!d) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDatesSummary(booking) {
  const datesNeeded = Array.isArray(booking.datesNeeded)
    ? booking.datesNeeded
    : [];

  const allDates = datesNeeded
    .map((d) => d.date)
    .filter(Boolean)
    .sort();

  const showStart =
    booking.showData?.startDate ||
    (allDates.length > 0 ? allDates[0] : null) ||
    booking.date ||
    null;

  const showEnd =
    booking.showData?.endDate ||
    (allDates.length > 0 ? allDates[allDates.length - 1] : null) ||
    booking.date ||
    null;

  const startLabel = formatDateLabel(showStart);
  const endLabel = formatDateLabel(showEnd);

  const badgeLabel =
    startLabel && endLabel
      ? startLabel === endLabel
        ? startLabel
        : `${startLabel} – ${endLabel}`
      : formatDateLabel(booking.date) || "Date TBD";

  const daysWithStaff = datesNeeded.filter((d) => (d.staffCount || 0) > 0)
    .length;

  // How many unique calendar days are booked
  const dayCount =
    daysWithStaff || (allDates.length || (booking.date ? 1 : 0));

  // "Staff days" = days * staff working per day, to match pricing logic
  const staffDayCount =
    Array.isArray(datesNeeded) && datesNeeded.length > 0
      ? datesNeeded.reduce(
          (sum, d) => sum + (Number(d.staffCount) || 0),
          0
        )
      : Number(booking.totalStaffNeeded) || 0;

  return {
    badgeLabel,
    dayCount,
    staffDayCount,
  };
}

export default function ClientBookingsList({ bookings }) {
  return (
    <div className="max-h-80 overflow-y-auto pr-1">
      {bookings.length === 0 ? (
        <p className="mt-1 text-xs text-sa-slate">
          When you request bookings, they&apos;ll appear here with statuses.
        </p>
      ) : (
        <ul className="space-y-3 text-xs text-sa-slate">
          {bookings.map((booking) => {
            const { badgeLabel, dayCount, staffDayCount } =
              getDatesSummary(booking);

            return (
              <li
                key={booking.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-100/70"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-sa-navy">
                    {booking.showName || booking.title}
                  </p>
                  <span className="rounded-full bg-sa-pinkLight/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sa-pink">
                    {booking.status || "Pending"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center rounded-full bg-sa-pinkLight/50 px-2 py-0.5 font-medium text-sa-pink">
                    {badgeLabel}
                  </span>

                  {(booking.showroomLabel || booking.showroomName) && (
                    <span className="text-sa-slate">
                      {booking.showroomLabel || booking.showroomName}
                    </span>
                  )}

                  {(staffDayCount || dayCount) > 0 && (
                    <div className="ml-auto flex flex-col items-end gap-0.5">
                      <span className="text-[10px] text-sa-slate">
                        total staff days
                      </span>
                      <span className="inline-flex items-center justify-center rounded-full border border-sa-pink/40 bg-sa-pinkLight/40 px-3 py-0.5 text-[11px] font-semibold text-sa-pink shadow-sm">
                        {staffDayCount || dayCount}
                      </span>
                    </div>
                  )}
                </div>

                {booking.notes && (
                  <p className="mt-3 text-[11px] text-sa-slate">
                    {booking.notes}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

