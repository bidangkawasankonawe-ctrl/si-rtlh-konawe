import Link from "next/link";
import { listBnba } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import { IconMapPin, IconExternal, IconInfo } from "@/components/icons";

export const dynamic = "force-dynamic";

const MY_MAPS_MID = "1c1tsS_c8CqEDDOnEBv00NP9hdHom-XY";
const EMBED_URL = `https://www.google.com/maps/d/viewer?mid=${MY_MAPS_MID}&hl=id&z=11`;
const PUBLIC_URL = `https://www.google.com/maps/d/viewer?mid=${MY_MAPS_MID}&hl=id`;

export default async function PetaPage() {
  const rows = await listBnba();
  const withCoord = rows.filter((r) => r.lat != null && r.lng != null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-900">Peta Sebaran RTLH</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Peta interaktif Google My Maps — lokasi penerima bantuan BNBA se-Kabupaten Konawe.
          </p>
        </div>
        <a
          href={PUBLIC_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-brand-700 px-3.5 py-2 text-xs font-bold text-brand-800 hover:bg-brand-50"
        >
          <IconExternal size={14} /> Buka di Google Maps
        </a>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          <iframe
            src={EMBED_URL}
            title="Peta Sebaran RTLH Kabupaten Konawe (Google My Maps)"
            className="h-[420px] w-full lg:h-[640px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="flex items-start gap-2 border-t border-line bg-canvas/60 px-4 py-3 text-[11.5px] text-ink-soft">
            <IconInfo size={14} className="mt-0.5 shrink-0 text-brand-600" />
            Peta ini disinkronkan dari Google My Maps (mid {MY_MAPS_MID}). Klik penanda untuk melihat detail
            lokasi penerima pada panel My Maps.
          </div>
        </div>

        <div className="flex max-h-[640px] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          <div className="border-b border-line bg-brand-50/60 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-brand-900">
            Titik lokasi terdata ({withCoord.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-line/70">
              {withCoord.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    <IconMapPin size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/data-bnba/${r.id}`}
                      className="block truncate text-[13px] font-bold text-ink hover:text-brand-800"
                    >
                      {r.nama}
                    </Link>
                    <div className="truncate text-[11px] text-ink-soft">
                      {r.desaKelurahan}, {r.kecamatan}
                    </div>
                  </div>
                  <StatusBadge name={r.statusName} color={r.statusColor} size="sm" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
