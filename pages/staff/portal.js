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
          setStaffDoc({ id: snap.id, ...data });
          setPhone(data.phone || "");
          setLocation(data.location || "");
          setDressSize(data.dressSize || "");
          setShoeSize(data.shoeSize || "");
          setInstagram(data.instagram || "");
          setExperience(data.retailWholesaleExperience || "");
        } else {
          setStaffDoc(null);
          setPhone("");
          setLocation("");
          setDressSize("");
          setShoeSize("");
          setInstagram("");
          setExperience("");
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
          .filter((show) => show.status === "active");
        setShows(allShows);

        // Load all availability entries for this staff member
        const availabilityRef = collection(db, "availability");
        const availabilitySnap = await getDocs(availabilityRef);
        const allAvailability = availabilitySnap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((item) => item.staffId === userId);
        setAvailabilityHistory(allAvailability);

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

  const hasCompletedApplication =
    !!staffDoc &&
    !!staffDoc.phone &&
    !!staffDoc.location &&
    !!staffDoc.dressSize &&
    !!staffDoc.shoeSize &&
    !!staffDoc.instagram &&
    typeof staffDoc.retailWholesaleExperience === "string" &&
    staffDoc.retailWholesaleExperience.trim().length > 0;

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
          dressSize: dressSize.trim(),
          shoeSize: shoeSize.trim(),
          instagram: instagram.trim(),
          retailWholesaleExperience: experience.trim(),
          applicationCompleted: true,
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

  return (
    <>
      <Head>
        <title>Staff Dashboard · The Smith Agency</title>
        <meta
          name="description"
          content="Staff dashboard for The Smith Agency."
        />
      </Head>
      <div className="sa-portal-logo-pattern flex h-screen items-start justify-center bg-sa-background px-4 py-6 overflow-hidden">
        <div className="sa-portal-frame h-[90vh] max-h-[90vh] w-full max-w-5xl overflow-hidden">
          <div className="relative flex h-full max-h-full w-full flex-col space-y-3 overflow-hidden rounded-3xl bg-sa-card p-5 sm:p-6 md:p-8 shadow-soft">
            <StaffHeader
              email={email}
              title={hasCompletedApplication ? "Staff Dashboard" : "Staff Application"}
              onLogout={handleLogout}
            />
            <main className="mt-6 flex-1 overflow-auto rounded-2xl border border-slate-100 bg-white/80 px-4 py-4 text-sm text-sa-slate">
              {hasCompletedApplication ? (
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
                />
              ) : (
                <StaffApplicationForm
                  phone={phone}
                  location={location}
                  dressSize={dressSize}
                  shoeSize={shoeSize}
                  instagram={instagram}
                  experience={experience}
                  saving={saving}
                  saveError={saveError}
                  onChangePhone={setPhone}
                  onChangeLocation={setLocation}
                  onChangeDressSize={setDressSize}
                  onChangeShoeSize={setShoeSize}
                  onChangeInstagram={setInstagram}
                  onChangeExperience={setExperience}
                  onSubmit={handleApplicationSubmit}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
