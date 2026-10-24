"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtDate } from "@/lib/format";
import { IconSearch } from "../icons";

type A = {
  id: number;
  username: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  createdAt: Date;
};

const ACTION_LABEL: Record<string, string> = {
  LOGIN: "Login",
  LOGOUT: "Logout",
  BNBA_UPDATE: "Perubahan BNBA",
  STATUS_CHANGE: "Perubahan Status",
  SUMBER_DANA_ADD: "Tambah Sumber Dana",
  SUMBER_DANA_UPDATE: "Ubah Sumber Dana",
  SUMBER_DANA_DELETE: "Hapus Sumber Dana",
  SUMBER_DANA_DEACTIVATE: "Nonaktifkan Sumber Dana",
  RANGKUMAN_UPDATE: "Ubah Rangkuman",
  STATUS_ADD: "Tambah Status",
  STATUS_UPDATE: "Ubah Status",
  STATUS_DELETE: "Hapus Status",
  USER_ADD: "Tambah Pengguna",
  USER_UPDATE: "Ubah Pengguna",
  USER_DELETE: "Hapus Pengguna",
  SYNC_SHEET: "Sinkronisasi Spreadsheet",
  SYNC_CSV: "Impor CSV",
  SEED: "Seed Data",
};

export function AuditTab() {
  const [rows, setRows] = useState<A[] | null>(null);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");

  useEffect(() => {
    fetch("/api/audit").then((r) => (r.ok ? r.json() : { rows: [] })).then((d) => setRows(d.rows));
  }, []);

  const actions = useMemo(
    () => [...new Set((rows ?? []).map((r) => r.action))].sort(),
    [rows],
  );

  const filtered = (rows ?? []).filter((r) => {
    if (action && r.action !== action) return false;
    const t = q.trim().toLowerCase();
    if (t && !(`${r.username} ${r.details ?? ""} ${r.entity ?? ""}`.toLowerCase().includes(t))) return false;
    return true;
  });

  return (
    <div className="rounded-xl border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <div className="text-sm font-bold text-ink">Audit Perubahan Data (Super Admin)</div>
          <div className="text-[11.5px] text-ink-soft">Jejak seluruh perubahan: login, status, sumber dana, pengguna, sinkronisasi.</div>
        </div>
        <div className="flex gap-2">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-lg border border-line bg-canvas/60 px-2.5 py-2 text-[12.5px] font-semibold outline-none"
          >
            <option value="">Semua aksi</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {ACTION_LABEL[a] ?? a}
              </option>
            ))}
          </select>
          <label className="relative">
            <IconSearch size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari…"
              className="w-40 rounded-lg border border-line bg-canvas/60 py-2 pl-8 pr-2 text-[12.5px] outline-none focus:border-brand-500"
            />
          </label>
        </div>
      </div>

      <div className="max-h-[560px] overflow-y-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="sticky top-0 bg-brand-50/95">
            <tr className="text-[11px] font-bold uppercase tracking-wider text-brand-900">
              <th className="px-5 py-2.5">Waktu</th>
              <th className="px-4 py-2.5">Pengguna</th>
              <th className="px-4 py-2.5">Aksi</th>
              <th className="px-4 py-2.5">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-line/70 hover:bg-brand-50/30">
                <td className="whitespace-nowrap px-5 py-2.5 text-[12px] font-semibold text-ink-soft">
                  {fmtDate(r.createdAt, true)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[12.5px] font-bold text-brand-800">@{r.username}</td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-800">
                    {ACTION_LABEL[r.action] ?? r.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[12.5px] text-ink">{r.details ?? "—"}</td>
              </tr>
            ))}
            {rows && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm font-semibold text-ink-soft">
                  Tidak ada log yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
