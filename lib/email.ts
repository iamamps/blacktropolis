import nodemailer from "nodemailer";
import { Ticket, EventItem } from "@/types";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendTicketEmail(
  ticket: Ticket,
  event: EventItem,
  qrDataUrl: string
): Promise<void> {
  if (!ticket.buyerEmail || !process.env.SMTP_USER) return;

  const qrBase64 = qrDataUrl.split(",")[1];
  const dateLabel = event.date
    ? new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const html = `
  <div style="background:#050403;padding:32px;font-family:Arial,sans-serif;color:#f5f3ef;">
    <div style="max-width:480px;margin:0 auto;background:#0c0a06;border:1px solid #f2c14e40;border-radius:16px;padding:24px;text-align:center;">
      <h1 style="color:#f2c14e;font-size:22px;margin-bottom:4px;">BLACKTROPOLIS</h1>
      <p style="color:#9ca3af;margin-top:0;">Your ticket is confirmed</p>
      <h2 style="color:#ffffff;margin-bottom:4px;">${event.title}</h2>
      <p style="color:#9ca3af;margin:4px 0;">${dateLabel} ${event.time ? "· " + event.time : ""}</p>
      <p style="color:#9ca3af;margin:4px 0 20px;">${event.venueName ? event.venueName + " — " : ""}${event.city}, ${event.state}</p>
      <img src="cid:ticketqr" alt="Ticket QR" style="width:220px;height:220px;background:#fff;border-radius:12px;padding:12px;" />
      <p style="font-family:monospace;font-size:18px;color:#f2c14e;margin-top:16px;">${ticket.code}</p>
      <p style="color:#9ca3af;font-size:13px;">${ticket.quantity} ticket${ticket.quantity > 1 ? "s" : ""} · Show this code at the door</p>
    </div>
  </div>`;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: ticket.buyerEmail,
    subject: `Your ticket for ${event.title}`,
    html,
    attachments: qrBase64
      ? [
          {
            filename: "ticket-qr.png",
            content: qrBase64,
            encoding: "base64",
            cid: "ticketqr",
          },
        ]
      : [],
  });
}

export async function sendPasswordResetEmail(
  toEmail: string,
  name: string,
  resetUrl: string
): Promise<void> {
  if (!process.env.SMTP_USER) return;

  const html = `
  <div style="background:#050403;padding:32px;font-family:Arial,sans-serif;color:#f5f3ef;">
    <div style="max-width:480px;margin:0 auto;background:#0c0a06;border:1px solid #f2c14e40;border-radius:16px;padding:24px;text-align:center;">
      <h1 style="color:#f2c14e;font-size:22px;margin-bottom:4px;">BLACKTROPOLIS</h1>
      <p style="color:#9ca3af;margin-top:0;">Password Reset Request</p>
      <p style="color:#e5e7eb;margin:20px 0;">Hi ${name || "there"}, we received a request to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(90deg,#ffdb5e,#f2c14e);color:#0a0a0a;font-weight:bold;padding:12px 28px;border-radius:999px;text-decoration:none;">Reset Password</a>
      <p style="color:#6b7280;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>`;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: "Reset your Blacktropolis password",
    html,
  });
}
