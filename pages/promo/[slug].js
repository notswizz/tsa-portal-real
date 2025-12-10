import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function PromoLanding() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [shareLink, setShareLink] = useState(null);

  useEffect(() => {
    if (!router.isReady || !slug || typeof slug !== "string") return;

    const load = async () => {
      try {
        const ref = doc(db, "shareLinks", slug);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setShareLink(null);
          setLoading(false);
          return;
        }

        const data = snap.data();
        setShareLink({ id: snap.id, ...data });
        setLoading(false);

        // Log a lightweight click event
        try {
          const clicksRef = collection(db, "shareLinkClicks");
          await addDoc(clicksRef, {
            shareLinkId: snap.id,
            bookingId: data.bookingId || null,
            clientId: data.clientId || null,
            showId: data.showId || null,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Error logging share link click", err);
        }
      } catch (error) {
        console.error("Error loading promo share link", error);
        setLoading(false);
      }
    };

    load();
  }, [router, slug]);

  const title = shareLink
    ? `${shareLink.clientCompanyName || "Client"} · ${shareLink.showName || "Show booking"}`
    : "The Smith Agency · Client Portal";

  const description = shareLink
    ? "Showroom staffing and bookings by The Smith Agency."
    : "Access The Smith Agency client portal to manage bookings and staffing.";

  if (loading) {
    return null;
  }

  if (!shareLink) {
    return (
      <>
        <Head>
          <title>Link not found · The Smith Agency</title>
        </Head>
        <div className="sa-portal-logo-pattern flex min-h-screen items-center justify-center bg-sa-background px-4">
          <div className="sa-portal-frame w-full max-w-md">
            <div className="rounded-3xl bg-sa-card px-6 py-8 text-center text-sm text-sa-slate shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sa-slate">
                Promo link expired
              </p>
              <p className="mt-3 text-sm text-sa-navy">
                This promo link is no longer active. For current opportunities,
                please contact The Smith Agency.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://smithagency.app/logo.webp" />
        <meta property="og:image:alt" content="The Smith Agency logo" />
      </Head>

      <div className="sa-portal-logo-pattern flex min-h-screen items-center justify-center bg-sa-background px-4">
        <div className="sa-portal-frame w-full max-w-md">
          <div className="flex flex-col gap-4 rounded-3xl bg-sa-card px-6 py-7 text-xs text-sa-slate shadow-soft">
            <div className="space-y-1 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sa-slate">
                The Smith Agency
              </p>
              <h1 className="font-display text-xl font-semibold tracking-tight text-sa-navy">
                {shareLink.showName || "Show booking"}
              </h1>
              {shareLink.clientCompanyName && (
                <p className="text-[13px] text-sa-slate">
                  Featuring{" "}
                  <span className="font-semibold">
                    {shareLink.clientCompanyName}
                  </span>
                </p>
              )}
              {shareLink.dateLabel && (
                <p className="text-[11px] text-sa-slate">
                  {shareLink.dateLabel}
                </p>
              )}
            </div>

            <div className="mt-2 rounded-2xl border border-sa-pink/40 bg-sa-pinkLight px-4 py-3 text-[11px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sa-slate">
                Showroom staffing by The Smith Agency
              </p>
              <p className="mt-2 text-[11px] text-sa-slate">
                Looking to book experienced showroom staff for this show or a
                future market? Learn more about partnering with The Smith
                Agency or create a client account.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="https://thesmithagency.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-sa-navy shadow-soft ring-1 ring-slate-200 transition hover:ring-sa-pink/60"
                >
                  More about The Smith Agency
                </a>
                <a
                  href="/client"
                  className="inline-flex items-center justify-center rounded-full bg-sa-pink px-4 py-1.5 text-[11px] font-semibold text-white shadow-soft transition hover:bg-[#ff0f80]"
                >
                  Create client account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

