"use client";

import { useAuth } from "@/context/AuthContext";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";

export function ExportButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  async function downloadCsv() {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const response = await fetch("/api/export", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        throw new Error("Unable to export CSV.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FlearaasReport.csv";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="dashboard-download-btn"
      disabled={loading}
      onClick={downloadCsv}
      type="button"
    >
      <FileSpreadsheet size={18} />
      {loading ? "Exporting..." : "CSV"}
    </button>
  );
}
