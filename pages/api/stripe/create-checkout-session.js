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

  try {
    const { clientId, clientEmail, booking } = req.body || {};

    if (!clientId || !booking) {
      return res.status(400).json({ error: "Missing booking data." });
    }

    const bookingFeeCents = parseInt(process.env.STRIPE_BOOKING_FEE_CENTS, 10) || 10000;

    const metadata = {
      clientId,
      contactId: booking.contactId || "",
      showroomId: booking.showroomId || "",
      showId: booking.showId || "",
      showName: booking.showName || "",
      notes: (booking.notes || "").slice(0, 200),
      date: booking.date || "",
      staffByDate: JSON.stringify(booking.staffByDate || {}),
      bookingFeeCents: String(bookingFeeCents),
    };

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || req.headers.origin || "";
    const baseUrl = origin.replace(/\/$/, "");

    // Check if customer already exists for this client
    let customerId = null;
    if (clientEmail) {
      const existingCustomers = await stripe.customers.list({
        email: clientEmail,
        limit: 1,
      });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create a new customer so we can charge them later
        const newCustomer = await stripe.customers.create({
          email: clientEmail,
          metadata: {
            clientId,
          },
        });
        customerId = newCustomer.id;
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: customerId || undefined,
      customer_email: !customerId ? clientEmail : undefined,
      customer_creation: !customerId ? "always" : undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Booking deposit",
            },
            unit_amount: bookingFeeCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/client/portal?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/client/portal?depositCanceled=1`,
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata,
      },
      metadata,
    });

    return res
      .status(200)
      .json({ sessionId: session.id, url: session.url || null });
  } catch (error) {
    console.error("Error creating Stripe Checkout Session", error);
    return res.status(500).json({ error: "Unable to create checkout session." });
  }
}


