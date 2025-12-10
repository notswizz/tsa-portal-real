import Image from "next/image";

export default function StaffHeader({ email, title, onLogout }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-slate-100/80">
          <Image
            src="/logo.webp"
            alt="The Smith Agency"
            width={40}
            height={40}
            className="h-full w-full object-cover scale-110"
            priority
          />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-sa-slate">
            The Smith Agency
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-sa-navy">
            {title}
          </h1>
          {email && (
            <p className="mt-1 text-xs text-sa-slate">Signed in as {email}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-sa-slate shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:text-sa-navy"
      >
        Log out
      </button>
    </header>
  );
}
