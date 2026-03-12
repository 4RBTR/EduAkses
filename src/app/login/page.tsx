"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

const ROLE_DASHBOARDS: Record<string, string> = {
  TEACHER: "/dashboard/teacher",
  CLASS_LEADER: "/dashboard/leader",
  STUDENT: "/dashboard",
};

function RegisterSuccessMessage() {
  const searchParams = useSearchParams();
  if (searchParams.get("registered") === "true") {
    return (
      <div style={{ backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #10b981", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: 500, textAlign: "center" }}>
        Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.
      </div>
    );
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
        setIsLoading(false);
        return;
      }

      // Fetch session to get role for redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role || "STUDENT";
      const dashboardPath = ROLE_DASHBOARDS[role] || "/dashboard";

      router.push(dashboardPath);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#grad)" />
              <path
                d="M8 12h16M8 16h12M8 20h14"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>EduAkses</h1>
          <p>Masuk ke platform pembelajaran Anda</p>
        </div>

        {/* Success Message */}
        <Suspense fallback={null}>
          <RegisterSuccessMessage />
        </Suspense>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="login-spinner" />
            ) : (
              "Masuk"
            )}
          </button>

          <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#6b7280" }}>
             Belum punya akun? <Link href="/register" style={{ color: "#8b5cf6", fontWeight: 600, textDecoration: "none" }}>Daftar di sini</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
