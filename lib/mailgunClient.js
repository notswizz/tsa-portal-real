import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  // For EU domains, you may need:
  // url: "https://api.eu.mailgun.net",
});

export async function sendClientWelcomeEmail({ to, companyName }) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN || !process.env.MAILGUN_FROM_EMAIL) {
    console.warn(
      "Mailgun environment variables are not fully configured. Skipping welcome email."
    );
    return;
  }

  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL;

  return mg.messages.create(domain, {
    from,
    to: [to],
    subject: "The Smith Agency - Client Portal",
    // Use the stored Mailgun template you created.
    // Make sure this string matches the template name in Mailgun.
    template: "client portal account creation",
    // Pass variables into the template.
    "h:X-Mailgun-Variables": JSON.stringify({
      companyName: companyName || "Client",
      email: to,
    }),
  });
}

