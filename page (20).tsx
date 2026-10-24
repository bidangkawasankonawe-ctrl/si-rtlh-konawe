import { listBnba, fetchStatuses, fetchSumberDana, type BnbaRow } from "@/lib/data";
import type { Status, SumberDana } from "@/db/schema";
import { BnbaExplorer } from "@/components/BnbaExplorer";

export const dynamic = "force-dynamic";

export default async function DataBnbaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };

  const [rows, st, sd] = await Promise.all([listBnba(), fetchStatuses(), fetchSumberDana()]);
  const kecamatans = [...new Set(rows.map((r) => r.kecamatan))].sort();
  const desas = [...new Set(rows.map((r) => r.desaKelurahan))].sort();

  return (
    <BnbaExplorer
      rows={rows as unknown as BnbaRow[]}
      statuses={st as Status[]}
      sumberDana={sd as SumberDana[]}
      kecamatans={kecamatans}
      desas={desas}
      initial={{
        q: pick("q") ?? "",
        kecamatan: pick("kecamatan") ?? "",
        desa: pick("desa") ?? "",
        status: pick("status") ?? "",
        sumber: pick("sumber") ?? "",
      }}
    />
  );
}
