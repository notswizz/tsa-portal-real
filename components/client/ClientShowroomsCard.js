import React, { useState } from "react";

function formatShowroomLabel(room) {
  return `${room.city || "Showroom"} ${
    [room.buildingNumber, room.floorNumber, room.boothNumber]
      .filter(Boolean)
      .join("-") || ""
  }`.trim();
}

export default function ClientShowroomsCard({ showrooms, onAddShowroom }) {
  const [isOpen, setIsOpen] = useState(false);
  const [city, setCity] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [boothNumber, setBoothNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!city) return;
    setIsSubmitting(true);
    try {
      await onAddShowroom({
        city,
        buildingNumber: buildingNumber.trim() || null,
        floorNumber: floorNumber.trim() || null,
        boothNumber: boothNumber.trim() || null,
      });
      setCity("");
      setBuildingNumber("");
      setFloorNumber("");
      setBoothNumber("");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
          Booth locations
        </p>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-full bg-sa-pink px-3 py-1 text-[11px] font-semibold text-white shadow-soft transition hover:bg-[#ff0f80]"
        >
          {isOpen ? "Close" : "+ Location"}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-xs text-sa-slate shadow-soft ring-1 ring-slate-100/80">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sa-slate">
                New booth location
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-sa-slate hover:bg-slate-200"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="space-y-1">
                <label
                  htmlFor="showroomCity"
                  className="block text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  City
                </label>
                <select
                  id="showroomCity"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-sa-navy outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                >
                  <option value="">Select city</option>
                  <option value="ATL">ATL</option>
                  <option value="LA">LA</option>
                  <option value="DAL">DAL</option>
                  <option value="NYC">NYC</option>
                  <option value="LV">LV</option>
                </select>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="buildingNumber"
                  className="block text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Building number
                </label>
                <input
                  id="buildingNumber"
                  type="text"
                  value={buildingNumber}
                  onChange={(event) => setBuildingNumber(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="floorNumber"
                  className="block text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Floor number
                </label>
                <input
                  id="floorNumber"
                  type="text"
                  value={floorNumber}
                  onChange={(event) => setFloorNumber(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="boothNumber"
                  className="block text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Booth number
                </label>
                <input
                  id="boothNumber"
                  type="text"
                  value={boothNumber}
                  onChange={(event) => setBoothNumber(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-sa-pink px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:bg-[#ff0f80] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save location"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showrooms.length > 0 && (
        <>
          {showrooms.length <= 2 ? (
            <div className="mt-3 space-y-2 text-[11px]">
              {showrooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <p className="text-xs font-semibold text-sa-navy">
                    {formatShowroomLabel(room)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 max-h-24 space-y-2 overflow-y-auto pr-1 text-[11px]">
              {showrooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <p className="text-xs font-semibold text-sa-navy">
                    {formatShowroomLabel(room)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


