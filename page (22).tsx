import Link from "next/link";
import { listBnba, fetchStatuses, fetchRangkuman, computeStats, fmtDate } from "@/lib/data";
import { IconChevronRight, IconMapPin, IconFile, IconWallet, IconChart } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [rows, st, rang] = await Promise.all([listBnba(), fetchStatuses(), fetchRangkuman()]);
  const stats = computeStats(rows, st);
  const maxKec = stats.perKecamatan[0]?.count ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-900 text-white shadow-card">
        <svg className="absolute inset-0 h-full w-full opacity-[0.14]" aria-hidden>
          <defs>
            <pattern id="gridp" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M28 0H0v28" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridp)" />
        </svg>
        <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-100">
              Sistem Informasi Rumah Tidak Layak Huni
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-[42px]">
              SI-RTLH <span className="text-accent-300">Kabupaten Konawe</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-[15px]">
              Pendataan penerima bantuan BNBA hasil Google Form, pemantauan status penanganan
              <span className="font-semibold text-white"> Usulan Baru → Tahap Verifikasi → Masuk SK → Selesai</span>,
              statistik per kecamatan, dan peta sebaran wilayah.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/data-bnba"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-400 px-4 py-2.5 text-sm font-bold text-brand-950 shadow hover:bg-accent-300"
              >
                <IconFile size={16} /> Jelajahi Data BNBA
              </Link>
              <Link
                href="/peta"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"
              >
                <IconMapPin size={16} /> Peta Sebaran
              </Link>
            </div>
          </div>

          <div className="flex items-end gap-8 lg:gap-10">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-200">Total RTLH</div>
              <div className="mt-1 font-display text-6xl font-bold tabular-nums text-white sm:text-7xl">
                {stats.total}
              </div>
              <div className="mt-1 text-xs font-semibold text-brand-200">
                {stats.perKecamatan.length} kecamatan terdata
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-200">Selesai</div>
              <div className="mt-1 font-display text-4xl font-bold tabular-nums text-emerald-300">
                {stats.rekap.reduce((a, r) => a + r.selesai, 0)}
              </div>
              <div className="mt-1 text-xs font-semibold text-brand-200">unit terehab</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KARTU STATUS ===== */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.perStatus.map((s) => (
          <Link
            key={s.name}
            href={`/data-bnba?status=${statusIdByName(st, s.name)}`}
            className="group rounded-xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300"
          >
            <div className="flex items-center justify-between">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <IconChevronRight size={14} className="text-line transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold tabular-nums" style={{ color: s.color }}>
              {s.count}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-ink">{s.name}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full"
                style={{
                  width: stats.total ? `${(s.count / stats.total) * 100}%` : "0%",
                  backgroundColor: s.color,
                }}
              />
            </div>
            <div className="mt-1.5 text-[11px] font-semibold text-ink-soft">
              {stats.total ? Math.round((s.count / stats.total) * 100) : 0}% dari total
            </div>
          </Link>
        ))}
      </section>

      {/* ===== RANGKUMAN + SUMBER DANA | KECAMATAN ===== */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              <IconFile size={14} className="text-brand-600" /> Rangkuman Program Bantuan
            </div>
            <h2 className="mt-3 font-display text-lg font-bold leading-snug text-brand-900">
              {rang?.title ?? "Program Bantuan RTLH Kabupaten Konawe"}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {rang?.tahun && (
                <span className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700">
                  Tahun {rang.tahun}
                </span>
              )}
              {rang?.anggaran && (
                <span className="rounded-md bg-accent-50 px-2 py-1 text-[11px] font-bold text-accent-700">
                  {rang.anggaran}
                </span>
              )}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{rang?.body}</p>
            <Link
              href="/admin"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
            >
              Kelola rangkuman di Admin <IconChevronRight size={12} />
            </Link>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              <IconWallet size={14} className="text-brand-600" /> Sumber Dana
            </div>
            <ul className="mt-4 space-y-3">
              {stats.perSumberDana.map((s) => (
                <li key={s.name}>
                  <div className="flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="font-semibold text-ink">{s.name}</span>
                    <span className="font-display font-bold tabular-nums text-brand-800">{s.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                      style={{ width: `${(s.count / Math.max(1, stats.total)) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-card lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              <IconChart size={14} className="text-brand-600" /> Statistik per Kecamatan
            </div>
            <Link href="/statistik" className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900">
              Statistik lengkap <IconChevronRight size={12} />
            </Link>
          </div>
          <div className="mt-4 grid gap-x-8 gap-y-2.5 md:grid-cols-2">
            {stats.perKecamatan.map((k) => (
              <div key={k.name} className="flex items-center gap-3">
                <div className="w-28 shrink-0 truncate text-[13px] font-semibold text-ink">{k.name}</div>
                <div className="h-4 flex-1 overflow-hidden rounded-md bg-black/5">
                  <div
                    className="h-full rounded-md bg-brand-600"
                    style={{ width: `${(k.count / maxKec) * 100}%` }}
                  />
                </div>
                <div className="w-7 text-right font-display text-sm font-bold tabular-nums text-brand-800">
                  {k.count}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[11px] text-ink-soft">
            Data tersinkron dari Google Form → Google Spreadsheet. Sinkronisasi terakhir: {fmtDate(new Date())}.
          </p>
        </div>
      </section>
    </div>
  );
}

function statusIdByName(st: { id: number; name: string }[], name: string): number {
  return st.find((s) => s.name === name)?.id ?? 0;
}
