import React from "react";

export default function ClientContactsCard({ contacts, onOpenAddModal }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
          Contacts
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="rounded-full bg-sa-pink px-3 py-1 text-[11px] font-semibold text-white shadow-soft transition hover:bg-[#ff0f80]"
        >
          + Contact
        </button>
      </div>

      {contacts.length > 0 && (
        <>
          {contacts.length <= 2 ? (
            <div className="mt-3 space-y-2 text-[11px]">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <p className="text-xs font-semibold text-sa-navy">
                    {contact.name}
                  </p>
                  {contact.email && <p className="mt-0.5">{contact.email}</p>}
                  {contact.phone && (
                    <p className="mt-0.5 text-[10px] text-sa-slate">
                      {contact.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1 text-[11px]">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <p className="text-xs font-semibold text-sa-navy">
                    {contact.name}
                  </p>
                  {contact.email && <p className="mt-0.5">{contact.email}</p>}
                  {contact.phone && (
                    <p className="mt-0.5 text-[10px] text-sa-slate">
                      {contact.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


