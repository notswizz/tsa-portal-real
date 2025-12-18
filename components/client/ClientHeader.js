import React from "react";
import Image from "next/image";

export default function ClientHeader({ companyName, onLogout }) {
  return (
    <header className="flex items-center justify-between gap-3">
      {/* Left side - Logo + branding */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sa-pink to-[#ff6bb3] shadow-soft ring-1 ring-white/20 sm:h-11 sm:w-11">
          <Image
            src="/logo.webp"
            alt="The Smith Agency"
            width={44}
            height={44}
            className="h-full w-full object-cover scale-110"
            priority
          />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sa-pink">
            The Smith Agency
          </p>
          <h1 className="truncate font-display text-lg font-semibold tracking-tight text-sa-navy sm:text-2xl">
            {companyName || "Client Portal"}
          </h1>
          <p className="text-[10px] font-medium text-sa-slate">
            Client Portal
          </p>
        </div>
      </div>

      {/* Right side - Logout button */}
      <div className="flex flex-shrink-0 items-center">
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="group flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 text-xs font-medium text-sa-slate shadow-sm ring-1 ring-slate-200/80 transition-all hover:bg-white hover:text-sa-navy hover:shadow-md sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden sm:inline">Log out</span>
          </button>
        )}
      </div>
    </header>
  );
}


