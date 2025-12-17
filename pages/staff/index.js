import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";

const STAFF_DOMAIN =
  process.env.NEXT_PUBLIC_STAFF_GOOGLE_DOMAIN?.toLowerCase().trim() || "";

export default function StaffPortal() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle redirect result on page load (for mobile browsers)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setIsLoading(true);
          await processSignIn(result.user);
        }
      } catch (err) {
        console.error("Redirect result error:", err);
        // Don't show error for "no redirect" cases
        if (err.code !== "auth/popup-closed-by-user") {
          setError("Sign in was interrupted. Please try again.");
        }
      }
    };
    handleRedirectResult();
  }, []);

  // Process successful sign-in
  const processSignIn = async (user) => {
    const email = user?.email || "";

    if (STAFF_DOMAIN && email) {
      const emailDomain = email.split("@")[1]?.toLowerCase() || "";
      if (emailDomain !== STAFF_DOMAIN) {
        await signOut(auth);
        setError(
          `Please sign in with your ${STAFF_DOMAIN} staff email address.`
        );
        setIsLoading(false);
        return;
      }
    }

    // Ensure staff profile exists in Firestore
    if (user?.uid) {
      try {
        const staffRef = doc(db, "staff", user.uid);
        const existing = await getDoc(staffRef);

        if (!existing.exists()) {
          await setDoc(staffRef, {
            email: email || null,
            name: user.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            role: "staff",
            active: true,
          });
        } else {
          await setDoc(
            staffRef,
            {
              email: email || null,
              name: user.displayName || null,
              photoURL: user.photoURL || null,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch (profileError) {
        console.error("Error ensuring staff profile", profileError);
      }
    }

    router.push("/staff/portal");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    // Try popup first, fall back to redirect for mobile browsers
    try {
      const result = await signInWithPopup(auth, provider);
      await processSignIn(result.user);
    } catch (err) {
      console.error("Popup sign-in error:", err);
      
      // If popup blocked or storage issue, try redirect
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request" ||
        err.message?.includes("storage") ||
        err.message?.includes("initial state")
      ) {
        try {
          // Use redirect as fallback
          await signInWithRedirect(auth, provider);
          return; // Page will reload after redirect
        } catch (redirectErr) {
          console.error("Redirect sign-in error:", redirectErr);
          setError("We couldn't complete your sign in. Please try opening this page directly in Safari or Chrome.");
        }
      } else {
        setError("We couldn't complete your sign in. Please try again or contact the office.");
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Staff Portal · The Smith Agency</title>
        <meta
          name="description"
          content="Staff portal login for The Smith Agency."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="sa-portal-logo-pattern flex min-h-screen w-full items-center justify-center bg-sa-background px-3 py-6 sm:px-4 sm:py-8">
        {/* Top gradient accent bar */}
        <div className="fixed inset-x-0 top-0 z-50 h-1 bg-gradient-to-r from-sa-pink via-[#ff6bb3] to-sa-pink sm:h-1.5" />
        
        <div className="mx-auto w-full max-w-md animate-fade-in">
          {/* Main card */}
          <div className="sa-portal-frame">
            <div className="rounded-2xl bg-white p-6 shadow-soft sm:rounded-3xl sm:p-10">
              {/* Logo and branding */}
              <div className="mb-6 text-center sm:mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sa-pink to-[#ff6bb3] shadow-lg shadow-sa-pink/25 sm:mb-5 sm:h-20 sm:w-20 sm:rounded-2xl">
                  <Image
                    src="/logo.webp"
                    alt="The Smith Agency"
                    width={80}
                    height={80}
                    className="h-full w-full scale-110 object-cover"
                    priority
                  />
                </div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-sa-pink sm:text-[10px] sm:tracking-[0.35em]">
                  The Smith Agency
                </p>
                <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-sa-navy sm:mt-2 sm:text-3xl">
                  Staff Portal
                </h1>
              </div>

              {/* Sign in button */}
              <div className="space-y-3 sm:space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-sa-navy px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-sa-navy/20 transition-all duration-300 hover:bg-black hover:shadow-2xl hover:shadow-sa-navy/30 disabled:cursor-not-allowed disabled:opacity-70 sm:gap-4 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm sm:h-9 sm:w-9 sm:rounded-xl">
                    {isLoading ? (
                      <svg className="h-4 w-4 animate-spin text-sa-navy sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Image
                        src="/google.svg"
                        alt="Google"
                        width={22}
                        height={22}
                        className="h-4 w-4 object-contain sm:h-5 sm:w-5"
                      />
                    )}
                  </span>
                  <span className="leading-tight">
                    {isLoading ? "Signing in…" : "Continue with Google"}
                  </span>
                  {!isLoading && (
                    <svg className="hidden h-5 w-5 transition-transform group-hover:translate-x-1 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700 ring-1 ring-red-100 sm:items-center sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 sm:mt-0 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3 sm:my-6">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[11px] text-sa-slate sm:text-xs">or</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Back link */}
              <div className="text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-sa-slate transition hover:text-sa-pink sm:gap-2 sm:text-sm"
                >
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to portal home
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
