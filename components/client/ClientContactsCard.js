import React, { useState } from "react";

export default function ClientContactsCard({ contacts, onAddContact }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddContact({
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
      });
      setName("");
      setPhone("");
      setEmail("");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
          Contacts
        </p>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-full bg-sa-pink px-3 py-1 text-[11px] font-semibold text-white shadow-soft transition hover:bg-[#ff0f80]"
        >
          {isOpen ? "Close" : "+ Contact"}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-xs text-sa-slate shadow-soft ring-1 ring-slate-100/80">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sa-slate">
                New contact
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
                  htmlFor="contactName"
                  className="block text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Name
                </label>
                <input
                  id="contactName"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="contactPhone"
                  className="block text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Phone
                </label>
                <input
                  id="contactPhone"
                  type="text"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="contactEmail"
                  className="block text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-sa-pink px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:bg-[#ff0f80] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save contact"}
              </button>
            </form>
          </div>
        </div>
      )}

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


