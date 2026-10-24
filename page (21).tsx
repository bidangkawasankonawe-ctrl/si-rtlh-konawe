"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { LogoMark, IconShield, IconAlert, IconCheck } from "@/components/icons";

const CREDENTIALS_HINT = [
  { role: "Super Admin", username: "superadmin", password: "super123" },
  { role: "Admin", username: "admin", password: "admin123" },
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm font-semibold text-ink-soft sm:px-6">
          Memuat halaman masuk…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp?.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal masuk");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
      {/* Panel kiri */}
      <div className="rounded-2xl bg-brand-900 p-8 text-white shadow-card lg:p-10">
        <div className="flex items-center gap-3">
          <LogoMark size={44} />
          <div>
            <div className="font-display text-lg font-bold">SI-RTLH</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-200">
              Kabupaten Konawe
            </div>
          </div>
        </div>
        <h1 className="mt-8 font-display text-2xl font-bold leading-snug sm:text-3xl">
          Portal Pengelolaan Data RTLH
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-brand-100">
          Masuk untuk mengelola status penanganan BNBA, sumber dana, rangkuman beranda,
          hingga audit perubahan data.
        </p>
        <ul className="mt-6 space-y-3 text-sm">
          {[
            "Kelola status: Usulan Baru → Tahap Verifikasi → Masuk SK → Selesai",
            "Sinkronisasi otomatis dari Google Form via Google Spreadsheet",
            "Status disimpan di database — spreadsheet form tetap aman",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-400 text-brand-950">
                <IconCheck size={11} />
              </span>
              <span className="text-brand-50">{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-line bg-surface p-8 shadow-card">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
          <IconShield size={14} className="text-brand-600" /> Akses Terbatas
        </div>
        <h2 className="mt-2 font-display text-xl font-bold text-ink">Masuk ke Admin</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Gunakan akun yang diberikan oleh Super Admin SI-RTLH.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-ink">Nama pengguna</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              placeholder="contoh: admin"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-ink">Kata sandi</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-lg border border-line bg-canvas/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] font-semibold text-red-700">
              <IconAlert size={14} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-700 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Memproses…" : "Masuk"}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-dashed border-line bg-canvas/60 p-3.5">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-soft">
            Akun demo (pengembangan)
          </div>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {CREDENTIALS_HINT.map((c) => (
              <button
                key={c.username}
                type="button"
                onClick={() => {
                  setUsername(c.username);
                  setPassword(c.password);
                }}
                className="rounded-md border border-line bg-surface px-2.5 py-2 text-left text-[11.5px] transition hover:border-brand-400"
              >
                <div className="font-bold text-brand-800">{c.role}</div>
                <div className="font-mono text-[11px] text-ink-soft">
                  {c.username} / {c.password}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Link href="/" className="mt-4 block text-center text-xs font-bold text-ink-soft hover:text-brand-800">
          ← Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
