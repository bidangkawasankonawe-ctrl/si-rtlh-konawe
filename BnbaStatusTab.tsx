"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "../StatusBadge";
import { IconCheck, IconSearch } from "../icons";

type Bnba = {
  id: number;
  nik: string;
  nama: string;
  kecamatan: string;
  desaKelurahan: string;
  statusId: number;
  statusName: string;
  statusColor: string;
  sumberDanaId: number | null;
  sumberDanaName: string | null;
};

export function BnbaStatusTab({ nonce }: { nonce: number }) {
  const [rows, setRows] = useState<Bnba[] | null>(null);
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([]);
  const [danas, setDanas] = useState<{ id: number; name: string; active: boolean }[]>([]);
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<Record<number, { statusId: string; danaId: string }>>({});
  const [note, setNote] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [msg, setMsg] = useState<Record<number, { ok: boolean; text: string }>>({});

  useEffect(() => {
    (async () => {
      const [b, s, d] = await Promise.all([
        fetch("/api/bnba").then((r) => r.json()),
        fetch("/api/statuses").then((r) => r.json()),
        fetch("/api/sumber-dana").then((r) => r.json()),
      ]);
      setRows(b.rows);
      setStatuses(s.rows);
      setDanas(d.rows.filter((x: { active: boolean }) => x.active));
    })();
  }, [nonce]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const t = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        !t ||
        r.nama.toLowerCase().includes(t) ||
        r.nik.includes(t) ||
        r.kecamatan.toLowerCase().includes(t) ||
        r.desaKelurahan.toLowerCase().includes(t),
    );
  }, [rows, q]);

  const getPick = (r: Bnba) =>
    pick[r.id] ?? {
      statusId: String(r.statusId),
      danaId: String(r.sumberDanaId ?? "null"),
    };

  const isDirty = (r: Bnba) => {
    const p = getPick(r);
    return p.statusId !== String(r.statusId) || p.danaId !== String(r.sumberDanaId ?? "null");
  };

  async function save(r: Bnba) {
    const p = getPick(r);
    setSaving(r.id);
    setMsg((m) => ({ ...m, [r.id]: { ok: true, text: "Menyimpan…" } }));
    try {
      const res = await fetch(`/api/bnba/${r.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusId: Number(p.statusId),
          sumberDanaId: p.danaId === "null" ? null : Number(p.danaId),
          note: note[r.id]?.trim() || undefined,
        }),
      });
      const data = await res.json();
      setMsg((m) => ({
        ...m,
        [r.id]: res.ok
          ? { ok: true, text: data.message ?? data.changed ?? "Tersimpan." }
          : { ok: false, text: data.error ?? "Gagal menyimpan" },
      }));
      if (res.ok) {
        setRows((rs) =>
          rs
            ? rs.map((x) =>
                x.id === r.id
                  ? {
                      ...x,
                      statusId: Number(p.statusId),
                      statusName: statuses.find((s) => s.id === Number(p.statusId))?.name ?? x.statusName,
                      statusColor: x.statusColor,
                      sumberDanaId: p.danaId === "null" ? null : Number(p.danaId),
                      sumberDanaName:
                        p.danaId === "null"
                          ? null
                          : danas.find((d) => d.id === Number(p.danaId))?.name ?? null,
                    }
                  : x,
              )
            : rs,
        );
        setNote((n2) => ({ ...n2, [r.id]: "" }));
        setTimeout(() => setMsg((m) => ({ ...m, [r.id]: { ok: true, text: "" } })), 4000);
      }
    } catch {
      setMsg((m) => ({ ...m, [r.id]: { ok: false, text: "Kesalahan jaringan" } }));
    } finally {
      setSaving(null);
    }
  }

  if (!rows) {
    return <div className="rounded-xl border border-line bg-surface p-10 text-center text-sm font-semibold text-ink-soft shadow-card">Memuat data…</div>;
  }

  return (
    <div className="rounded-xl border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <div className="text-sm font-bold text-ink">Kelola Status BNBA</div>
          <div className="text-[11.5px] text-ink-soft">
            Perubahan status & sumber dana tercatat otomatis di riwayat dan audit log.
          </div>
        </div>
        <label className="relative">
          <IconSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari penerima…"
            className="w-64 rounded-lg border border-line bg-canvas/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-brand-50/60 text-[11px] font-bold uppercase tracking-wider text-brand-900">
              <th className="px-5 py-3">Penerima</th>
              <th className="px-4 py-3">Status Sekarang</th>
              <th className="px-4 py-3">Ubah Status</th>
              <th className="px-4 py-3">Sumber Dana</th>
              <th className="px-4 py-3">Catatan (opsional)</th>
              <th className="px-4 py-3 text-right">Simpan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const p = getPick(r);
              const m = msg[r.id];
              return (
                <tr key={r.id} className="border-b border-line/70 align-top last:border-0 hover:bg-brand-50/30">
                  <td className="px-5 py-3">
                    <Link href={`/data-bnba/${r.id}`} className="font-bold text-ink hover:text-brand-800">
                      {r.nama}
                    </Link>
                    <div className="text-[11px] text-ink-soft">
                      {r.desaKelurahan}, {r.kecamatan}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge name={r.statusName} color={r.statusColor} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.statusId}
                      onChange={(e) => setPick((s) => ({ ...s, [r.id]: { ...getPick(r), statusId: e.target.value } }))}
                      className="w-44 rounded-lg border border-line bg-canvas/60 px-2.5 py-2 text-[13px] font-semibold outline-none focus:border-brand-500"
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.danaId}
                      onChange={(e) => setPick((s) => ({ ...s, [r.id]: { ...getPick(r), danaId: e.target.value } }))}
                      className="w-48 rounded-lg border border-line bg-canvas/60 px-2.5 py-2 text-[13px] font-semibold outline-none focus:border-brand-500"
                    >
                      <option value="null">Belum ditentukan</option>
                      {danas.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={note[r.id] ?? ""}
                      onChange={(e) => setNote((n) => ({ ...n, [r.id]: e.target.value }))}
                      placeholder="mis. SK nomor …"
                      className="w-44 rounded-lg border border-line bg-canvas/60 px-2.5 py-2 text-[12.5px] outline-none focus:border-brand-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-end gap-1">
                      <button
                        disabled={!isDirty(r) || saving === r.id}
                        onClick={() => save(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        {saving === r.id ? "Menyimpan…" : (
                          <>
                            <IconCheck size={12} /> Simpan
                          </>
                        )}
                      </button>
                      {m?.text && (
                        <span className={"text-[10.5px] font-bold " + (m.ok ? "text-emerald-700" : "text-red-600")}>
                          {m.text}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm font-semibold text-ink-soft">
                  Tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
