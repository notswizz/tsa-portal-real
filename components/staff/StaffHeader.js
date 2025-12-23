import Image from "next/image";

export default function StaffHeader({ 
  email, 
  title, 
  staffName,
  photoURL, 
  onLogout 
}) {
  // Get initials for fallback avatar
  const getInitials = (name, emailAddr) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (emailAddr) {
      return emailAddr.slice(0, 2).toUpperCase();
    }
    return "SA";
  };

  const initials = getInitials(staffName, email);
  const displayName = staffName || email?.split("@")[0] || "Staff Member";

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-3">
      {/* Left side - Logo + branding */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {/* Logo - smaller on mobile */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-sa-pink to-[#ff6bb3] shadow-sm ring-1 ring-white/20 sm:h-11 sm:w-11 sm:rounded-xl sm:shadow-soft">
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
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-sa-pink sm:block">
            The Smith Agency
          </p>
          <h1 className="truncate font-display text-base font-semibold tracking-tight text-sa-navy sm:text-2xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Right side - User info + logout */}
      <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3">
        {/* User avatar + info - simplified on mobile */}
        <div className="flex items-center gap-2 rounded-lg bg-white/60 px-1.5 py-1 shadow-sm ring-1 ring-slate-100/80 backdrop-blur-sm sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2">
          {/* Profile image or initials fallback */}
          <div className="relative h-7 w-7 flex-shrink-0 sm:h-9 sm:w-9">
            {photoURL ? (
              <Image
                src={photoURL}
                alt={displayName}
                width={36}
                height={36}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-sa-pink/20 sm:h-9 sm:w-9 sm:ring-2"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sa-pink to-[#ff6bb3] text-[9px] font-bold text-white ring-1 ring-sa-pink/20 sm:h-9 sm:w-9 sm:text-xs sm:ring-2">
                {initials}
              </div>
            )}
            {/* Online indicator - smaller on mobile */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-green-400 sm:h-3 sm:w-3 sm:border-2" />
          </div>

          {/* Name + email - hidden on mobile */}
          <div className="hidden min-w-0 flex-col md:flex">
            <p className="truncate text-sm font-medium text-sa-navy">
              {displayName}
            </p>
            {email && displayName !== email && (
              <p className="max-w-[150px] truncate text-[11px] text-sa-slate">{email}</p>
            )}
          </div>
        </div>

        {/* Logout button - smaller on mobile */}
        <button
          type="button"
          onClick={onLogout}
          className="group flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100/80 text-xs font-medium text-sa-slate shadow-sm ring-1 ring-slate-200/80 transition-all hover:bg-white hover:text-sa-navy hover:shadow-md sm:h-auto sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5"
        >
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 sm:h-4 sm:w-4"
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
      </div>
    </header>
  );
}
