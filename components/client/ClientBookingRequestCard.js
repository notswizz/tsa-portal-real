import React, { useEffect, useMemo, useState } from "react";
import ClientBookingsList from "./ClientBookingsList";

function formatShowroomLabel(room) {
  return `${room.city || "Showroom"} ${
    [room.buildingNumber, room.floorNumber, room.boothNumber]
      .filter(Boolean)
      .join("-") || ""
  }`.trim();
}

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

function formatStaffDateLabel(ymd) {
  const date = parseYmdToDate(ymd);
  if (!date) {
    return { weekday: "", full: ymd };
  }
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const full = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return { weekday, full };
}

function getShowDates(show) {
  if (!show?.startDate || !show?.endDate) return [];
  const dates = [];
  let current = new Date(`${show.startDate}T00:00:00`);
  const end = new Date(`${show.endDate}T00:00:00`);

  // Guard against invalid dates
  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) {
    return [];
  }

  while (current <= end) {
    const iso = current.toISOString().slice(0, 10);
    dates.push(iso);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function ClientBookingRequestCard({
  contacts,
  showrooms,
  shows,
  bookings,
  clientId,
  clientEmail,
  tab: controlledTab,
  onTabChange,
  hideHeader = false,
  onAddContact,
  onAddShowroom,
  showContactModal,
  setShowContactModal,
  showShowroomModal,
  setShowShowroomModal,
}) {
  const [internalTab, setInternalTab] = useState("request"); // 'request' | 'history'
  const tab = controlledTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;
  const [contactId, setContactId] = useState("");
  const [showroomId, setShowroomId] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedShowId, setSelectedShowId] = useState("");
  const [staffByDate, setStaffByDate] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Contact form state
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  
  // Showroom form state
  const [newCity, setNewCity] = useState("");
  const [newBuildingNumber, setNewBuildingNumber] = useState("");
  const [newFloorNumber, setNewFloorNumber] = useState("");
  const [newBoothNumber, setNewBoothNumber] = useState("");
  const [showroomSubmitting, setShowroomSubmitting] = useState(false);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !onAddContact) return;
    setContactSubmitting(true);
    try {
      await onAddContact({
        name: newContactName.trim(),
        phone: newContactPhone.trim() || null,
        email: newContactEmail.trim() || null,
      });
      setNewContactName("");
      setNewContactPhone("");
      setNewContactEmail("");
      setShowContactModal(false);
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleAddShowroom = async (e) => {
    e.preventDefault();
    if (!newCity || !onAddShowroom) return;
    setShowroomSubmitting(true);
    try {
      await onAddShowroom({
        city: newCity,
        buildingNumber: newBuildingNumber.trim() || null,
        floorNumber: newFloorNumber.trim() || null,
        boothNumber: newBoothNumber.trim() || null,
      });
      setNewCity("");
      setNewBuildingNumber("");
      setNewFloorNumber("");
      setNewBoothNumber("");
      setShowShowroomModal(false);
    } finally {
      setShowroomSubmitting(false);
    }
  };

  const activeShows = useMemo(
    () => (shows || []).filter((show) => show.status === "active"),
    [shows]
  );

  const selectedShow = useMemo(
    () => activeShows.find((show) => show.id === selectedShowId),
    [activeShows, selectedShowId]
  );

  const showDates = useMemo(() => getShowDates(selectedShow), [selectedShow]);

  const handleStaffChange = (date, value) => {
    setStaffByDate((prev) => {
      if (!value) {
        const { [date]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: Number(value),
      };
    });
  };

  // When the show changes, clear dependent fields
  useEffect(() => {
    setStaffByDate({});
    setContactId("");
    setShowroomId("");
    setNotes("");
    setAgreedToTerms(false);
  }, [selectedShowId]);

  const totalStaffDays = useMemo(
    () =>
      Object.values(staffByDate).reduce(
        (sum, value) => sum + (Number(value) || 0),
        0
      ),
    [staffByDate]
  );

  const totalCharge = totalStaffDays * 300;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedShow || !agreedToTerms || !clientId) return;

    setIsSubmitting(true);
    try {
      const bookingDraft = {
        contactId,
        showroomId,
        notes: notes.trim(),
        showId: selectedShow.id,
        showName: selectedShow.name || null,
        date: selectedShow.startDate || null,
        staffByDate,
      };

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientEmail,
          booking: bookingDraft,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        console.error("Failed to create checkout session", data.error);
        if (typeof window !== "undefined") {
          window.alert(
            "We couldn't start the payment. Please refresh and try again, or contact The Smith Agency."
          );
        }
        return;
      }

      if (typeof window !== "undefined") {
        window.location.href = data.url;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex max-h-[78vh] flex-col rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100/80 lg:max-h-[64vh]">
      {!hideHeader && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
            Bookings
          </p>
          <div className="inline-flex rounded-full bg-slate-100/90 p-1 text-[11px] font-medium text-sa-slate ring-1 ring-slate-200/80 shadow-sm">
            <button
              type="button"
              onClick={() => setTab("request")}
              className={`rounded-full px-3 py-1 transition ${
                tab === "request"
                  ? "bg-white text-sa-navy shadow-sm"
                  : "hover:text-sa-navy/80"
              }`}
            >
              Request
            </button>
            <button
              type="button"
              onClick={() => setTab("history")}
              className={`rounded-full px-3 py-1 transition ${
                tab === "history"
                  ? "bg-white text-sa-navy shadow-sm"
                  : "hover:text-sa-navy/80"
              }`}
            >
              View
            </button>
          </div>
        </div>
      )}

      {tab === "history" ? (
        <div className="mt-1 flex-1 overflow-y-auto">
          <ClientBookingsList bookings={bookings} />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-1 flex-1 space-y-2 overflow-y-auto pb-40 pr-1 text-sm text-sa-slate lg:pb-10"
        >
          {/* Deposit notice */}
          <div className="rounded-xl bg-gradient-to-r from-sa-pinkLight to-pink-50 px-3 py-2 ring-1 ring-sa-pink/10">
            <p className="text-xs text-sa-navy">
              <span className="font-semibold">$100 deposit</span> will be deducted from final total
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="bookingShow"
              className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
            >
              Show
            </label>
            <select
              id="bookingShow"
              value={selectedShowId}
              onChange={(event) => setSelectedShowId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
              required
            >
              <option value="">Select show</option>
              {activeShows.map((show) => (
                <option key={show.id} value={show.id}>
                  {show.name}
                </option>
              ))}
            </select>
            {selectedShow && (
              <p className="mt-1 text-[11px] text-sa-slate">
                {selectedShow.startDate} – {selectedShow.endDate} ·{" "}
                {selectedShow.season} {selectedShow.type?.trim()}
              </p>
            )}
          </div>

          {showDates.length > 0 && (
            <div className="space-y-2 rounded-2xl bg-slate-50/70 p-3 text-[11px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sa-slate">
                Staff per day
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {showDates.map((date) => (
                  <StaffDayRow
                    key={date}
                    date={date}
                    value={staffByDate[date]}
                    onChange={handleStaffChange}
                  />
                ))}
              </div>
            </div>
          )}

          {totalStaffDays > 0 && (
            <div className="space-y-1 rounded-2xl border border-sa-pink/15 bg-slate-50/90 p-3 text-[11px] text-sa-slate shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sa-pinkLight/80 text-[11px] font-semibold text-sa-pink">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sa-slate">
                    Total staff days
                  </span>
                </div>
                <span className="text-sm font-semibold text-sa-navy">
                  {totalStaffDays} day{totalStaffDays !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="bookingContact"
              className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
            >
              Contact
            </label>
            {contacts.length === 0 ? (
              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-sm font-medium text-sa-slate transition hover:border-sa-pink hover:bg-sa-pinkLight/30 hover:text-sa-pink"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add primary contact for show
              </button>
            ) : (
              <select
                id="bookingContact"
                value={contactId}
                onChange={(event) => setContactId(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
              >
                <option value="">Select contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="bookingShowroom"
              className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
            >
              Booth location
            </label>
            {showrooms.length === 0 ? (
              <button
                type="button"
                onClick={() => setShowShowroomModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-sm font-medium text-sa-slate transition hover:border-sa-pink hover:bg-sa-pinkLight/30 hover:text-sa-pink"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add location for show
              </button>
            ) : (
              <select
                id="bookingShowroom"
                value={showroomId}
                onChange={(event) => setShowroomId(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
              >
                <option value="">Select booth location</option>
                {showrooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {formatShowroomLabel(room)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="bookingNotes"
              className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
            >
              Notes
            </label>
            <textarea
              id="bookingNotes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2 text-[11px] text-sa-slate">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(event) => setAgreedToTerms(event.target.checked)}
                className="mt-[2px] h-3.5 w-3.5 rounded border-slate-300 text-sa-pink focus:ring-sa-pink/40"
              />
              <span>
                I agree to The Smith Agency{" "}
                <a
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  className="font-medium text-sa-pink underline-offset-2 hover:underline"
                >
                  terms and conditions
                </a>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !agreedToTerms}
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-sa-pink px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#ff0f80] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending request..." : "Request booking"}
            </button>
          </div>
        </form>
      )}

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-100/80">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-sa-navy">Add Contact</h3>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sa-slate transition hover:bg-slate-200 hover:text-sa-navy"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-sa-slate">
                  Name <span className="text-sa-pink">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                  placeholder="Contact name"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-sa-slate">Phone</label>
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-sa-slate">Email</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                  placeholder="email@company.com"
                />
              </div>
              <button
                type="submit"
                disabled={contactSubmitting}
                className="mt-2 w-full rounded-xl bg-sa-pink px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#ff0f80] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {contactSubmitting ? "Saving..." : "Save Contact"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Showroom Modal */}
      {showShowroomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-100/80">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-sa-navy">Add Booth Location</h3>
              <button
                type="button"
                onClick={() => setShowShowroomModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sa-slate transition hover:bg-slate-200 hover:text-sa-navy"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddShowroom} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-sa-slate">
                  City <span className="text-sa-pink">*</span>
                </label>
                <select
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                >
                  <option value="">Select city</option>
                  <option value="ATL">Atlanta (ATL)</option>
                  <option value="LA">Los Angeles (LA)</option>
                  <option value="DAL">Dallas (DAL)</option>
                  <option value="NYC">New York (NYC)</option>
                  <option value="LV">Las Vegas (LV)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-sa-slate">Building Number</label>
                <input
                  type="text"
                  value={newBuildingNumber}
                  onChange={(e) => setNewBuildingNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                  placeholder=""
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-sa-slate">Floor Number</label>
                <input
                  type="text"
                  value={newFloorNumber}
                  onChange={(e) => setNewFloorNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                  placeholder=""
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-sa-slate">Booth Number</label>
                <input
                  type="text"
                  value={newBoothNumber}
                  onChange={(e) => setNewBoothNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                  placeholder=""
                />
              </div>
              <button
                type="submit"
                disabled={showroomSubmitting}
                className="mt-2 w-full rounded-xl bg-sa-pink px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#ff0f80] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {showroomSubmitting ? "Saving..." : "Save Location"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffDayRow({ date, value, onChange }) {
  const { weekday, full } = formatStaffDateLabel(date);
  const hasFilled = value !== undefined && value !== "" && Number(value) > 0;

  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 shadow-sm transition-all ${
      hasFilled 
        ? "border-sa-pink bg-sa-pinkLight/30 ring-1 ring-sa-pink/20" 
        : "border-slate-200/60 bg-white/90"
    }`}>
      <div className="flex flex-col">
        <span className={`text-[11px] font-semibold ${hasFilled ? "text-sa-pink" : "text-sa-navy"}`}>
          {weekday || date}
        </span>
        <span className="text-[10px] text-sa-slate">{full}</span>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="99"
          value={value ?? ""}
          onChange={(event) => onChange(date, event.target.value)}
          className={`w-20 rounded-xl border bg-white px-2 py-1 text-center text-sm font-medium text-sa-navy outline-none transition focus:border-sa-pink focus:ring-2 focus:ring-sa-pink/20 ${
            hasFilled ? "border-sa-pink" : "border-slate-200"
          }`}
        />
      </div>
    </div>
  );
}


