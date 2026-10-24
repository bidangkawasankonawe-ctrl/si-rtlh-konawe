import { NextResponse } from "next/server";
import { computeStats, fetchStatuses, listBnba } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [rows, st] = await Promise.all([listBnba(), fetchStatuses()]);
  return NextResponse.json({ stats: computeStats(rows, st) });
}
