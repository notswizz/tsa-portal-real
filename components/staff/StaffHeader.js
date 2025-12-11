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
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-sa-pink sm:block">
            The Smith Agency
          </p>
          <h1 className="truncate font-display text-lg font-semibold tracking-tight text-sa-navy sm:text-2xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Right side - User info + logout */}
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
        {/* User avatar + info */}
        <div className="flex items-center gap-2 rounded-xl bg-white/60 px-2 py-1.5 shadow-sm ring-1 ring-slate-100/80 backdrop-blur-sm sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2">
          {/* Profile image or initials fallback */}
          <div className="relative h-8 w-8 flex-shrink-0 sm:h-9 sm:w-9">
            {photoURL ? (
              <Image
                src={photoURL}
                alt={displayName}
                width={36}
                height={36}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-sa-pink/20 sm:h-9 sm:w-9"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sa-pink to-[#ff6bb3] text-[10px] font-bold text-white ring-2 ring-sa-pink/20 sm:h-9 sm:w-9 sm:text-xs">
                {initials}
              </div>
            )}
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400 sm:h-3 sm:w-3" />
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

        {/* Logout button */}
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
      </div>
    </header>
  );
}
