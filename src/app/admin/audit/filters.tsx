"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const actions = [
  { value: "", label: "All actions" },
  { value: "login", label: "Login" },
  { value: "login_failed", label: "Login failed" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "page_view", label: "Page view" },
];

export function AuditFilters({
  currentAction,
  currentPage,
  totalPages,
}: {
  currentAction: string;
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();

  function navigate(action: string, page: number) {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.push(`/admin/audit${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <Select
        value={currentAction || "all"}
        onValueChange={(v) => navigate(v === "all" ? "" : v, 1)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by action" />
        </SelectTrigger>
        <SelectContent>
          {actions.map((a) => (
            <SelectItem key={a.value || "all"} value={a.value || "all"}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage <= 1}
            onClick={() => navigate(currentAction, currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => navigate(currentAction, currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
