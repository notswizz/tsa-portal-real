import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe =
  stripeSecretKey &&
  new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!stripe) {
    return res
      .status(500)
      .json({ error: "Stripe is not configured on the server." });
  }

  const { sessionId } = req.body || {};

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ error: "Deposit has not been successfully paid." });
    }

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? await stripe.paymentIntents.retrieve(session.payment_intent)
        : session.payment_intent;

    const meta = {
      ...(session.metadata || {}),
      ...(paymentIntent?.metadata || {}),
    };

    let staffByDate = {};
    try {
      staffByDate = meta.staffByDate ? JSON.parse(meta.staffByDate) : {};
    } catch {
      staffByDate = {};
    }

    const booking = {
      contactId: meta.contactId || "",
      showroomId: meta.showroomId || "",
      notes: meta.notes || "",
      showId: meta.showId || "",
      showName: meta.showName || "",
      date: meta.date || "",
      staffByDate,
      payment: {
        bookingFeeCents: Number(meta.bookingFeeCents || session.amount_total),
        bookingFeeCentsPaid: session.amount_total,
        paymentStatus: session.payment_status,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntent?.id || null,
        stripePaymentMethodId:
          (paymentIntent &&
            typeof paymentIntent.payment_method === "string" &&
            paymentIntent.payment_method) ||
          null,
        stripeCustomerId:
          (typeof session.customer === "string"
            ? session.customer
            : session.customer?.id) || null,
        currency: session.currency || "usd",
      },
    };

    return res.status(200).json({ booking });
  } catch (error) {
    console.error("Error completing Stripe booking", error);
    return res.status(500).json({ error: "Unable to complete booking." });
  }
}


