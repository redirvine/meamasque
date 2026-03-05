import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc, eq, count, SQL } from "drizzle-orm";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AuditFilters } from "./filters";

const PAGE_SIZE = 50;

const actionColors: Record<string, string> = {
  login: "bg-green-100 text-green-800",
  login_failed: "bg-red-100 text-red-800",
  create: "bg-blue-100 text-blue-800",
  update: "bg-amber-100 text-amber-800",
  delete: "bg-red-100 text-red-700",
  page_view: "bg-gray-100 text-gray-700",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    redirect("/admin");
  }

  const params = await searchParams;
  const actionFilter = params.action || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const conditions: SQL[] = [];
  if (actionFilter) {
    conditions.push(eq(auditLogs.action, actionFilter as "login"));
  }

  const where = conditions.length > 0 ? conditions[0] : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(auditLogs)
    .where(where);

  const logs = await db
    .select()
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track logins, content changes, and page views.
        </p>
      </div>

      <AuditFilters currentAction={actionFilter} currentPage={page} totalPages={totalPages} />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No audit log entries found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-gray-500">
                    {log.createdAt.toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    {log.createdAt.toLocaleTimeString("en-AU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-sm">{log.userEmail}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={actionColors[log.action] || ""}
                    >
                      {log.action.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {log.resource || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                    {log.detail || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Page {page} of {totalPages} ({total} entries)
        </div>
      )}
    </div>
  );
}
