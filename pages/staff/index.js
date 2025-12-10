import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";

const STAFF_DOMAIN =
  process.env.NEXT_PUBLIC_STAFF_GOOGLE_DOMAIN?.toLowerCase().trim() || "";

export default function StaffPortal() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
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
            // keep a lightweight updatedAt touch on sign-in
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
    } catch (err) {
      console.error("Error during staff Google login", err);
      setError(
        "We couldn't complete your sign in. Please try again or contact the office."
      );
    } finally {
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

      <div className="flex min-h-screen items-center justify-center bg-sa-background px-4">
        <div className="w-full max-w-lg space-y-6 rounded-3xl bg-sa-card p-8 shadow-soft ring-1 ring-slate-100/80">
          <div className="flex items-center justify-between gap-3">
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
                  Staff Login
                </h1>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4 text-sm text-sa-slate">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-4 rounded-2xl bg-[#0F172A] px-6 py-3.5 text-base font-semibold text-white shadow-soft ring-1 ring-slate-900/40 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-white">
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={22}
                  height={22}
                  className="h-5 w-5 object-contain"
                />
              </span>
              <span className="leading-tight">
                {isLoading ? "Signing in with Google…" : "Sign in with Google"}
              </span>
            </button>

            {error && (
              <p className="text-xs text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-start pt-2 text-xs text-sa-slate">
            <Link
              href="/"
              className="font-medium text-sa-pink underline-offset-4 hover:underline"
            >
              ← Back to portal home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
