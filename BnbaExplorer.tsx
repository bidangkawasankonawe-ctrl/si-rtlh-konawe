"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BnbaRow } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";
import { IconSearch, IconDownload, IconChevronRight, IconMapPin, IconX } from "./icons";

const PAGE_SIZE = 10;

export function BnbaExplorer({
  rows,
  statuses,
  sumberDana,
  kecamatans,
  desas,
  initial,
}: {
  rows: BnbaRow[];
  statuses: { id: number; name: string; color: string; sortOrder: number }[];
  sumberDana: { id: number; name: string; active: boolean }[];
  kecamatans: string[];
  desas: string[];
  initial: { q: string; kecamatan: string; desa: string; status: string; sumber: string };
}) {
  const [q, setQ] = useState(initial.q);
  const [kecamatan, setKecamatan] = useState(initial.kecamatan);
  const [desa, setDesa] = useState(initial.desa);
  const [status, setStatus] = useState(initial.status);
  const [sumber, setSumber] = useState(initial.sumber);
  const [page, setPage] = useState(1);

  const desaOptions = useMemo(
    () => (kecamatan ? desas.filter((d) => rows.some((r) => r.kecamatan === kecamatan && r.desaKelurahan === d)) : desas),
    [kecamatan, desas, rows],
  );

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (kecamatan && r.kecamatan !== kecamatan) return false;
      if (desa && r.desaKelurahan !== desa) return false;
      if (status && String(r.statusId) !== status) return false;
      if (sumber === "none") {
        if (r.sumberDanaId !== null) return false;
      } else if (sumber && String(r.sumberDanaId ?? "none") !== sumber) return false;
      if (t) {
        const hay = [r.nama, r.nik, r.kecamatan, r.desaKelurahan, r.alamat, r.pekerjaan]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [rows, q, kecamatan, desa, status, sumber]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilter = q || kecamatan || desa || status || sumber;

  const setFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-900">Data BNBA</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Data pendataan penerima bantuan RTLH — sumber: Google Form → Google Spreadsheet → Database status.
          </p>
        </div>
        <a
          href="/api/export"
          className="inline-flex items-center gap-2 rounded-lg border border-brand-700 bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-card hover:bg-brand-800"
        >
          <IconDownload size={14} /> Ekspor CSV
        </a>
      </div>

      {/* Filter bar */}
      <div className="mt-5 rounded-xl border border-line bg-surface p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="relative xl:col-span-2">
            <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={q}
              onChange={(e) => setFilter(() => setQ(e.target.value))}
              placeholder="Cari nama, NIK, alamat…"
              className="w-full rounded-lg border border-line bg-canvas/60 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <Select value={kecamatan} onChange={(v) => setFilter(() => { setKecamatan(v); setDesa(""); })} label="Semua Kecamatan" options={kecamatans} />
          <Select value={desa} onChange={(v) => setFilter(() => setDesa(v))} label="Semua Desa/Kelurahan" options={desaOptions} />
          <Select
            value={status}
            onChange={(v) => setFilter(() => setStatus(v))}
            label="Semua Status"
            options={statuses.map((s) => String(s.id))}
            optionLabels={statuses.map((s) => s.name)}
          />
          <Select
            value={sumber}
            onChange={(v) => setFilter(() => setSumber(v))}
            label="Semua Sumber Dana"
            options={["none", ...sumberDana.map((s) => String(s.id))]}
            optionLabels={["Belum ditentukan", ...sumberDana.map((s) => s.name)]}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-ink-soft">
            Menampilkan <span className="text-brand-800">{filtered.length}</span> dari {rows.length} data
          </div>
          {hasFilter && (
            <button
              onClick={() =>
                setFilter(() => {
                  setQ("");
                  setKecamatan("");
                  setDesa("");
                  setStatus("");
                  setSumber("");
                })
              }
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-accent-700 hover:bg-accent-50"
            >
              <IconX size={12} /> Reset filter
            </button>
          )}
        </div>
      </div>

      {/* Tabel */}
      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-brand-50/60 text-[11px] font-bold uppercase tracking-wider text-brand-900">
                <th className="px-4 py-3">Penerima</th>
                <th className="px-4 py-3">Lokasi</th>
                <th className="px-4 py-3">Kondisi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sumber Dana</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr key={r.id} className="border-b border-line/70 transition last:border-0 hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <div className="font-bold text-ink">{r.nama}</div>
                    <div className="text-[11px] text-ink-soft">
                      NIK {r.nik} · {r.pekerjaan ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{r.desaKelurahan}</div>
                    <div className="text-[11px] text-ink-soft">{r.kecamatan}</div>
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    <div className="truncate text-[12px] text-ink-soft" title={r.kondisiRumah ?? ""}>
                      {r.kondisiRumah ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge name={r.statusName} color={r.statusColor} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-ink-soft">
                    {r.sumberDanaName ?? <span className="italic text-line">Belum ditentukan</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/data-bnba/${r.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-brand-700 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-brand-800"
                      >
                        Detail <IconChevronRight size={11} />
                      </Link>
                      {r.lat != null && r.lng != null && (
                        <a
                          href={`https://maps.google.com/?q=${r.lat},${r.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Lihat di Google Maps"
                          className="rounded-md border border-line p-1.5 text-ink-soft hover:bg-black/5 hover:text-ink"
                        >
                          <IconMapPin size={13} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {slice.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm font-semibold text-ink-soft">
                    Tidak ada data yang cocok dengan pencarian/filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-line bg-canvas/50 px-4 py-2.5">
          <div className="text-[11px] font-semibold text-ink-soft">
            Halaman {safePage} dari {pages}
          </div>
          <div className="flex gap-1.5">
            <PageBtn disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
              ← Sebelumnya
            </PageBtn>
            <PageBtn disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>
              Berikutnya →
            </PageBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  label,
  options,
  optionLabels,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
  optionLabels?: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full cursor-pointer rounded-lg border border-line bg-canvas/60 px-3 py-2 text-sm font-medium outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
    >
      <option value="">{label}</option>
      {options.map((o, i) => (
        <option key={o} value={o}>
          {optionLabels ? optionLabels[i] : o}
        </option>
      ))}
    </select>
  );
}

function PageBtn({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand-400 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
