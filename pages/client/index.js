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

export default function ClientPortal() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const createdEmail = credential.user.email ?? email.trim();
        const trimmedCompanyName = companyName.trim();

        await setDoc(doc(db, "clients", credential.user.uid), {
          email: createdEmail,
          name: trimmedCompanyName || null,
          website: website.trim() || null,
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
                  {mode === "signin" ? "Client Login" : "Create Account"}
                </h1>
              </div>
            </div>

            <div className="inline-flex rounded-full bg-slate-100 p-1 text-[11px] font-medium text-sa-slate">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`rounded-full px-3 py-1 transition ${
                  mode === "signin"
                    ? "bg-white text-sa-navy shadow-sm"
                    : "hover:text-sa-navy/80"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-full px-3 py-1 transition ${
                  mode === "signup"
                    ? "bg-white text-sa-navy shadow-sm"
                    : "hover:text-sa-navy/80"
                }`}
              >
                Create account
              </button>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-2 space-y-4 text-sm text-sa-slate"
          >
            {mode === "signup" && (
              <>
                <div className="space-y-1">
                  <label
                    htmlFor="companyName"
                    className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
                  >
                    Company name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="website"
                    className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
                  >
                    Website
                  </label>
                  <input
                    id="website"
                    type="text"
                    autoComplete="url"
                    placeholder="https://"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-[0.18em] text-sa-slate"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-sa-navy shadow-inner outline-none transition focus:border-sa-pink focus:bg-white focus:ring-2 focus:ring-sa-pink/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-sa-pink px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#ff0f80] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? mode === "signin"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "signin"
                ? "Sign in"
                : "Create account"}
            </button>

            {error && (
              <p className="text-xs text-red-600" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-emerald-600" role="status">
                {success}
              </p>
            )}
          </form>

          <div className="flex items-center justify-between pt-2 text-xs text-sa-slate">
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


