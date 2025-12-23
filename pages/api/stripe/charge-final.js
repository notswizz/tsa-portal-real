import Stripe from "stripe";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const internalKey = process.env.INTERNAL_ADMIN_API_KEY;

const stripe =
  stripeSecretKey &&
  new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

export default async function handler(req, res) {
  const isPost = req.method === "POST";

  if (!stripe) {
    return res
      .status(500)
      .json({ error: "Stripe is not configured on the server." });
  }

  // Basic shared-secret auth so only the admin backend can call this.
  if (internalKey) {
    const headerKey = req.headers["x-internal-key"];
    if (!headerKey || headerKey !== internalKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    const {
      bookingId,
      finalFeeCents,
      dryRun,
      overrideRateCents,
      overrideAmountCents,
    } = isPost ? req.body || {} : req.query || {};

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    const isDryRun =
      dryRun === true || String(dryRun).toLowerCase() === "true";

    // Support both old/new override field names
    const overrideCents =
      typeof overrideAmountCents === "number"
        ? overrideAmountCents
        : typeof overrideRateCents === "number"
        ? overrideRateCents
        : undefined;

    // Load booking data from Firestore
    const bookingRef = doc(db, "bookings", bookingId);
    const snap = await getDoc(bookingRef);

    if (!snap.exists()) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = snap.data();

    // Compute staff-day totals from datesNeeded
    const datesNeeded = Array.isArray(booking.datesNeeded)
      ? booking.datesNeeded
      : [];

    const totalStaffDays = datesNeeded.reduce(
      (sum, item) => sum + (Number(item.staffCount) || 0),
      0
    );

    const ratePerDayCents = 300 * 100; // $300/day
    const finalTotalCents = totalStaffDays * ratePerDayCents;

    const depositCents =
      typeof booking.bookingFeeCentsPaid === "number"
        ? booking.bookingFeeCentsPaid
        : typeof booking.bookingFeeCents === "number"
        ? booking.bookingFeeCents
        : 10000;

    const computedDueCents = Math.max(finalTotalCents - depositCents, 0);

    const amountToChargeCents =
      typeof overrideCents === "number"
        ? overrideCents
        : typeof finalFeeCents === "number"
        ? finalFeeCents
        : computedDueCents;

    const computed = {
      totalCents: amountToChargeCents,
      baseTotalCents: finalTotalCents,
      depositCents,
      totalStaffDays,
      staffDays: totalStaffDays,
      rateCents: ratePerDayCents,
      currency: booking.currency || "usd",
    };

    if (isDryRun) {
      return res.status(200).json({
        dryRun: true,
        computed,
        amountToChargeCents,
      });
    }

    if (!amountToChargeCents || amountToChargeCents <= 0) {
      return res.status(400).json({
        error: "Nothing to charge; final amount is zero or negative.",
        computed,
      });
    }

    let customerId = booking.stripeCustomerId || null;
    let paymentMethodId = booking.stripePaymentMethodId || null;

    // Best-effort recovery for older bookings:
    // 1) look up the original Checkout Session (if present)
    // 2) fall back to the original deposit PaymentIntent (if present)
    if ((!customerId || !paymentMethodId) && booking.stripeCheckoutSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(
          booking.stripeCheckoutSessionId,
          { expand: ["payment_intent"] }
        );

        if (!customerId && session.customer) {
          customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer.id;
        }

        let pi =
          typeof session.payment_intent === "string"
            ? await stripe.paymentIntents.retrieve(session.payment_intent)
            : session.payment_intent || null;

        if (!paymentMethodId && pi) {
          if (typeof pi.payment_method === "string") {
            paymentMethodId = pi.payment_method;
          } else if (pi.payment_method && pi.payment_method.id) {
            paymentMethodId = pi.payment_method.id;
          }
        }
      } catch (e) {
        console.error(
          "Error attempting to recover Stripe customer/payment method from Checkout Session:",
          e
        );
      }
    }

    if (
      (!customerId || !paymentMethodId) &&
      booking.stripePaymentIntentId
    ) {
      try {
        const pi = await stripe.paymentIntents.retrieve(
          booking.stripePaymentIntentId
        );

        if (!customerId && pi.customer) {
          customerId =
            typeof pi.customer === "string"
              ? pi.customer
              : pi.customer.id;
        }

        if (!paymentMethodId && pi.payment_method) {
          if (typeof pi.payment_method === "string") {
            paymentMethodId = pi.payment_method;
          } else if (pi.payment_method.id) {
            paymentMethodId = pi.payment_method.id;
          }
        }
      } catch (e) {
        console.error(
          "Error attempting to recover Stripe customer/payment method from PaymentIntent:",
          e
        );
      }
    }

    // Persist any recovered values back to Firestore for future calls
    if (customerId || paymentMethodId) {
      try {
        await updateDoc(bookingRef, {
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          ...(paymentMethodId ? { stripePaymentMethodId: paymentMethodId } : {}),
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Error updating booking with recovered Stripe IDs:", e);
      }
    }

    if (!customerId || !paymentMethodId) {
      return res.status(400).json({
        error:
          "Missing Stripe customer or payment method on this booking. Ensure the deposit was paid via the client portal.",
        computed,
      });
    }

    // Create a new off-session PaymentIntent for the final charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountToChargeCents,
      currency: booking.currency || "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        bookingId,
        type: "final_charge",
      },
    });

    let requiresAction = false;
    let actionUrl = null;

    if (
      paymentIntent.status === "requires_action" &&
      paymentIntent.next_action &&
      paymentIntent.next_action.type === "redirect_to_url" &&
      paymentIntent.next_action.redirect_to_url?.url
    ) {
      requiresAction = true;
      actionUrl = paymentIntent.next_action.redirect_to_url.url;
    }

    // On success, update payment status + store final charge info
    // Note: paymentStatus tracks payment state, status tracks booking workflow state
    if (paymentIntent.status === "succeeded") {
      await updateDoc(bookingRef, {
        paymentStatus: "final_paid",
        finalChargeCents: amountToChargeCents,
        finalChargePaymentIntentId: paymentIntent.id,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      dryRun: false,
      success: paymentIntent.status === "succeeded",
      requiresAction,
      url: actionUrl,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      computed,
    });
  } catch (error) {
    console.error("Error charging final Stripe payment:", error);
    return res.status(500).json({
      error: "Unable to process final charge.",
      details: error?.message || String(error),
    });
  }
}


