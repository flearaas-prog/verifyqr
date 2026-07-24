"use client";

import { formatDateTime } from "@/lib/utils";
import type { ScanLog } from "@/types/scan";
import { History } from "lucide-react";

export function RecentScans({
  scans,
}: {
  scans: ScanLog[];
}) {
  return (
    <section className="dashboard-panel">

      <div className="panel-header">

        <div className="panel-title">

          <History size={22} />

          <h2>Recent Verifications</h2>

        </div>

      </div>

      <div className="table-wrap">

        <table>

          <thead>

            <tr>

              <th>Time</th>

              <th>Admin</th>

              <th>Source</th>

              <th>ID</th>

            </tr>

          </thead>

          <tbody>

            {scans.length === 0 ? (

              <tr>

                <td colSpan={4} className="muted">

                  No verifications yet.

                </td>

              </tr>

            ) : (

              scans.map((scan) => (

                <tr key={scan.id}>

                  <td>{formatDateTime(scan.created_at)}</td>

                  <td>{scan.user_email ?? "Unknown"}</td>

                  <td>{scan.source}</td>
                  
                  <td>{String(scan.id).slice(0, 8)}...</td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </section>
  );
}