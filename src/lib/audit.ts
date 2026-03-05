import { db } from "@/db";
import { auditLogs } from "@/db/schema";

type AuditAction =
  | "login"
  | "login_failed"
  | "create"
  | "update"
  | "delete"
  | "page_view";

export async function logAudit(params: {
  userId?: string | null;
  userEmail: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  detail?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      userEmail: params.userEmail,
      action: params.action,
      resource: params.resource ?? null,
      resourceId: params.resourceId ?? null,
      detail: params.detail ?? null,
    });
  } catch (e) {
    // Never let audit logging break the main flow
    console.error("Audit log failed:", e);
  }
}
