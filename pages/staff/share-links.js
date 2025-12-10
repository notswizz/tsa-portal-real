import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function StaffShareLinks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const shareLinksRef = collection(db, "shareLinks");
        const shareLinksSnap = await getDocs(
          query(shareLinksRef, orderBy("createdAt", "desc"))
        );

        const clicksRef = collection(db, "shareLinkClicks");
        const clicksSnap = await getDocs(clicksRef);

        const clicksByShareId = clicksSnap.docs.reduce((acc, docSnap) => {
          const data = docSnap.data();
          const id = data.shareLinkId;
          if (!id) return acc;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});

        const items = shareLinksSnap.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAtTs = data.createdAt;
          let createdAt = "";
          if (createdAtTs?.toDate) {
            createdAt = createdAtTs.toDate().toLocaleString();
          }

          return {
            id: docSnap.id,
            showName: data.showName || "Show booking",
            clientCompanyName: data.clientCompanyName || "Client",
            createdAt,
            clickCount: clicksByShareId[docSnap.id] || 0,
          };
        });

        setRows(items);
      } catch (error) {
        console.error("Error loading share links dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <>
      <Head>
        <title>Share Links · The Smith Agency</title>
      </Head>
      <div className="sa-portal-logo-pattern flex min-h-screen items-start justify-center bg-sa-background px-4 py-8">
        <div className="sa-portal-frame w-full max-w-4xl">
          <div className="flex flex-col space-y-4 rounded-3xl bg-sa-card px-6 py-6 text-xs text-sa-slate shadow-soft sm:px-8 sm:py-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sa-slate">
                  Staff dashboard
                </p>
                <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-sa-navy">
                  Promo share links
                </h1>
              </div>
              <Link
                href="/staff"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-sa-slate shadow-sm transition hover:bg-slate-50 hover:text-sa-navy"
              >
                ← Back to staff portal
              </Link>
            </div>

            {loading ? (
              <p className="mt-4 text-[11px] text-sa-slate">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="mt-4 text-[11px] text-sa-slate">
                No promo share links have been created yet.
              </p>
            ) : (
              <div className="-mx-2 mt-2 max-h-[480px] overflow-auto px-2">
                <table className="min-w-full border-separate border-spacing-y-2 text-[11px]">
                  <thead className="sticky top-0 bg-sa-card">
                    <tr className="text-[10px] uppercase tracking-[0.18em] text-sa-slate">
                      <th className="px-3 py-2 text-left font-semibold">
                        Show
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Client
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Created
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td className="rounded-l-2xl bg-white px-3 py-2 text-sa-navy">
                          {row.showName}
                        </td>
                        <td className="bg-white px-3 py-2">
                          {row.clientCompanyName}
                        </td>
                        <td className="bg-white px-3 py-2 text-[10px] text-sa-slate">
                          {row.createdAt || "—"}
                        </td>
                        <td className="rounded-r-2xl bg-white px-3 py-2 text-right font-semibold text-sa-navy">
                          {row.clickCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

