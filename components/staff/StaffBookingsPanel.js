export default function StaffBookingsPanel({ bookings, availabilityHistory }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
          Bookings
        </p>
        <p className="mt-2 text-sm text-sa-slate">
          Once bookings are assigned to you, they will appear here along with a
          summary of your past availability.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
          Your bookings
        </p>

        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-xs text-sa-slate shadow-inner"
            >
              <p className="font-semibold text-sa-navy">
                {booking.showName || "Show booking"}
              </p>
              {booking.clientCompanyName && (
                <p className="mt-1">
                  Client:{" "}
                  <span className="font-medium text-sa-navy">
                    {booking.clientCompanyName}
                  </span>
                </p>
              )}
              {!booking.clientCompanyName && booking.clientId && (
                <p className="mt-1">Client ID: {booking.clientId}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-sa-slate">
            You don&apos;t have any booked shifts yet. Once the team assigns you,
            they&apos;ll show up here.
          </p>
        )}
      </div>

      {availabilityHistory.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
            Your availability history
          </p>
          {availabilityHistory.map((entry) => {
            const dates = Array.isArray(entry.availableDates)
              ? entry.availableDates
              : Array.isArray(entry.dates)
              ? entry.dates
              : [];
            return (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-xs text-sa-slate shadow-inner"
              >
                <p className="font-semibold text-sa-navy">
                  {entry.showName || "Show availability"}
                </p>
                {dates.length > 0 ? (
                  <p className="mt-1">{dates.join(", ")}</p>
                ) : (
                  <p className="mt-1">No days selected yet.</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-sa-slate">
          You haven&apos;t submitted any availability yet. Once you do, you&apos;ll see
          it here alongside any bookings the team assigns to you.
        </p>
      )}
    </section>
  );
}
