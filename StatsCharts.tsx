"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Stats } from "@/lib/data";

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"rounded-xl border border-line bg-surface p-5 shadow-card " + className}>
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function StatsCharts({ stats }: { stats: Stats }) {
  const kecData = stats.perKecamatan.map((k) => ({ nama: k.name.replace(" ", "\u00a0"), jml: k.count }));
  const statusData = stats.perStatus.map((s) => ({ name: s.name, value: s.count, color: s.color }));
  const sdData = stats.perSumberDana.map((s) => ({ name: s.name, jml: s.count }));

  return (
    <>
      <div className="grid gap-4 lg:col-span-2">
        <Card title="Grafik RTLH per Kecamatan">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kecData} margin={{ top: 4, right: 8, left: -18, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e0d3" vertical={false} />
                <XAxis
                  dataKey="nama"
                  tick={{ fontSize: 10, fill: "#5a6a62" }}
                  interval={0}
                  angle={-32}
                  textAnchor="end"
                  height={64}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e0d3" }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5a6a62" }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(30,99,73,0.06)" }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #e2e0d3",
                    fontSize: 12,
                    fontFamily: "Manrope, sans-serif",
                  }}
                  formatter={(v) => [`${v} unit`, "Jumlah RTLH"]}
                />
                <Bar dataKey="jml" fill="#1e6349" radius={[5, 5, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Grafik berdasarkan Status">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {statusData.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e0d3",
                      fontSize: 12,
                      fontFamily: "Manrope, sans-serif",
                    }}
                    formatter={(v, n) => [`${v} unit`, String(n)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1.5">
              {statusData.map((s) => (
                <li key={s.name} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-display font-bold tabular-nums" style={{ color: s.color }}>
                    {s.value}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Grafik berdasarkan Sumber Dana">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sdData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e0d3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#5a6a62" }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{ fontSize: 10.5, fill: "#1e2a25" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(212,134,31,0.07)" }}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e0d3",
                      fontSize: 12,
                      fontFamily: "Manrope, sans-serif",
                    }}
                    formatter={(v) => [`${v} unit`, "Jumlah"]}
                  />
                  <Bar dataKey="jml" fill="#d4861f" radius={[0, 5, 5, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
