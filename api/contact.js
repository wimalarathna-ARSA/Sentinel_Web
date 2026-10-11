// Vercel serverless function: POST /api/contact
// Sends the Contact Us form through Gmail SMTP (nodemailer).
//
// Delivery rule: messages go to the site Gmail account. Reply-To is the
// visitor's address so the team can respond directly.
//
// REQUIRED Vercel environment variables (Project → Settings → Environment Variables):
//   CONTACT_EMAIL_USER  = Gmail address that sends the mail  (e.g. chamilasewmini2@gmail.com)
//   CONTACT_EMAIL_PASS  = Gmail APP password (16 letters from myaccount.google.com → App passwords)
//
// The password is NEVER committed to the repo — it lives only in Vercel's env settings.
const nodemailer = require("nodemailer");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LEN = 5000;

function bad(res, msg) {
  return res.status(400).json({ ok: false, error: msg });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return bad(res, "Invalid request body.");
    }
  }
  body = body || {};

  const firstName = String(body.firstName || "").trim().slice(0, 100);
  const lastName = String(body.lastName || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 200);
  const subject = String(body.subject || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, MAX_LEN);

  if (!firstName || !lastName || !subject || !message) {
    return bad(res, "Please complete every field.");
  }
  if (!EMAIL_RE.test(email)) {
    return bad(res, "Please provide a valid email address.");
  }

  const user = process.env.CONTACT_EMAIL_USER;
  const pass = process.env.CONTACT_EMAIL_PASS;
  if (!user || !pass) {
    return res
      .status(500)
      .json({ ok: false, error: "Mail service is not configured yet." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Sentinel AIOps Website" <${user}>`,
      to: [user, email],
      replyTo: email,
      subject: `[Website] ${subject}`,
      text:
        `New contact form message from ${firstName} ${lastName}.\n\n` +
        `Email: ${email}\n` +
        `Subject: ${subject}\n\n` +
        `${message}\n`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact mail failed:", err && err.message);
    return res
      .status(502)
      .json({ ok: false, error: "Could not deliver the message. Try again later." });
  }
};
