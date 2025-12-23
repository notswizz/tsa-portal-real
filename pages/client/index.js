import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

async function hashPassword(rawPassword) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(rawPassword);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch (err) {
    console.error("Failed to hash password", err);
    return null;
  }
}

export default function ClientPortal() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [signupStep, setSignupStep] = useState(1); // 1 = company info, 2 = credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Reset signup step when switching modes
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSignupStep(1);
    setError("");
    setSuccess("");
  };

  const handleNextStep = () => {
    if (!companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }
    setError("");
    setSignupStep(2);
  };

  const handlePrevStep = () => {
    setError("");
    setSignupStep(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccess("Signed in successfully.");
      } else {
        // Check passwords match
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setIsSubmitting(false);
          return;
        }
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const createdEmail = credential.user.email ?? email.trim();
        const trimmedCompanyName = companyName.trim();
        const passwordHash = await hashPassword(password);

        await setDoc(doc(db, "clients", credential.user.uid), {
          email: createdEmail,
          name: trimmedCompanyName || null,
          website: website.trim() || null,
          passwordHash: passwordHash || null,
          createdAt: serverTimestamp(),
        });

        // Fire-and-forget request to send welcome email via Mailgun.
        // We intentionally don't block account creation if this fails.
        fetch("/api/client-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: createdEmail,
            companyName: trimmedCompanyName || null,
          }),
        }).catch((err) => {
          console.error("Failed to send welcome email:", err);
        });

        setSuccess("Account created. You are now signed in.");
      }

      router.push("/client/portal");
    } catch (err) {
      console.error(err);
      let message =
        "We couldn't process that request. Please check your details and try again.";

      if (err?.code === "auth/email-already-in-use") {
        message =
          "There is already an account with this email. Try signing in instead.";
      } else if (err?.code === "auth/invalid-email") {
        message = "That email doesn’t look quite right.";
      } else if (err?.code === "auth/weak-password") {
        message = "Please choose a slightly stronger password.";
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-sa-navy placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20 hover:border-slate-300 sm:rounded-xl";

  return (
    <>
      <Head>
        <title>Client Portal · The Smith Agency</title>
        <meta
          name="description"
          content="Client portal login for The Smith Agency."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="sa-portal-logo-pattern fixed inset-0 flex items-center justify-center overflow-hidden bg-sa-background px-3 py-6 sm:px-4 sm:py-8">
        {/* Top gradient accent bar */}
        <div className="fixed inset-x-0 top-0 z-50 h-1 bg-gradient-to-r from-sa-pink via-[#ff6bb3] to-sa-pink sm:h-1.5" />
        
        <div className="mx-auto w-full max-w-md animate-fade-in">
          {/* Main card */}
          <div className="sa-portal-frame max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-4rem)]">
            <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl bg-white p-6 shadow-soft sm:max-h-[calc(100vh-4rem)] sm:rounded-3xl sm:p-8">
              {/* Logo and branding */}
              <div className="mb-5 text-center sm:mb-6">
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
                  Client Portal
                </h1>
              </div>

              {/* Mode toggle */}
              <div className="mb-5 flex justify-center sm:mb-6">
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium text-sa-slate sm:text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleModeChange("signin")}
                    className={`rounded-lg px-4 py-2 transition-all sm:rounded-xl sm:px-5 ${
                      mode === "signin"
                        ? "bg-white text-sa-navy shadow-sm"
                        : "hover:text-sa-navy/80"
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("signup")}
                    className={`rounded-lg px-4 py-2 transition-all sm:rounded-xl sm:px-5 ${
                      mode === "signup"
                        ? "bg-white text-sa-navy shadow-sm"
                        : "hover:text-sa-navy/80"
                    }`}
                  >
                    Create account
                  </button>
                </div>
              </div>

              {/* Step indicator for signup */}
              {mode === "signup" && (
                <div className="mb-5 flex items-center justify-center gap-2 sm:mb-6">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    signupStep >= 1 ? "bg-sa-pink text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    1
                  </div>
                  <div className={`h-0.5 w-8 rounded-full transition-all ${
                    signupStep >= 2 ? "bg-sa-pink" : "bg-slate-200"
                  }`} />
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    signupStep >= 2 ? "bg-sa-pink text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    2
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* SIGN IN MODE - show all fields */}
                {mode === "signin" && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-sa-slate"
                      >
                        Email <span className="text-sa-pink">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className={`${inputClasses} pl-11`}
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs font-medium text-sa-slate"
                      >
                        Password <span className="text-sa-pink">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                        <input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className={`${inputClasses} pl-11`}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sa-pink to-[#ff5fa8] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sa-pink/25 transition-all duration-300 hover:shadow-xl hover:shadow-sa-pink/30 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="h-4 w-4 animate-spin sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in
                          <svg className="hidden h-5 w-5 transition-transform group-hover:translate-x-1 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* SIGN UP MODE - Step 1: Company Info */}
                {mode === "signup" && signupStep === 1 && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="companyName"
                        className="block text-xs font-medium text-sa-slate"
                      >
                        Company Name <span className="text-sa-pink">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </span>
                        <input
                          id="companyName"
                          type="text"
                          autoComplete="organization"
                          value={companyName}
                          onChange={(event) => setCompanyName(event.target.value)}
                          className={`${inputClasses} pl-11`}
                          placeholder="Your company name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="website"
                        className="block text-xs font-medium text-sa-slate"
                      >
                        Website <span className="text-slate-400">(optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </span>
                        <input
                          id="website"
                          type="text"
                          autoComplete="url"
                          placeholder="yourwebsite.com"
                          value={website}
                          onChange={(event) => setWebsite(event.target.value)}
                          className={`${inputClasses} pl-11`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sa-pink to-[#ff5fa8] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sa-pink/25 transition-all duration-300 hover:shadow-xl hover:shadow-sa-pink/30 sm:text-base"
                    >
                      Next
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </>
                )}

                {/* SIGN UP MODE - Step 2: Credentials */}
                {mode === "signup" && signupStep === 2 && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-sa-slate"
                      >
                        Email <span className="text-sa-pink">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className={`${inputClasses} pl-11`}
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs font-medium text-sa-slate"
                      >
                        Password <span className="text-sa-pink">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                        <input
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          required
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className={`${inputClasses} pl-11`}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-xs font-medium text-sa-slate"
                      >
                        Confirm Password <span className="text-sa-pink">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </span>
                        <input
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          required
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          className={`${inputClasses} pl-11`}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-sa-navy shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 sm:text-base"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sa-pink to-[#ff5fa8] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sa-pink/25 transition-all duration-300 hover:shadow-xl hover:shadow-sa-pink/30 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="h-4 w-4 animate-spin sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating...
                          </>
                        ) : (
                          <>
                            Create
                            <svg className="hidden h-5 w-5 transition-transform group-hover:translate-x-1 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700 ring-1 ring-red-100 sm:items-center sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 sm:mt-0 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-xs text-green-700 ring-1 ring-green-100 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
                    <svg className="h-4 w-4 flex-shrink-0 text-green-500 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {success}
                  </div>
                )}
              </form>

              {/* Divider and Back link - hide on signup step 2 since there's already a back button */}
              {!(mode === "signup" && signupStep === 2) && (
                <>
                  <div className="my-5 flex items-center gap-3 sm:my-6">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-[11px] text-sa-slate sm:text-xs">or</span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


