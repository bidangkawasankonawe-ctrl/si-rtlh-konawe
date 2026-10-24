import Link from "next/link";
import { notFound } from "next/navigation";
import { getBnbaById, fmtDate, fetchStatuses } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import {
  IconChevronLeft,
  IconMapPin,
  IconCamera,
  IconClock,
  IconWallet,
  IconUsers,
  IconHome,
  IconChevronRight,
  IconAlert,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DetailBnbaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n)) notFound();
  const [row, stList] = await Promise.all([getBnbaById(n), fetchStatuses()]);
  if (!row) notFound();

  const stepIdx = stList.findIndex((s) => s.id === row.statusId);
  const totalJiwa = (row.jumlahTanggungan ?? 1) + 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/data-bnba"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft hover:text-brand-800"
      >
        <IconChevronLeft size={13} /> Kembali ke Data BNBA
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-700 font-display text-xl font-bold text-white">
            {row.nama.split(" ").slice(0, 2).map((w) => w[0]).join("")}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-brand-900">{row.nama}</h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              NIK {row.nik} · {row.jenisKelamin}{row.umur != null ? ` · ${row.umur} tahun` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge name={row.statusName} color={row.statusColor} />
          <a
            href={`/data-bnba/${row.id}`}
            className="hidden"
          />
          {row.lat != null && row.lng != null && (
            <a
              href={`https://maps.google.com/?q=${row.lat},${row.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-700 px-3 py-1.5 text-xs font-bold text-brand-800 hover:bg-brand-50"
            >
              <IconMapPin size={13} /> Lihat koordinat
            </a>
          )}
        </div>
      </div>

      {/* Progress status */}
      <div className="mt-4 rounded-xl border border-line bg-surface p-5 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">Progres Penanganan</div>
        <div className="mt-3 flex items-center">
          {stList.map((s, i) => {
            const done = i < stepIdx;
            const current = i === stepIdx;
            return (
              <div key={s.id} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold"
                    style={{
                      borderColor: s.color,
                      backgroundColor: done || current ? s.color : "transparent",
                      color: done || current ? "#fff" : s.color,
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <div
                    className="max-w-[90px] text-center text-[10.5px] font-bold leading-tight"
                    style={{ color: current ? s.color : "var(--color-ink-soft)" }}
                  >
                    {s.name}
                  </div>
                </div>
                {i < stList.length - 1 && (
                  <div
                    className="mx-1.5 mb-5 h-0.5 flex-1 rounded"
                    style={{ backgroundColor: i < stepIdx ? s.color : "var(--color-line)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Kiri: profil & sosial-ekonomi */}
        <div className="space-y-4">
          <Card title="Profil BNBA" icon={<IconUsers size={14} />}>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
              <Field label="Kepala Keluarga" value={row.nama} />
              <Field label="Jenis Kelamin" value={row.jenisKelamin} />
              <Field label="Umur" value={row.umur != null ? `${row.umur} tahun` : null} />
              <Field label="Pendidikan" value={row.pendidikan} />
              <Field label="Pekerjaan" value={row.pekerjaan} />
              <Field label="Penghasilan" value={row.penghasilan} wide />
            </dl>
            {row.kondisiKhusus && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-accent-50 p-3 text-[12px] font-semibold text-accent-800">
                <IconAlert size={14} className="mt-0.5 shrink-0" />
                <span>Kondisi khusus: {row.kondisiKhusus}</span>
              </div>
            )}
          </Card>

          <Card title="Data Sosial-Ekonomi" icon={<IconWallet size={14} />}>
            <dl className="space-y-3 text-sm">
              <Field label="Jumlah jiwa dalam rumah" value={`${totalJiwa} jiwa (KK + ${row.jumlahTanggungan ?? 0} tanggungan)`} />
              <Field label="Penghasilan" value={row.penghasilan} />
              <Field label="Keterangan" value={row.catatan ?? row.kondisiKhusus} />
            </dl>
          </Card>

          <Card title="Alamat" icon={<IconMapPin size={14} />}>
            <p className="text-sm font-semibold text-ink">{row.alamat ?? "—"}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {row.rtRw ? `${row.rtRw} · ` : ""}
              Desa/Kelurahan {row.desaKelurahan}, Kec. {row.kecamatan}, Kab. Konawe
            </p>
            {row.lat != null && row.lng != null && (
              <p className="mt-2 rounded-lg bg-canvas px-3 py-2 font-mono text-[12px] text-ink-soft">
                {row.lat.toFixed(5)}, {row.lng.toFixed(5)}
              </p>
            )}
          </Card>
        </div>

        {/* Tengah: kondisi rumah + sumber dana */}
        <div className="space-y-4">
          <Card title="Kondisi Rumah" icon={<IconHome size={14} />}>
            <p className="text-[13px] leading-relaxed text-ink">{row.kondisiRumah ?? "Tidak ada catatan kondisi rumah."}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Luas bangunan", row.luasRumah != null ? `${row.luasRumah} m²` : null],
                ["Bahan dinding", row.bahanDinding],
                ["Bahan atap", row.bahanAtap],
                ["Bahan lantai", row.bahanLantai],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-lg border border-line bg-canvas/60 p-3">
                  <div className="text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">{k}</div>
                  <div className="mt-1 text-[13px] font-bold text-ink">{v ?? "—"}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Sumber Dana" icon={<IconWallet size={14} />}>
            {row.sumberDanaName ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <IconWallet size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">{row.sumberDanaName}</div>
                  <div className="text-[11px] text-ink-soft">Ditetapkan oleh admin berdasarkan SK</div>
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-ink-soft">
                Belum ditentukan — menunggu penetapan setelah tahap verifikasi.
              </p>
            )}
            <div className="mt-4 rounded-lg bg-brand-50 p-3 text-[12px] leading-relaxed text-brand-800">
              Status penanganan dikelola melalui menu Admin (tidak ditulis kembali ke Google Spreadsheet,
              sehingga data hasil Google Form tetap aman).
            </div>
          </Card>

          <Card title="Dokumentasi" icon={<IconCamera size={14} />}>
            {row.photoUrl ? (
              <div>
                <img
                  src={row.photoUrl}
                  alt={`Dokumentasi rumah ${row.nama}`}
                  className="aspect-[16/10] w-full rounded-lg border border-line object-cover"
                />
                <p className="mt-2 text-[11px] text-ink-soft">
                  Dokumentasi kondisi fisik sebelum penanganan · diunggah via form/verifikasi lapangan
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-canvas/60 py-10 text-center">
                <IconCamera size={22} className="text-ink-soft/60" />
                <p className="mt-2 text-[12px] font-semibold text-ink-soft">
                  Dokumentasi akan tampil setelah diunggah pada verifikasi lapangan.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Kanan: riwayat status */}
        <Card title="Riwayat Perubahan Status" icon={<IconClock size={14} />} className="h-fit">
          <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-20px)] before:w-0.5 before:bg-line">
            {row.history.length === 0 && (
              <li className="pl-6 text-sm italic text-ink-soft">Belum ada riwayat.</li>
            )}
            {[...row.history].reverse().map((h, i) => (
              <li key={i} className="relative pl-6">
                <span
                  className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: h.statusColor }}
                />
                <div className="text-[13px] font-bold" style={{ color: h.statusColor }}>
                  {h.statusName}
                </div>
                <div className="text-[11px] font-semibold text-ink-soft">
                  {fmtDate(h.createdAt, true)} · {h.changedBy ?? "—"}
                </div>
                {h.note && <div className="mt-1 text-[12px] leading-relaxed text-ink-soft">{h.note}</div>}
              </li>
            ))}
          </ol>
          <div className="mt-5 border-t border-line pt-3 text-[11px] text-ink-soft">
            Data masuk sistem: {fmtDate(row.createdAt)} · Pembaruan terakhir: {fmtDate(row.updatedAt)}
          </div>
          <Link
            href={`/admin?tab=status-bnba`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
          >
            Ubah status di Admin <IconChevronRight size={12} />
          </Link>
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={"rounded-xl border border-line bg-surface p-5 shadow-card " + className}>
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
        <span className="text-brand-600">{icon}</span> {title}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({ label, value, wide = false }: { label: string; value: string | null; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-semibold text-ink">{value ?? "—"}</dd>
    </div>
  );
}
