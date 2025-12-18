import React from "react";

function formatShowroomLabel(room) {
  return `${room.city || "Showroom"} ${
    [room.buildingNumber, room.floorNumber, room.boothNumber]
      .filter(Boolean)
      .join("-") || ""
  }`.trim();
}

export default function ClientShowroomsCard({ showrooms, onOpenAddModal }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
          Booth locations
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="rounded-full bg-sa-pink px-3 py-1 text-[11px] font-semibold text-white shadow-soft transition hover:bg-[#ff0f80]"
        >
          + Location
        </button>
      </div>

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


