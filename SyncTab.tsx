"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fmtDate } from "@/lib/format";
import { IconCheck, IconAlert, IconRefresh, IconUpload, IconInfo } from "../icons";

type SyncRow = {
  id: number;
  source: string;
  message: string;
  rowsAdded: number;
  rowsUpdated: number;
  rowsTotal: number;
  createdAt: Date;
};

const SAMPLE = `NIK;NAMA;JENIS KELAMIN;UMUR;PEKERJAAN;JML TANGGUNGAN;PENGHASILAN;KONDISI RUMAH;LUAS RUMAH;ALAMAT;RT/RW;DESA;KECAMATAN;LAT;LNG
7403001102000099;La Ode Tes;Laki-laki;45;Petani;4;Tidak tetap (musiman);Dinding papan lapuk, atap bocor;50;Jl. Poros Desa 1;RT 1 / RW 1;Wumabasa;Andoolo;-3.8765;122.3543`;

export function SyncTab({ nonce }: { nonce: number }) {
  const [logs, setLogs] = useState<SyncRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [csv, setCsv] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/sync");
    if (res.ok) {
      const d = await res.json();
      setLogs(d.rows);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load, nonce]);

  async function runSheet() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const d = await res.json();
      setMsg(res.ok ? { ok: true, text: d.message ?? `Berhasil: ${d.added} baru, ${d.updated} diperbarui, total ${d.total}.` } : { ok: false, text: d.error });
      if (res.ok) await load();
    } catch {
      setMsg({ ok: false, text: "Kesalahan jaringan." });
    } finally {
      setBusy(false);
    }
  }

  async function importCsv() {
    if (!csv.trim()) {
      setMsg({ ok: false, text: "Tempel CSV atau pilih file .csv terlebih dahulu." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/sync/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const d = await res.json();
      setMsg(
        res.ok
          ? { ok: true, text: `Impor berhasil: ${d.added} data baru, ${d.updated} diperbarui${d.skipped?.length ? `, ${d.skipped.length} baris dilewati` : ""}.` }
          : { ok: false, text: d.error },
      );
      if (res.ok) {
        setCsv("");
        await load();
      }
    } catch {
      setMsg({ ok: false, text: "Kesalahan jaringan." });
    } finally {
      setBusy(false);
    }
  }

  function onFile(f: File | undefined) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ""));
    reader.readAsText(f);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
        <div className="text-sm font-bold text-ink">Arsitektur Alur Data (pengaman Google Form)</div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-bold">
          {["Google Form", "Google Spreadsheet", "Website (Sync)", "Database Status"].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-2">
              <span className="rounded-lg bg-brand-700 px-3 py-1.5 text-white">{s}</span>
              {i < arr.length - 1 && <span className="text-brand-500">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-3 max-w-3xl text-[12.5px] leading-relaxed text-ink-soft">
          Data pendataan ditarik dari Google Spreadsheet (hasil Google Form) dan disimpan ke database.
          Perubahan <b>status penanganan</b> dan <b>sumber dana</b> hanya dikelola di website/database —
          tidak pernah ditulis kembali ke spreadsheet, sehingga data form tetap aman. Record yang sudah
          ada hanya memperbarui data pendataan (tidak menimpa status).
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-dashed border-line bg-canvas/50 p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              <IconRefresh size={13} /> Sinkronisasi otomatis
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
              Set environment <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[11.5px]">GOOGLE_SHEET_ID</code>{" "}
              (opsional <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[11.5px]">GOOGLE_SHEET_NAME</code>)
              dengan ID Spreadsheet Anda. Pastikan sheet dibagikan <i>Anyone with the link → Viewer</i>.
            </p>
            <button
              onClick={runSheet}
              disabled={busy}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-card hover:bg-brand-800 disabled:opacity-60"
            >
              <IconRefresh size={13} className={busy ? "animate-spin" : ""} />
              {busy ? "Menjalankan…" : "Tarik data dari Spreadsheet sekarang"}
            </button>
          </div>
          <div className="rounded-xl border border-dashed border-line bg-canvas/50 p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              <IconUpload size={13} /> Impor manual (CSV / salinan)
            </div>
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={4}
              placeholder={SAMPLE}
              className="mt-2 w-full rounded-lg border border-line bg-canvas/60 p-3 font-mono text-[11px] outline-none focus:border-brand-500"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-bold text-ink hover:border-brand-400"
              >
                Pilih file .csv
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <button
                onClick={importCsv}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-xs font-bold text-white hover:bg-accent-600 disabled:opacity-60"
              >
                <IconUpload size={13} /> Impor CSV
              </button>
              <span className="text-[11px] text-ink-soft">Format: koma atau titik koma; header wajib.</span>
            </div>
          </div>
        </div>
        {msg && (
          <div
            className={
              "mt-4 flex items-start gap-2 rounded-lg border px-3.5 py-3 text-[12.5px] font-semibold " +
              (msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700")
            }
          >
            {msg.ok ? <IconCheck size={15} className="mt-0.5 shrink-0" /> : <IconAlert size={15} className="mt-0.5 shrink-0" />}
            {msg.text}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="border-b border-line bg-brand-50/60 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-brand-900">
          Riwayat Sinkronisasi
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              <th className="px-5 py-2.5">Waktu</th>
              <th className="px-4 py-2.5">Sumber</th>
              <th className="px-4 py-2.5">Baru</th>
              <th className="px-4 py-2.5">Diperbarui</th>
              <th className="px-4 py-2.5">Total</th>
              <th className="px-4 py-2.5">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-line/70 last:border-0 hover:bg-brand-50/30">
                <td className="whitespace-nowrap px-5 py-2.5 text-[12px] font-semibold text-ink-soft">{fmtDate(l.createdAt, true)}</td>
                <td className="px-4 py-2.5 text-[12.5px] font-bold text-ink">{l.source}</td>
                <td className="px-4 py-2.5 font-bold tabular-nums text-emerald-700">+{l.rowsAdded}</td>
                <td className="px-4 py-2.5 tabular-nums text-ink-soft">~{l.rowsUpdated}</td>
                <td className="px-4 py-2.5 tabular-nums text-brand-800">{l.rowsTotal}</td>
                <td className="px-4 py-2.5 text-[12px] text-ink-soft">{l.message}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm font-semibold text-ink-soft">
                  <span className="inline-flex items-center gap-2">
                    <IconInfo size={14} /> Belum ada sinkronisasi — data awal dari seed contoh.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
