"use client";

import { useState } from "react";

export function CollapseToggle() {
  const [allOpen, setAllOpen] = useState(true);

  function toggleAll() {
    const next = !allOpen;
    setAllOpen(next);
    document
      .querySelectorAll("article details")
      .forEach((el) => ((el as HTMLDetailsElement).open = next));
  }

  return (
    <button
      onClick={toggleAll}
      className="text-sm text-gray-500 hover:text-gray-700"
    >
      {allOpen ? "Collapse All" : "Expand All"}
    </button>
  );
}
