import { Resend } from "resend";
import { db } from "@/db";
import { ancestors, images, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function buildResourceUrl(resourceType: string, resourceId: string): Promise<string> {
  if (resourceType === "ancestor") {
    const ancestor = await db.query.ancestors.findFirst({
      where: eq(ancestors.id, resourceId),
      columns: { slug: true },
    });
    return `${appUrl}/ancestors/${ancestor?.slug ?? resourceId}`;
  }
  if (resourceType === "play") return `${appUrl}/plays/${resourceId}`;
  if (resourceType === "image") {
    const result = await db
      .select({ categorySlug: categories.slug })
      .from(images)
      .leftJoin(categories, eq(images.categoryId, categories.id))
      .where(eq(images.id, resourceId))
      .limit(1);
    const slug = result[0]?.categorySlug;
    const base = slug ? `/gallery?category=${slug}` : "/gallery";
    return `${appUrl}${base}${slug ? "&" : "?"}image=${resourceId}`;
  }
  return `${appUrl}/${resourceType}/${resourceId}`;
}

export async function sendCommentNotificationEmail(
  adminEmails: string[],
  commenterName: string,
  resourceType: string,
  resourceId: string,
  content: string
) {
  if (adminEmails.length === 0) return;

  const resourceUrl = await buildResourceUrl(resourceType, resourceId);

  await resend.emails.send({
    from: "Mary Elizabeth Atwood <noreply@maryelizabethatwood.com>",
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

export async function sendLikeNotificationEmail(
  adminEmails: string[],
  userName: string,
  resourceType: string,
  resourceId: string
) {
  if (adminEmails.length === 0) return;

  const resourceUrl = await buildResourceUrl(resourceType, resourceId);

  await resend.emails.send({
    from: "Mary Elizabeth Atwood <noreply@maryelizabethatwood.com>",
    to: adminEmails,
    subject: `${userName} liked a ${resourceType}`,
    html: `
      <h2>New Like</h2>
      <p><strong>${userName}</strong> liked a <strong>${resourceType}</strong>.</p>
      <p><a href="${resourceUrl}">View it on the site</a></p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Mary Elizabeth Atwood <noreply@maryelizabethatwood.com>",
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
