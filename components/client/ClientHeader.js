import React from "react";
import Image from "next/image";

export default function ClientHeader({ companyName, onLogout }) {
  return (
    <div className="relative flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div className="space-y-1 pr-24 sm:pr-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-sa-slate">
          The Smith Agency
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-sa-navy">
          {companyName || "Client company name"}
        </h1>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sa-slate">
          Client Portal
        </p>
      </div>

      <div className="absolute right-0 top-0 flex items-center gap-2 sm:static sm:ml-auto sm:mt-[-14px]">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-slate-100/80 sm:h-11 sm:w-11">
          <Image
            src="/logo.webp"
            alt="The Smith Agency"
            width={36}
            height={36}
            className="h-full w-full object-cover scale-110"
            priority
          />
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-medium text-sa-slate shadow-sm transition hover:bg-slate-50 hover:text-sa-navy sm:text-[11px]"
          >
            Log out
          </button>
        )}
      </div>
    </div>
  );
}


