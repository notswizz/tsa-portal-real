import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>The Smith Agency Portal</title>
        <meta
          name="description"
          content="Login to the Smith Agency client and staff portals."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="sa-portal-logo-pattern flex min-h-screen items-center justify-center bg-sa-background px-4 text-sa-navy">
        <div className="sa-portal-frame w-full max-w-xl">
          <div className="flex flex-col items-center gap-8 rounded-3xl bg-sa-card px-6 py-8 text-center shadow-soft ring-1 ring-slate-100/80 sm:px-10 sm:py-10">
            <div className="space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-slate-100/80">
                <Image
                  src="/logo.webp"
                  alt="The Smith Agency"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover scale-110"
                  priority
                />
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-sa-navy sm:text-4xl">
                  The Smith Agency
                </h1>
                <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-sa-slate">
                  Booking portal
                </p>
              </div>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Link
                href="/client"
                className="inline-flex items-center justify-center rounded-2xl bg-sa-pink px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-[#ff0f80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sa-pink/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sa-card"
              >
                Client
              </Link>
              <Link
                href="/staff"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-sa-navy shadow-soft ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-sa-pink/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sa-pink/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sa-card"
              >
                Staff
              </Link>
            </div>

            <p className="mt-2 text-[10px] text-sa-slate sm:text-xs">
              Questions?{" "}
              <a
                href="mailto:lillian@thesmithagency.net"
                className="font-medium text-sa-pink underline-offset-4 hover:underline"
              >
                lillian@thesmithagency.net
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

