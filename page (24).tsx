import { listBnba, fetchStatuses, computeStats } from "@/lib/data";
import { StatsCharts } from "@/components/StatsCharts";
import { IconChart } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function StatistikPage() {
  const [rows, st] = await Promise.all([listBnba(), fetchStatuses()]);
  const stats = computeStats(rows, st);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white">
          <IconChart size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-900">Statistik RTLH</h1>
          <p className="text-sm text-ink-soft">
            Rekapitulasi {stats.total} data BNBA per kecamatan, status penanganan, dan sumber dana.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <StatsCharts stats={stats} />
      </div>

      {/* Rekap tabel */}
      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="border-b border-line bg-brand-50/60 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-brand-900">
          Rekap per Kecamatan
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                <th className="px-5 py-3">Kecamatan</th>
                {stats.statusNames.map((s) => (
                  <th key={s} className="px-4 py-3 text-center">
                    {s}
                  </th>
                ))}
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {stats.rekap.map((k) => (
                <tr key={k.kecamatan} className="border-b border-line/70 last:border-0 hover:bg-brand-50/40">
                  <td className="px-5 py-2.5 font-bold text-ink">{k.kecamatan}</td>
                  {stats.statusNames.map((s) => (
                    <td key={s} className="px-4 py-2.5 text-center font-semibold tabular-nums text-ink-soft">
                      {k.byStatus[s] ?? 0}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-center font-display font-bold tabular-nums text-brand-800">
                    {k.total}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/5">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${(k.total / Math.max(1, stats.total)) * 100}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-[11px] font-bold tabular-nums text-ink-soft">
                        {((k.total / Math.max(1, stats.total)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-canvas/70 text-[13px]">
                <td className="px-5 py-3 font-bold text-brand-900">Jumlah</td>
                {stats.statusNames.map((s) => (
                  <td key={s} className="px-4 py-3 text-center font-bold tabular-nums text-ink">
                    {stats.rekap.reduce((a, r) => a + (r.byStatus[s] ?? 0), 0)}
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-display font-bold tabular-nums text-brand-900">
                  {stats.total}
                </td>
                <td className="px-4 py-3 text-right text-[11px] font-bold text-ink-soft">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
