"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fmtDate } from "@/lib/format";
import { IconChart, IconRefresh, IconChevronRight, IconGrid } from "../icons";

type Me = { id: number; username: string; fullName: string; role: "admin" | "superadmin" };

export function OverviewTab({ user, goToTab, refresh }: { user: Me; goToTab: (t: string) => void; refresh: () => void }) {
  const [data, setData] = useState<{ total: number; perStatus: { name: string; color: string; count: number }[]; rekap: { kecamatan: string; total: number }[] } | null>(null);
  const [audit, setAudit] = useState<{ id: number; username: string; action: string; details: string; createdAt: Date }[] | null>(null);
  const [sync, setSync] = useState<{ message: string; createdAt: Date; rowsTotal: number }[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, a, y] = await Promise.all([
          fetch("/api/stats").then((r) => r.json()),
          fetch("/api/audit").then((r) => (r.ok ? r.json() : { rows: [] })),
          fetch("/api/sync").then((r) => (r.ok ? r.json() : { rows: [] })),
        ]);
        setData(s.stats);
        setAudit(a.rows.slice(0, 6));
        setSync(y.rows.slice(0, 3));
      } catch {
        /* offline */
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Total BNBA</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums text-brand-800">
            {data?.total ?? "…"}
          </div>
        </div>
        {(data?.perStatus ?? []).map((s) => (
          <div key={s.name} className="rounded-xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </div>
            <div className="mt-1 font-display text-3xl font-bold tabular-nums" style={{ color: s.color }}>
              {s.count}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
            <IconGrid size={14} className="text-brand-600" /> Aksi cepat
          </div>
          <div className="mt-3 space-y-2">
            {[
              { tab: "status-bnba", label: "Kelola status BNBA", desc: "Perbarui status & sumber dana per penerima" },
              { tab: "sumber-dana", label: "Kelola sumber dana", desc: "Tambah / ubah / matikan sumber dana" },
              { tab: "rangkuman", label: "Edit rangkuman beranda", desc: "Judul, tahun, anggaran, dan narasi" },
              { tab: "sync", label: "Sinkronisasi data", desc: "Ambil data terbaru dari Google Spreadsheet" },
              ...(user.role === "superadmin"
                ? [{ tab: "users", label: "Kelola pengguna", desc: "Tambah / hapus akun dan hak akses" }]
                : []),
            ].map((a) => (
              <button
                key={a.tab}
                onClick={() => goToTab(a.tab)}
                className="group flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-canvas/50 px-3.5 py-2.5 text-left transition hover:border-brand-400 hover:bg-brand-50"
              >
                <span>
                  <span className="block text-[13px] font-bold text-ink group-hover:text-brand-900">{a.label}</span>
                  <span className="block text-[11px] text-ink-soft">{a.desc}</span>
                </span>
                <IconChevronRight size={14} className="shrink-0 text-line group-hover:text-brand-600" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
            <IconChart size={14} className="text-brand-600" /> Kecamatan dengan data terbanyak
          </div>
          <ul className="mt-3 space-y-2">
            {(data?.rekap ?? []).slice(0, 7).map((k, i) => (
              <li key={k.kecamatan} className="flex items-center gap-3 text-[13px]">
                <span className="w-5 text-right font-display font-bold text-ink-soft">{i + 1}.</span>
                <span className="flex-1 truncate font-semibold">{k.kecamatan}</span>
                <span className="font-display font-bold tabular-nums text-brand-800">{k.total}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                <IconRefresh size={14} className="text-brand-600" /> Sinkron terakhir
              </div>
              <button onClick={refresh} className="text-[11px] font-bold text-brand-700 hover:underline">
                Muat ulang
              </button>
            </div>
            {sync && sync.length > 0 ? (
              <div className="mt-2 space-y-2">
                {sync.map((s, i) => (
                  <div key={i} className="rounded-lg bg-canvas/70 px-3 py-2 text-[11.5px]">
                    <span className="font-bold text-ink">{fmtDate(s.createdAt, true)}</span>
                    <span className="text-ink-soft"> — {s.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[12px] italic text-ink-soft">Belum ada log sinkronisasi (data awal dari seed).</p>
            )}
          </div>

          <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">Aktivitas terbaru</div>
              {user.role === "superadmin" && (
                <button onClick={() => goToTab("audit")} className="text-[11px] font-bold text-brand-700 hover:underline">
                  Semua log
                </button>
              )}
            </div>
            {audit && audit.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {audit.map((a) => (
                  <li key={a.id} className="truncate rounded-md bg-canvas/60 px-2.5 py-1.5 text-[11.5px]">
                    <span className="font-bold text-brand-800">@{a.username}</span>{" "}
                    <span className="text-ink-soft">{a.details ?? a.action}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[12px] italic text-ink-soft">Belum ada aktivitas.</p>
            )}
          </div>

          <Link
            href="/"
            className="block rounded-xl border border-dashed border-line bg-surface/60 p-4 text-center text-xs font-bold text-ink-soft hover:border-brand-400 hover:text-brand-800"
          >
            Lihat tampilan publik (Beranda) →
          </Link>
        </div>
      </div>
    </div>
  );
}
