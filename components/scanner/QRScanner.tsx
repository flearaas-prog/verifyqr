'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { verifyScan } from '@/services/verifyService';
import ScanResult from './ScanResult';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ExportButton } from '@/components/ExportButton';
import Link from "next/link";

export default function QRScanner() {
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [count, setCount] = useState<number>(0);
  const [scanning, setScanning] = useState<boolean>(true);
  
  const audioSuccess = useRef<HTMLAudioElement | null>(null);
  const audioError = useRef<HTMLAudioElement | null>(null);
  
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { count: total } = await supabase
          .from('scan_logs')
          .select('*', { count: 'exact', head: true });
        setCount(total ?? 0);
      } catch (error) {
        console.error('Failed to fetch count', error);
      }
    };
    fetchCount();
  }, []);

  const handleScan = useCallback(async (text: string) => {
    if (!scanning) return;
    setScanning(false);

    const scannedData = text.trim().replace(/\/$/, "");
    const expected = process.env.NEXT_PUBLIC_MASTER_QR!.replace(/\/$/, "");
    console.log("SCANNED QR:", scannedData);
    console.log("EXPECTED:", expected);
    console.log("MATCH:", scannedData === expected);
    if (scannedData === expected) {
      try {
        const { count: newCount } = await verifyScan(scannedData);
        setCount(newCount);
        setResult('success');
        if (audioSuccess.current) {
          audioSuccess.current.currentTime = 0;
          audioSuccess.current.play().catch(e => console.error('Audio play failed', e));
        }
      } catch (error) {
        console.error('Scan verify failed', error);
        setResult('error');
        if (audioError.current) {
          audioError.current.currentTime = 0;
          audioError.current.play().catch(e => console.error('Audio play failed', e));
        }
      }
    } else {
      setResult('error');
      if (audioError.current) {
        audioError.current.currentTime = 0;
        audioError.current.play().catch(e => console.error('Audio play failed', e));
      }
    }

    setTimeout(() => {
      setResult(null);
      setScanning(true);
    }, 2500);
  }, [scanning]);

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  return (
    <div className="scanner-fullscreen">
      {/* Hidden audio elements */}
      <audio ref={audioSuccess} src="/success.mp3" preload="auto" />
      <audio ref={audioError} src="/error.mp3" preload="auto" />

      {/* Top bar */}
      <div className="scanner-topbar">
        <div className="scanner-brand">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>FlearaasQR</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>

  <button
    className="scanner-logout-btn"
    onClick={() => router.push("/dashboard")}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
    <span>Dashboard</span>
  </button>

  <button
    className="scanner-logout-btn"
    onClick={handleSignOut}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
    <span>Sign Out</span>
  </button>

</div>
      </div>

      {/* Camera area */}
      <div className="scanner-camera-area">
        <div className="scanner-viewfinder">
          {/* Corner brackets */}
          <div className="scanner-corner scanner-corner-tl" />
          <div className="scanner-corner scanner-corner-tr" />
          <div className="scanner-corner scanner-corner-bl" />
          <div className="scanner-corner scanner-corner-br" />
          
          {/* Animated scan line */}
          <div className="scanner-line" />
          
          {/* The actual scanner component */}
          <Scanner
            onScan={(results) => {
              const text = results?.[0]?.rawValue;
              if (text) handleScan(text);
            }}
            allowMultiple
            scanDelay={1000}
            styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
          />
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="scanner-bottom">
        <div className="scanner-counter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{count} Verified</span>
        </div>
        <p className="scanner-hint">Point camera at QR code to verify</p>
      </div>

      {/* Scan result overlay */}
      {result && <ScanResult type={result} />}
    </div>
  );
}