import { csvEscape } from "@/lib/utils";
import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const supabase = createServerSupabase(token);

  const { data, error } = await supabase
    .from("scan_logs")
    .select("id, created_at, verified_by, user_email, source, qr_value")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const header = ["id", "created_at", "verified_by", "user_email", "source", "qr_value"];
  const rows = (data ?? []).map((row) =>
    [row.id, row.created_at, row.verified_by, row.user_email, row.source, row.qr_value].map(csvEscape).join(","),
  );

  return new NextResponse([header.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Disposition": "attachment; filename=FlearaasReport.csv",
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
