import { sendClientWelcomeEmail } from "@/lib/mailgunClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, companyName } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await sendClientWelcomeEmail({
      to: email,
      companyName: companyName || null,
    });

    return res.status(200).json({ success: true, id: result?.id || null });
  } catch (error) {
    console.error("Error sending welcome email via Mailgun:", error);
    return res
      .status(500)
      .json({ error: "Failed to send welcome email. Please try again later." });
  }
}

