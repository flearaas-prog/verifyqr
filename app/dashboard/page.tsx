"use client";

import { ExportButton } from "@/components/ExportButton";
import { DailyReport } from "@/components/dashboard/DailyReport";
import { FraudPanel } from "@/components/dashboard/FraudPanel";
import { RecentScans } from "@/components/dashboard/RecentScans";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProtectedShell } from "@/components/Navbar";

import {
  getRecentFraudLogs,
} from "@/services/fraudService";

import {
  buildDailyReport,
  getFraudStatus,
  getStartOfToday,
  getStartOfWeek,
} from "@/services/reportService";

import {
  getRecentScans,
  getScanCount,
  getScansSince,
} from "@/services/scanService";

import type { FraudLog, ScanLog } from "@/types/scan";

import {
  Activity,
  Calendar,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Download,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

export default function DashboardPage() {

  const [count,setCount]=useState(0);

  const [scans,setScans]=useState<ScanLog[]>([]);

  const [todayScans,setTodayScans]=useState<ScanLog[]>([]);

  const [weekScans,setWeekScans]=useState<ScanLog[]>([]);

  const [fraudLogs,setFraudLogs]=useState<FraudLog[]>([]);

  const [loading,setLoading]=useState(true);

  const [error,setError]=useState("");

  const load=useCallback(async()=>{

      setLoading(true);

      setError("");

      try{

          const[
              nextCount,
              nextScans,
              nextToday,
              nextWeek,
              nextFrauds
          ]=await Promise.all([

              getScanCount(),

              getRecentScans(20),

              getScansSince(getStartOfToday()),

              getScansSince(getStartOfWeek()),

              getRecentFraudLogs(20)

          ]);
            console.log("Total:", nextCount);
            console.log("Recent:", nextScans);
            console.log("Today:", nextToday);
            console.log("Week:", nextWeek);
            console.log("Fraud:", nextFrauds);

          setCount(nextCount);

          setScans(nextScans);

          setTodayScans(nextToday);

          setWeekScans(nextWeek);

          setFraudLogs(nextFrauds);

      }catch(err){

          setError(err instanceof Error ? err.message : "Unable to load dashboard.");

      }finally{

          setLoading(false);

      }

  },[]);

  useEffect(()=>{

      load();

  },[load]);

  const latestScan=scans[0]
      ? new Date(scans[0].created_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})
      : "--";

  const fraudStatus=getFraudStatus(fraudLogs);

  const report=buildDailyReport(todayScans,fraudLogs);

  return(

      <ProtectedShell>

          <div className="dashboard-header">

              <div>

                  <p className="dashboard-kicker">
                      Flearaas Admin Dashboard
                  </p>

                  <h1>
                      Dashboard
                  </h1>

                  <span>
                      Live verification statistics
                  </span>

              </div>

              <div className="dashboard-actions">

            <button
                className="button secondary"
                onClick={load}
            >
                <RefreshCw size={18}/>
                Refresh
            </button>

            <ExportButton variant="secondary" />

        </div>

          </div>

          {error && <p className="error">{error}</p>}

          <div className="analytics-grid">

              <StatsCard
                  icon={<ShieldCheck size={24}/>}
                  label="Verified"
                  value={loading ? "..." : count}
              />

              <StatsCard
                  icon={<Calendar size={24}/>}
                  label="Today"
                  value={loading ? "..." : todayScans.length}
              />

              <StatsCard
                  icon={<Activity size={24}/>}
                  label="This Week"
                  value={loading ? "..." : weekScans.length}
              />

              <StatsCard
                  icon={<ShieldAlert size={24}/>}
                  label="Fraud Status"
                  value={loading ? "..." : fraudStatus}
              />

          </div>

          <DailyReport report={report}/>

          <div className="dashboard-panels">

              <FraudPanel
                  status={fraudStatus}
                  fraudLogs={fraudLogs}
              />

              <RecentScans
                  scans={scans}
              />

          </div>

      </ProtectedShell>

  );

}