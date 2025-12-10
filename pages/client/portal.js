import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import ClientHeader from "@/components/client/ClientHeader";
import ClientContactsCard from "@/components/client/ClientContactsCard";
import ClientShowroomsCard from "@/components/client/ClientShowroomsCard";
import ClientBookingRequestCard from "@/components/client/ClientBookingRequestCard";

export default function ClientPortalHome() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState("bookings"); // 'profile' | 'bookings'
  const [profileSection, setProfileSection] = useState("contacts"); // mobile: 'contacts' | 'locations'
  const [bookingTab, setBookingTab] = useState("request"); // shared request/view toggle

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [shows, setShows] = useState([]);
  const [processingStripeSession, setProcessingStripeSession] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/client");
      } else {
        setUserId(user.uid);
        setEmail(user.email ?? "");
        await loadClientData(user.uid);
        await loadBookings(user.uid);
        await loadContacts(user.uid);
        await loadShowrooms(user.uid);
        await loadShows();
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadClientData = async (uid) => {
    try {
      const ref = doc(db, "clients", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setCompanyName(data.name ?? data.companyName ?? "");
        setWebsite(data.website ?? "");
      }
    } catch (error) {
      console.error("Error loading client data", error);
    }
  };

  const loadBookings = async (uid) => {
    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("clientId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setBookings(list);
    } catch (error) {
      console.error("Error loading bookings", error);
    }
  };

  const loadContacts = async (uid) => {
    try {
      const contactsRef = collection(db, "clients", uid, "contacts");
      const q = query(contactsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setContacts(list);
    } catch (error) {
      console.error("Error loading contacts", error);
    }
  };

  const loadShowrooms = async (uid) => {
    try {
      const showroomsRef = collection(db, "clients", uid, "showrooms");
      const q = query(showroomsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setShowrooms(list);
    } catch (error) {
      console.error("Error loading showrooms", error);
    }
  };

  const loadShows = async () => {
    try {
      const showsRef = collection(db, "shows");
      const snapshot = await getDocs(showsRef);
      const list = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter((show) => show.status === "active");
      setShows(list);
    } catch (error) {
      console.error("Error loading shows", error);
    }
  };

  const createBooking = async ({
    title,
    contactId,
    showroomId,
    notes,
    date,
    showId,
    showName,
    staffByDate,
    payment,
  }) => {
    if (!userId) return null;
    try {
      const bookingsRef = collection(db, "bookings");
      const selectedContact =
        contacts.find((contact) => contact.id === contactId) || null;
      const selectedShowroom =
        showrooms.find((room) => room.id === showroomId) || null;
      const selectedShow = shows.find((show) => show.id === showId) || null;

      const showroomLabel = selectedShowroom
        ? `${selectedShowroom.city || ""} ${[
            selectedShowroom.buildingNumber,
            selectedShowroom.floorNumber,
            selectedShowroom.boothNumber,
          ]
            .filter(Boolean)
            .join("-")}`.trim()
        : null;

      // Idempotency: if we already have a booking for this Stripe session, do nothing
      if (payment?.stripeCheckoutSessionId) {
        const existingQ = query(
          bookingsRef,
          where("stripeCheckoutSessionId", "==", payment.stripeCheckoutSessionId),
          limit(1)
        );
        const existingSnap = await getDocs(existingQ);
        if (!existingSnap.empty) {
          // Return the existing booking id so we can still create share links.
          return existingSnap.docs[0].id;
        }
      }

      const datesNeeded =
        staffByDate && typeof staffByDate === "object"
          ? Object.entries(staffByDate).map(([dateKey, count]) => ({
              date: dateKey,
              staffCount: Number(count) || 0,
            }))
          : [];

      const totalStaffNeeded = datesNeeded.reduce(
        (sum, item) => sum + (item.staffCount || 0),
        0
      );

      const nowIso = new Date().toISOString();

      const docRef = await addDoc(bookingsRef, {
        clientId: userId,
        clientCompanyName: companyName || null,

        // Core booking info
        title,
        status: "pending",
        notes: notes || "",

        // Show linkage
        showId: showId || selectedShow?.id || null,
        showName: showName || selectedShow?.name || null,
        showData: selectedShow || null,

        // Contact & location
        primaryContactId: contactId || null,
        contactId: contactId || null,
        contactName: selectedContact?.name || null,
        primaryLocationId: showroomId || null,
        showroomId: showroomId || null,
        showroomLabel,

        // Dates & staffing
        date: date || selectedShow?.startDate || null,
        datesNeeded,
        totalStaffNeeded,

        // Payment / deposit info
        bookingFeeCents: payment?.bookingFeeCents ?? 10000,
        bookingFeeCentsPaid: payment?.bookingFeeCentsPaid ?? 10000,
        paymentStatus: payment?.paymentStatus ?? "deposit_paid",
        stripeCheckoutSessionId: payment?.stripeCheckoutSessionId ?? null,
        stripePaymentIntentId: payment?.stripePaymentIntentId ?? null,
        stripePaymentMethodId: payment?.stripePaymentMethodId ?? null,
        stripeCustomerId: payment?.stripeCustomerId ?? null,
        currency: payment?.currency ?? "usd",

        // Timestamps as strings
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      await loadBookings(userId);
      return docRef.id;
    } catch (error) {
      console.error("Error creating booking", error);
      return null;
    }
  };

  const addContact = async ({ name, email, phone }) => {
    if (!userId || !name) return;
    try {
      const contactsRef = collection(db, "clients", userId, "contacts");
      await addDoc(contactsRef, {
        name,
        email: email || null,
        phone: phone || null,
        createdAt: serverTimestamp(),
      });
      await loadContacts(userId);
    } catch (error) {
      console.error("Error adding contact", error);
    }
  };

  const addShowroom = async ({
    city,
    buildingNumber,
    floorNumber,
    boothNumber,
  }) => {
    if (!userId || !city) return;
    try {
      const showroomsRef = collection(db, "clients", userId, "showrooms");
      await addDoc(showroomsRef, {
        city,
        buildingNumber: buildingNumber || null,
        floorNumber: floorNumber || null,
        boothNumber: boothNumber || null,
        createdAt: serverTimestamp(),
      });
      await loadShowrooms(userId);
    } catch (error) {
      console.error("Error adding showroom", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/client");
  };

  // After Stripe checkout success, finalize the booking in Firestore
  useEffect(() => {
    if (!router.isReady || !userId || processingStripeSession) return;
    const sessionId = router.query.session_id;
    if (!sessionId || typeof sessionId !== "string") return;

    const finalize = async () => {
      setProcessingStripeSession(true);
      try {
        const response = await fetch("/api/stripe/complete-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();
        if (!response.ok || !data.booking) {
          console.error("Failed to finalize Stripe booking", data.error);
          return;
        }

        const { payment, ...bookingDraft } = data.booking;

        // Create booking in Firestore (idempotent inside createBooking)
        const bookingId = await createBooking({
          title: bookingDraft.showName || "Show booking",
          contactId: bookingDraft.contactId,
          showroomId: bookingDraft.showroomId,
          notes: bookingDraft.notes,
          date: bookingDraft.date,
          showId: bookingDraft.showId,
          showName: bookingDraft.showName,
          staffByDate: bookingDraft.staffByDate,
          payment,
        });

        if (!bookingId) {
          console.error("Booking was not created; skipping confirmation/share link.");
          return;
        }

        // Prepare a friendly confirmation card
        const show = shows.find((s) => s.id === bookingDraft.showId) || null;

        let dateLabel = null;
        if (show?.startDate && show?.endDate) {
          const start = new Date(`${show.startDate}T00:00:00`);
          const end = new Date(`${show.endDate}T00:00:00`);
          const startStr = start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const endStr = end.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          dateLabel =
            show.startDate === show.endDate
              ? startStr
              : `${startStr} – ${endStr}`;
        }

        const staffValues = bookingDraft.staffByDate
          ? Object.values(bookingDraft.staffByDate).map((v) => Number(v) || 0)
          : [];
        const totalStaffDays = staffValues.reduce((sum, v) => sum + v, 0);
        const finalTotalCents = totalStaffDays * 300 * 100;

        const depositCents =
          typeof payment?.bookingFeeCentsPaid === "number"
            ? payment.bookingFeeCentsPaid
            : 10000;
        const totalDueCents = Math.max(finalTotalCents - depositCents, 0);

        // Create a share link document so the client can share
        // a trackable promo link for this booking.
        let shareUrl = null;
        try {
          const shareLinksRef = collection(db, "shareLinks");
          const shareDocRef = await addDoc(shareLinksRef, {
            bookingId,
            clientId: userId,
            clientEmail: email || null,
            clientCompanyName: companyName || null,
            showId: bookingDraft.showId || null,
            showName: show?.name || bookingDraft.showName || "Show booking",
            createdAt: serverTimestamp(),
          });

          const origin =
            typeof window !== "undefined" && window.location.origin
              ? window.location.origin
              : "";
          shareUrl = `${origin || ""}/promo/${shareDocRef.id}`;
        } catch (err) {
          console.error("Error creating share link for booking", err);
        }

        setConfirmation({
          showName: show?.name || bookingDraft.showName || "Show booking",
          location: show?.location || "",
          dateLabel,
          totalStaffDays,
          depositCents,
          totalDueCents,
          finalTotalCents,
          shareUrl,
        });

        // Remove session_id from the URL to avoid duplicate processing
        router.replace("/client/portal", undefined, { shallow: true });
      } catch (error) {
        console.error("Error finalizing booking after Stripe", error);
      } finally {
        setProcessingStripeSession(false);
      }
    };

    finalize();
  }, [router, userId, processingStripeSession, shows]);

  if (checking) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Client Dashboard · The Smith Agency</title>
        <meta
          name="description"
          content="Client dashboard for The Smith Agency bookings."
        />
      </Head>
      <div className="sa-portal-logo-pattern flex h-screen items-start justify-center bg-sa-background px-4 py-6 overflow-hidden">
        <div className="sa-portal-frame h-[90vh] max-h-[90vh] w-full max-w-5xl overflow-hidden">
          <div className="relative flex h-full max-h-full w-full flex-col space-y-3 overflow-hidden rounded-3xl bg-sa-card p-5 sm:p-6 md:p-8 shadow-soft">
            {confirmation && (
              <>
                <div className="pointer-events-none absolute inset-0 z-20 bg-black/40 backdrop-blur-sm" />
                <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
                  <div className="pointer-events-auto w-full max-w-md rounded-[26px] border border-sa-pink/50 bg-white px-6 py-6 text-xs text-sa-slate shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-sa-pinkLight shadow-soft ring-1 ring-sa-pink/40">
                          <Image
                            src="/logo.webp"
                            alt="The Smith Agency"
                            width={36}
                            height={36}
                            className="h-full w-full object-cover scale-110"
                            priority
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sa-slate">
                            Booking request sent
                          </p>
                          <h2 className="font-display text-xl font-semibold tracking-tight text-sa-navy">
                            {confirmation.showName}
                          </h2>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmation(null)}
                        className="mt-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-sa-slate shadow-sm transition hover:bg-slate-50 hover:text-sa-navy"
                      >
                        Close
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        {confirmation.location && (
                          <span className="text-sa-slate">
                            {confirmation.location}
                          </span>
                        )}
                        {confirmation.dateLabel && (
                          <span className="inline-flex items-center rounded-full bg-sa-pinkLight/80 px-3 py-1 text-[11px] font-medium text-sa-pink">
                            {confirmation.dateLabel}
                          </span>
                        )}
                        {typeof confirmation.totalStaffDays === "number" &&
                          confirmation.totalStaffDays > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-sa-slate">
                              <span>Total days</span>
                              <span className="inline-flex items-center rounded-full border border-sa-pink/40 bg-sa-pinkLight px-2 py-0.5 text-[11px] font-semibold text-sa-pink shadow-sm">
                                {confirmation.totalStaffDays}
                              </span>
                            </span>
                          )}
                      </div>

                      <div className="mt-1 rounded-2xl border border-sa-pink/40 bg-sa-pinkLight px-4 py-3 text-[11px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sa-slate">
                              Deposit paid
                            </p>
                            <p className="text-sm font-semibold text-sa-navy">
                              $
                              {(
                                (confirmation.depositCents ?? 10000) / 100
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sa-slate">
                              Total due
                            </p>
                            <p className="text-sm font-semibold text-sa-navy">
                              $
                              {(
                                (confirmation.totalDueCents ?? 0) / 100
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sa-slate">
                              Total
                            </p>
                            <p className="text-sm font-semibold text-sa-navy">
                              $
                              {(
                                (confirmation.finalTotalCents ?? 0) / 100
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {confirmation.shareUrl && (
                        <div className="mt-3 space-y-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sa-slate">
                            Share this booking
                          </p>
                          <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-[11px] shadow-inner">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sa-slate">
                              The Smith Agency · Client Portal
                            </p>
                            <p className="mt-1 text-[13px] font-semibold text-sa-navy">
                              {confirmation.showName}
                            </p>
                            {confirmation.dateLabel && (
                              <p className="text-[11px] text-sa-slate">
                                {confirmation.dateLabel}
                              </p>
                            )}
                            <p className="mt-2 text-[11px] text-sa-slate">
                              Share this link on your social channels to receive
                              a{" "}
                              <span className="font-semibold">
                                $25 discount
                              </span>{" "}
                              on your final invoice.
                            </p>
                            <p className="mt-2 truncate rounded-xl bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-sa-navy">
                              {confirmation.shareUrl}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator?.clipboard?.writeText) {
                                  navigator.clipboard
                                    .writeText(confirmation.shareUrl)
                                    .catch((err) => {
                                      console.error(
                                        "Failed to copy share link",
                                        err
                                      );
                                    });
                                }
                              }}
                              className="mt-2 inline-flex items-center justify-center rounded-full bg-sa-pink px-3 py-1.5 text-[11px] font-semibold text-white shadow-soft transition hover:bg-[#ff0f80]"
                            >
                              Copy share link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            <ClientHeader companyName={companyName} onLogout={handleLogout} />

            {/* Toggle between profile and bookings on small/medium screens */}
            <div className="mt-4 flex justify-center lg:hidden">
              <div className="inline-flex rounded-full bg-slate-100/90 p-1 text-[11px] font-medium text-sa-slate ring-1 ring-slate-200/80 shadow-sm">
                <button
                  type="button"
                  onClick={() => setSection("profile")}
                  className={`rounded-full px-4 py-1.5 transition ${
                    section === "profile"
                      ? "bg-white text-sa-navy shadow-sm"
                      : "hover:text-sa-navy/80"
                  }`}
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setSection("bookings")}
                  className={`rounded-full px-4 py-1.5 transition ${
                    section === "bookings"
                      ? "bg-white text-sa-navy shadow-sm"
                      : "hover:text-sa-navy/80"
                  }`}
                >
                  Bookings
                </button>
              </div>
            </div>

            <div className="mt-6 lg:hidden">
              {section === "profile" ? (
                <>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
                      Profile
                    </p>
                    <div className="inline-flex rounded-full bg-slate-100/90 p-1 text-[11px] font-medium text-sa-slate ring-1 ring-slate-200/80 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setProfileSection("contacts")}
                        className={`rounded-full px-3 py-1 transition ${
                          profileSection === "contacts"
                            ? "bg-white text-sa-navy shadow-sm"
                            : "hover:text-sa-navy/80"
                        }`}
                      >
                        Contacts
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfileSection("locations")}
                        className={`rounded-full px-3 py-1 transition ${
                          profileSection === "locations"
                            ? "bg-white text-sa-navy shadow-sm"
                            : "hover:text-sa-navy/80"
                        }`}
                      >
                        Locations
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 text-sm text-sa-slate">
                    {profileSection === "contacts" ? (
                      <ClientContactsCard
                        contacts={contacts}
                        onAddContact={addContact}
                      />
                    ) : (
                      <ClientShowroomsCard
                        showrooms={showrooms}
                        onAddShowroom={addShowroom}
                      />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
                      Bookings
                    </p>
                    <div className="inline-flex rounded-full bg-slate-100/90 p-1 text-[11px] font-medium text-sa-slate ring-1 ring-slate-200/80 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setBookingTab("request")}
                        className={`rounded-full px-3 py-1 transition ${
                          bookingTab === "request"
                            ? "bg-white text-sa-navy shadow-sm"
                            : "hover:text-sa-navy/80"
                        }`}
                      >
                        Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingTab("history")}
                        className={`rounded-full px-3 py-1 transition ${
                          bookingTab === "history"
                            ? "bg-white text-sa-navy shadow-sm"
                            : "hover:text-sa-navy/80"
                        }`}
                      >
                        View
                      </button>
                    </div>
                  </div>

                  <ClientBookingRequestCard
                    contacts={contacts}
                    showrooms={showrooms}
                    shows={shows}
                    bookings={bookings}
                    clientId={userId}
                    clientEmail={email}
                    tab={bookingTab}
                    onTabChange={setBookingTab}
                    hideHeader
                  />
                </>
              )}
            </div>

            {/* Large screens: profile left, bookings right */}
            <div className="mt-8 hidden flex-1 gap-6 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
              <section className="space-y-4">
                <div className="flex flex-col gap-4 text-sm text-sa-slate">
                  <ClientContactsCard
                    contacts={contacts}
                    onAddContact={addContact}
                  />
                  <ClientShowroomsCard
                    showrooms={showrooms}
                    onAddShowroom={addShowroom}
                  />
                </div>
              </section>

              <section className="-mt-2 space-y-4 lg:-mt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sa-slate">
                    Bookings
                  </p>
                  <div className="inline-flex rounded-full bg-slate-100/90 p-1 text-[11px] font-medium text-sa-slate ring-1 ring-slate-200/80 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setBookingTab("request")}
                      className={`rounded-full px-3 py-1 transition ${
                        bookingTab === "request"
                          ? "bg-white text-sa-navy shadow-sm"
                          : "hover:text-sa-navy/80"
                      }`}
                    >
                      Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingTab("history")}
                      className={`rounded-full px-3 py-1 transition ${
                        bookingTab === "history"
                          ? "bg-white text-sa-navy shadow-sm"
                          : "hover:text-sa-navy/80"
                      }`}
                    >
                      View
                    </button>
                  </div>
                </div>

                <ClientBookingRequestCard
                  contacts={contacts}
                  showrooms={showrooms}
                  shows={shows}
                  bookings={bookings}
                  clientId={userId}
                  clientEmail={email}
                  tab={bookingTab}
                  onTabChange={setBookingTab}
                  hideHeader
                />
              </section>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

