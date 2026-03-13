import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const resourcePaths: Record<string, string> = {
  image: "/gallery",
  play: "/plays",
  ancestor: "/ancestors",
};

export async function sendCommentNotificationEmail(
  adminEmails: string[],
  commenterName: string,
  resourceType: string,
  resourceId: string,
  content: string
) {
  if (adminEmails.length === 0) return;

  const path = resourcePaths[resourceType] || `/${resourceType}`;
  const resourceUrl = `${appUrl}${path}/${resourceId}`;

  await resend.emails.send({
    from: "Mary Elizabeth Atwood <noreply@meamasque.com>",
    to: adminEmails,
    subject: `New comment from ${commenterName}`,
    html: `
      <h2>New Comment</h2>
      <p><strong>${commenterName}</strong> commented on a <strong>${resourceType}</strong>:</p>
      <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${content}</blockquote>
      <p><a href="${resourceUrl}">View it on the site</a></p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Mary Elizabeth Atwood <noreply@meamasque.com>",
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset for your account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
