import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      <section className="landing-card">

        <div className="logo-circle">
          ✓
        </div>

        <h1>VerifyQR</h1>

        <p className="subtitle">
          Secure QR Verification Platform
        </p>
    

        <Link href="/login" className="button">
          Admin Login
        </Link>

      </section>
    </main>
  );
}