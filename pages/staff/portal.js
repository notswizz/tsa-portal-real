import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import StaffHeader from "@/components/staff/StaffHeader";
import StaffApplicationForm from "@/components/staff/StaffApplicationForm";
import StaffAvailabilityPanel from "@/components/staff/StaffAvailabilityPanel";

const STAFF_DOMAIN =
  process.env.NEXT_PUBLIC_STAFF_GOOGLE_DOMAIN?.toLowerCase().trim() || "";

export default function StaffPortalHome() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [staffDoc, setStaffDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [phone, setPhone] = useState(staffDoc?.phone || "");
  const [location, setLocation] = useState(staffDoc?.location || "");
  const [college, setCollege] = useState(staffDoc?.college || "");
  const [address, setAddress] = useState(staffDoc?.address || "");
  const [dressSize, setDressSize] = useState(staffDoc?.dressSize || "");
  const [shoeSize, setShoeSize] = useState(staffDoc?.shoeSize || "");
  const [instagram, setInstagram] = useState(staffDoc?.instagram || "");
  const [experience, setExperience] = useState(
    staffDoc?.retailWholesaleExperience || ""
  );
  const [shows, setShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [selectedShowId, setSelectedShowId] = useState("");
  const [dateOptions, setDateOptions] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityHistory, setAvailabilityHistory] = useState([]);
  const [staffBookings, setStaffBookings] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/staff");
        return;
      }

      const userEmail = user.email || "";
      const emailDomain = userEmail.split("@")[1]?.toLowerCase() || "";

      if (STAFF_DOMAIN && emailDomain !== STAFF_DOMAIN) {
        await signOut(auth);
        router.replace("/staff");
        return;
      }

      setEmail(userEmail);
      setUserId(user.uid);

      try {
        const staffRef = doc(db, "staff", user.uid);
        const snap = await getDoc(staffRef);
        if (snap.exists()) {
          const data = snap.data();
          // Only allow access for real staff records
          if (data.role !== "staff" || data.active === false) {
            await signOut(auth);
            router.replace("/client");
            return;
          }
          setStaffDoc({ id: snap.id, ...data });
          setPhone(data.phone || "");
          setLocation(data.location || "");
          setCollege(data.college || "");
          setAddress(data.address || "");
          setDressSize(data.dressSize || "");
          setShoeSize(data.shoeSize || "");
          setInstagram(data.instagram || "");
          setExperience(data.retailWholesaleExperience || "");
        } else {
          // No staff profile: treat as non-staff and redirect to client portal
          await signOut(auth);
          router.replace("/client");
          return;
        }
      } catch (err) {
        console.error("Error loading staff profile", err);
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/staff");
  };

  // Load shows and this staff member's availability history
  useEffect(() => {
    if (!userId) return;

    const loadShowsAndAvailability = async () => {
      try {
        setLoadingShows(true);

        // Load shows
        const showsRef = collection(db, "shows");
        const showsSnap = await getDocs(showsRef);
        const allShows = showsSnap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((show) => (show.status || "active") === "active")
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setShows(allShows);

        // Load all availability entries for this staff member
        const availabilityRef = collection(db, "availability");
        const availabilitySnap = await getDocs(availabilityRef);
        const allAvailability = availabilitySnap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((item) => item.staffId === userId);
        setAvailabilityHistory(allAvailability);

        // Load bookings where this staff member is assigned
        const bookingsRef = collection(db, "bookings");
        const bookingsSnap = await getDocs(bookingsRef);
        const myBookings = bookingsSnap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((booking) => {
            // Check if staff is in assignedStaff array
            if (Array.isArray(booking.assignedStaff)) {
              return booking.assignedStaff.some(
                (staff) => staff.staffId === userId || staff.id === userId
              );
            }
            // Check staffAssignments object
            if (booking.staffAssignments && typeof booking.staffAssignments === "object") {
              return Object.values(booking.staffAssignments).some(
                (dayStaff) => Array.isArray(dayStaff) && dayStaff.some(
                  (s) => s.staffId === userId || s.id === userId
                )
              );
            }
            return false;
          });
        setStaffBookings(myBookings);

      } catch (err) {
        console.error("Error loading shows or availability", err);
      } finally {
        setLoadingShows(false);
      }
    };

    loadShowsAndAvailability();
  }, [userId]);

  // When a show is selected, build its date range and apply any existing availability
  useEffect(() => {
    const selectedShow = shows.find((show) => show.id === selectedShowId);
    if (!selectedShow || !selectedShow.startDate || !selectedShow.endDate) {
      setDateOptions([]);
      setSelectedDates([]);
      return;
    }

    const start = new Date(`${selectedShow.startDate}T00:00:00`);
    const end = new Date(`${selectedShow.endDate}T00:00:00`);
    const dates = [];
    const current = new Date(start);

    while (current <= end) {
      const iso = current.toISOString().slice(0, 10); // YYYY-MM-DD
      dates.push({
        value: iso,
        label: current.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
      current.setDate(current.getDate() + 1);
    }

    setDateOptions(dates);

    const existing = availabilityHistory.find(
      (item) => item.showId === selectedShowId && item.staffId === userId
    );
    if (existing) {
      const existingDates = Array.isArray(existing.availableDates)
        ? existing.availableDates
        : Array.isArray(existing.dates)
        ? existing.dates
        : [];
      setSelectedDates(existingDates);
    } else {
      setSelectedDates([]);
    }
  }, [selectedShowId, shows, availabilityHistory, userId]);

  const hasSubmittedForSelectedShow =
    !!selectedShowId &&
    availabilityHistory.some(
      (entry) => entry.showId === selectedShowId && entry.staffId === userId
    );

  // Application + approval state, shared with admin backend
  const hasCompletedApplicationFields =
    !!staffDoc &&
    !!staffDoc.phone &&
    !!staffDoc.location &&
    !!staffDoc.address &&
    !!staffDoc.dressSize &&
    !!staffDoc.shoeSize &&
    !!staffDoc.instagram &&
    typeof staffDoc.retailWholesaleExperience === "string" &&
    staffDoc.retailWholesaleExperience.trim().length > 0;

  // Prefer explicit flags written by either portal or admin, but fall back to field presence
  const applicationCompletedFlag =
    !!staffDoc?.applicationFormCompleted ||
    !!staffDoc?.applicationCompleted ||
    hasCompletedApplicationFields;

  // This is set only by the admin app on review/approval
  const applicationApprovedFlag = !!staffDoc?.applicationFormApproved;

  const hasSubmittedApplication = applicationCompletedFlag;
  const canAccessAvailability = applicationCompletedFlag && applicationApprovedFlag;

  if (checking) {
    return null;
  }

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();
    if (!userId) return;
    setSaving(true);
    setSaveError("");

    try {
      const staffRef = doc(db, "staff", userId);
      await setDoc(
        staffRef,
        {
          phone: phone.trim(),
          location,
          college: college.trim() || null,
          address: address.trim(),
          dressSize: dressSize.trim(),
          shoeSize: shoeSize.trim(),
          instagram: instagram.trim(),
          retailWholesaleExperience: experience.trim(),
          // Mark the application as completed in a way the admin app understands
          applicationCompleted: true,
          applicationFormCompleted: true,
          applicationFormData: {
            phone: phone.trim(),
            location,
            college: college.trim() || null,
            address: address.trim(),
            dressSize: dressSize.trim(),
            shoeSize: shoeSize.trim(),
            instagram: instagram.trim(),
            retailWholesaleExperience: experience.trim(),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const snap = await getDoc(staffRef);
      if (snap.exists()) {
        const data = snap.data();
        setStaffDoc({ id: snap.id, ...data });
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setCollege(data.college || "");
        setAddress(data.address || "");
        setDressSize(data.dressSize || "");
        setShoeSize(data.shoeSize || "");
        setInstagram(data.instagram || "");
        setExperience(data.retailWholesaleExperience || "");
      }
    } catch (err) {
      console.error("Error saving staff application", err);
      setSaveError(
        "We couldn't save your application. Please check your details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDate = (value) => {
    setSelectedDates((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleAvailabilitySubmit = async (event) => {
    event.preventDefault();
    if (!userId || !selectedShowId || selectedDates.length === 0) {
      return;
    }
    setAvailabilitySaving(true);
    setAvailabilityError("");

    try {
      const docId = `${userId}_${selectedShowId}`;
      const availabilityRef = doc(db, "availability", docId);

      const existingSnap = await getDoc(availabilityRef);
      if (existingSnap.exists()) {
        setAvailabilityError(
          "You have already submitted availability for this show. Please contact the office if you need to make a change."
        );
        return;
      }

      const baseData = {
        staffId: userId,
        staffName: staffDoc?.name || null,
        showId: selectedShowId,
        availableDates: [...selectedDates].sort(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(availabilityRef, baseData, { merge: true });

      const snap = await getDoc(availabilityRef);
      let updatedRecord = null;
      if (snap.exists()) {
        updatedRecord = { id: snap.id, ...snap.data() };
      }

      setAvailabilityHistory((prev) => {
        if (!updatedRecord) return prev;
        const others = prev.filter((item) => item.id !== updatedRecord.id);
        return [...others, updatedRecord];
      });

      // Clear the form after a successful save
      setSelectedShowId("");
      setDateOptions([]);
      setSelectedDates([]);
    } catch (err) {
      console.error("Error saving availability", err);
      setAvailabilityError(
        "We couldn't save your availability. Please try again."
      );
    } finally {
      setAvailabilitySaving(false);
    }
  };

  // Determine the current view state
  const viewState = !hasSubmittedApplication 
    ? "application" 
    : canAccessAvailability 
    ? "dashboard" 
    : "pending";

  return (
    <>
      <Head>
        <title>Staff Dashboard · The Smith Agency</title>
        <meta
          name="description"
          content="Staff dashboard for The Smith Agency."
        />
      </Head>
      <div className="sa-portal-logo-pattern min-h-screen bg-sa-background">
        {/* Top gradient accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sa-pink via-[#ff6bb3] to-sa-pink sm:h-1.5" />
        
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {/* Main card container */}
          <div className="sa-portal-frame animate-fade-in">
            <div className="rounded-2xl bg-sa-card shadow-soft sm:rounded-3xl">
              {/* Header section */}
              <div className="border-b border-slate-100/80 px-4 py-4 sm:px-8 sm:py-6">
                <StaffHeader
                  email={email}
                  staffName={staffDoc?.name}
                  photoURL={staffDoc?.photoURL}
                  title={
                    viewState === "application"
                      ? "Staff Application"
                      : viewState === "dashboard"
                      ? "Staff Dashboard"
                      : "Application Under Review"
                  }
                  onLogout={handleLogout}
                />
              </div>

              {/* Main content area */}
              <main className="px-4 py-5 sm:px-8 sm:py-8">
                {/* Application Form View */}
                {viewState === "application" && (
                  <div className="animate-fade-in">
                    <StaffApplicationForm
                      phone={phone}
                      location={location}
                      college={college}
                      address={address}
                      dressSize={dressSize}
                      shoeSize={shoeSize}
                      instagram={instagram}
                      experience={experience}
                      saving={saving}
                      saveError={saveError}
                      onChangePhone={setPhone}
                      onChangeLocation={setLocation}
                      onChangeCollege={setCollege}
                      onChangeAddress={setAddress}
                      onChangeDressSize={setDressSize}
                      onChangeShoeSize={setShoeSize}
                      onChangeInstagram={setInstagram}
                      onChangeExperience={setExperience}
                      onSubmit={handleApplicationSubmit}
                    />
                  </div>
                )}

                {/* Pending Review View */}
                {viewState === "pending" && (
                  <div className="animate-fade-in">
                    <div className="mx-auto max-w-lg rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-center ring-1 ring-amber-100/80 sm:rounded-2xl sm:p-8">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft">
                        <svg className="h-8 w-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-600">
                        Application Received
                      </p>
                      <h2 className="mt-2 font-display text-xl font-semibold text-sa-navy">
                        We're Reviewing Your Application
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-sa-slate">
                        Thanks for submitting your staff application! The Smith Agency team is reviewing your
                        details now. Once approved, your dashboard and availability tools will automatically unlock.
                      </p>
                      <div className="mt-5 rounded-xl bg-white/70 px-4 py-3 text-xs text-sa-slate">
                        Questions? Email{" "}
                        <a
                          href="mailto:lillian@thesmithagency.net"
                          className="font-medium text-sa-pink underline-offset-2 hover:underline"
                        >
                          lillian@thesmithagency.net
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dashboard View */}
                {viewState === "dashboard" && (
                  <div className="animate-fade-in">
                    {/* Availability form section */}
                    <div className="rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm sm:rounded-2xl sm:p-6">
                      <StaffAvailabilityPanel
                        shows={shows}
                        loadingShows={loadingShows}
                        selectedShowId={selectedShowId}
                        dateOptions={dateOptions}
                        selectedDates={selectedDates}
                        availabilitySaving={availabilitySaving}
                        availabilityError={availabilityError}
                        availabilityHistory={availabilityHistory}
                        hasSubmittedForSelectedShow={hasSubmittedForSelectedShow}
                        onShowChange={setSelectedShowId}
                        onToggleDate={handleToggleDate}
                        onSubmit={handleAvailabilitySubmit}
                        staffName={staffDoc?.name}
                        staffBookings={staffBookings}
                        payRate={staffDoc?.payRate}
                        staffCity={staffDoc?.city || staffDoc?.location}
                      />
                    </div>
                  </div>
                )}
              </main>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
