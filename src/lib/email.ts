import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Meamasque <noreply@meamasque.com>",
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset for your Meamasque admin account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
