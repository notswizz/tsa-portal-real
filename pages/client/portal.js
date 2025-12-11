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
      <div className="sa-portal-logo-pattern min-h-screen bg-sa-background">
        {/* Top gradient accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sa-pink via-[#ff6bb3] to-sa-pink sm:h-1.5" />
        
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="sa-portal-frame animate-fade-in">
            <div className="relative flex min-h-[calc(100vh-6rem)] flex-col rounded-2xl bg-sa-card shadow-soft sm:rounded-3xl">
              {/* Header section */}
              <div className="border-b border-slate-100/80 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                <ClientHeader companyName={companyName} onLogout={handleLogout} />
              </div>

              {confirmation && (
              <>
                <div className="pointer-events-none fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                  <div className="pointer-events-auto w-full max-w-md animate-fade-in rounded-2xl border border-sa-pink/30 bg-white p-5 text-xs text-sa-slate shadow-2xl sm:rounded-3xl sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sa-pink to-[#ff6bb3] shadow-lg sm:h-11 sm:w-11">
                          <Image
                            src="/logo.webp"
                            alt="The Smith Agency"
                            width={44}
                            height={44}
                            className="h-full w-full object-cover scale-110"
                            priority
                          />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-green-600">
                            ✓ Booking Request Sent
                          </p>
                          <h2 className="font-display text-lg font-semibold tracking-tight text-sa-navy sm:text-xl">
                            {confirmation.showName}
                          </h2>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmation(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sa-slate transition hover:bg-slate-200 hover:text-sa-navy"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        {confirmation.location && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-sa-slate">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {confirmation.location}
                          </span>
                        )}
                        {confirmation.dateLabel && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-sa-pinkLight px-2.5 py-1 font-medium text-sa-pink">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {confirmation.dateLabel}
                          </span>
                        )}
                        {typeof confirmation.totalStaffDays === "number" &&
                          confirmation.totalStaffDays > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                              {confirmation.totalStaffDays} staff day{confirmation.totalStaffDays !== 1 ? "s" : ""}
                            </span>
                          )}
                      </div>

                      <div className="rounded-xl bg-gradient-to-br from-sa-pinkLight to-pink-50 p-4 ring-1 ring-sa-pink/10">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-sa-slate">Deposit paid</p>
                            <p className="text-sm font-semibold text-green-600">
                              ${((confirmation.depositCents ?? 10000) / 100).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-sa-slate">Remaining balance</p>
                            <p className="text-sm font-semibold text-sa-navy">
                              ${((confirmation.totalDueCents ?? 0) / 100).toLocaleString()}
                            </p>
                          </div>
                          <div className="border-t border-sa-pink/20 pt-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-sa-navy">Total</p>
                              <p className="text-base font-bold text-sa-navy">
                                ${((confirmation.finalTotalCents ?? 0) / 100).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {confirmation.shareUrl && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-sa-navy">Share & Save $25</p>
                          <div className="rounded-xl border border-slate-100 bg-white p-3">
                            <p className="text-xs text-sa-slate">
                              Share this link on social media to receive a{" "}
                              <span className="font-semibold text-sa-pink">$25 discount</span>{" "}
                              on your final invoice.
                            </p>
                            <div className="mt-2 flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={confirmation.shareUrl}
                                className="flex-1 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-sa-navy"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (navigator?.clipboard?.writeText) {
                                    navigator.clipboard
                                      .writeText(confirmation.shareUrl)
                                      .catch((err) => {
                                        console.error("Failed to copy share link", err);
                                      });
                                  }
                                }}
                                className="flex-shrink-0 rounded-lg bg-sa-pink px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff0f80]"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

              {/* Main content area */}
              <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                {/* Toggle between profile and bookings on small/medium screens */}
                <div className="mb-5 flex justify-center lg:hidden">
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium text-sa-slate">
                    <button
                      type="button"
                      onClick={() => setSection("profile")}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 transition ${
                        section === "profile"
                          ? "bg-white text-sa-navy shadow-sm"
                          : "hover:text-sa-navy/80"
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection("bookings")}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 transition ${
                        section === "bookings"
                          ? "bg-white text-sa-navy shadow-sm"
                          : "hover:text-sa-navy/80"
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Bookings
                    </button>
                  </div>
                </div>

                {/* Mobile view */}
                <div className="lg:hidden">
                  {section === "profile" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-sa-navy">
                          <svg className="h-4 w-4 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </h2>
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-medium text-sa-slate">
                          <button
                            type="button"
                            onClick={() => setProfileSection("contacts")}
                            className={`rounded-md px-3 py-1.5 transition ${
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
                            className={`rounded-md px-3 py-1.5 transition ${
                              profileSection === "locations"
                                ? "bg-white text-sa-navy shadow-sm"
                                : "hover:text-sa-navy/80"
                            }`}
                          >
                            Locations
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm">
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
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-sa-navy">
                          <svg className="h-4 w-4 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Bookings
                        </h2>
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-medium text-sa-slate">
                          <button
                            type="button"
                            onClick={() => setBookingTab("request")}
                            className={`rounded-md px-3 py-1.5 transition ${
                              bookingTab === "request"
                                ? "bg-white text-sa-navy shadow-sm"
                                : "hover:text-sa-navy/80"
                            }`}
                          >
                            New Request
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookingTab("history")}
                            className={`rounded-md px-3 py-1.5 transition ${
                              bookingTab === "history"
                                ? "bg-white text-sa-navy shadow-sm"
                                : "hover:text-sa-navy/80"
                            }`}
                          >
                            History
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm">
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
                      </div>
                    </div>
                  )}
                </div>

                {/* Large screens: profile left, bookings right */}
                <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
                  {/* Profile section */}
                  <section className="space-y-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-sa-navy">
                      <svg className="h-4 w-4 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </h2>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm">
                        <ClientContactsCard
                          contacts={contacts}
                          onAddContact={addContact}
                        />
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm">
                        <ClientShowroomsCard
                          showrooms={showrooms}
                          onAddShowroom={addShowroom}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Bookings section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-sa-navy">
                        <svg className="h-4 w-4 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Bookings
                      </h2>
                      <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-medium text-sa-slate">
                        <button
                          type="button"
                          onClick={() => setBookingTab("request")}
                          className={`rounded-md px-3 py-1.5 transition ${
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
                          className={`rounded-md px-3 py-1.5 transition ${
                            bookingTab === "history"
                              ? "bg-white text-sa-navy shadow-sm"
                              : "hover:text-sa-navy/80"
                          }`}
                        >
                          Bookings
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm sm:p-5">
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
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

