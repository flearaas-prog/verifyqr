import { supabase } from "@/lib/supabase/client";

export async function exportScansToCSV() {
  const { data, error } = await supabase
    .from("scan_logs")
    .select("*")
    .order("verified_at", { ascending: false });

  if (error) {
    alert("Unable to export CSV");
    return;
  }

  if (!data || data.length === 0) {
    alert("No scan data found.");
    return;
  }

  const headers = Object.keys(data[0]);

  const csv = [
    headers.join(","),
    ...data.map(row =>
      headers.map(h => `"${row[h as keyof typeof row] ?? ""}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `VerifyQR_Report_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  link.click();

  URL.revokeObjectURL(url);
}