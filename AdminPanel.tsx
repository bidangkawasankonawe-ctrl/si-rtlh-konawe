"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OverviewTab } from "./OverviewTab";
import { BnbaStatusTab } from "./BnbaStatusTab";
import { RangkumanTab, SumberDanaTab, StatusesTab } from "./ManageTabs";
import { UsersTab } from "./UsersTab";
import { AuditTab } from "./AuditTab";
import { SyncTab } from "./SyncTab";

type Me = { id: number; username: string; fullName: string; role: "admin" | "superadmin" };

export const TABS = [
  { key: "overview", label: "Ringkasan", superOnly: false },
  { key: "status-bnba", label: "Status BNBA", superOnly: false },
  { key: "sumber-dana", label: "Sumber Dana", superOnly: false },
  { key: "rangkuman", label: "Rangkuman Beranda", superOnly: false },
  { key: "sync", label: "Sinkronisasi", superOnly: false },
  { key: "statuses", label: "Kelola Status", superOnly: true },
  { key: "users", label: "Pengguna", superOnly: true },
  { key: "audit", label: "Audit Log", superOnly: true },
] as const;

export function AdminPanel({ user }: { user: Me }) {
  const sp = useSearchParams();
  const initialTab = sp?.get("tab") ?? "overview";
  const [tab, setTab] = useState<string>(
    TABS.find((t) => t.key === initialTab && (!t.superOnly || user.role === "superadmin"))?.key ?? "overview",
  );
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((x) => x + 1), []);

  useEffect(() => {
    const t = sp?.get("tab");
    if (t && TABS.some((x) => x.key === t && (!x.superOnly || user.role === "superadmin"))) {
      setTab(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const allowed = TABS.filter((t) => !t.superOnly || user.role === "superadmin");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-900">
            {user.role === "superadmin" ? "Super Admin" : "Admin"} Panel
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {user.fullName} · @{user.username}
          </p>
        </div>
        <div className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700 shadow-card">
          {user.role === "superadmin" ? "Akses penuh" : "Akses admin"}
        </div>
      </div>

      <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1.5 shadow-card">
        {allowed.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "shrink-0 rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition " +
              (tab === t.key
                ? "bg-brand-700 text-white shadow-card"
                : "text-ink-soft hover:bg-black/5 hover:text-ink")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "overview" && <OverviewTab user={user} goToTab={setTab} refresh={refresh} />}
        {tab === "status-bnba" && <BnbaStatusTab nonce={nonce} />}
        {tab === "sumber-dana" && <SumberDanaTab nonce={nonce} />}
        {tab === "rangkuman" && <RangkumanTab />}
        {tab === "sync" && <SyncTab nonce={nonce} />}
        {tab === "statuses" && user.role === "superadmin" && <StatusesTab />}
        {tab === "users" && user.role === "superadmin" && <UsersTab meId={user.id} />}
        {tab === "audit" && user.role === "superadmin" && <AuditTab />}
      </div>
    </div>
  );
}
