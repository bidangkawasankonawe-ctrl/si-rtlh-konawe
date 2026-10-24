"use client";

import { useCallback, useEffect, useState } from "react";
import { fmtDate } from "@/lib/format";
import { IconCheck, IconEdit, IconPlus, IconShield, IconTrash, IconX } from "../icons";

const inputCls =
  "w-full rounded-lg border border-line bg-canvas/60 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

type U = { id: number; username: string; fullName: string; role: "admin" | "superadmin"; active: boolean; createdAt: Date };

export function UsersTab({ meId }: { meId: number }) {
  const [rows, setRows] = useState<U[] | null>(null);
  const [form, setForm] = useState({ username: "", fullName: "", password: "", role: "admin" as "admin" | "superadmin" });
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<Record<number, { fullName: string; role: "admin" | "superadmin"; active: boolean; password: string }>>({});

  const load = useCallback(async () => {
    const res = await fetch("/api/users");
    const d = await res.json();
    setRows(d.rows);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (!res.ok) return setErr(d.error ?? "Gagal menambah pengguna");
    setForm({ username: "", fullName: "", password: "", role: "admin" });
    await load();
  }

  async function saveEdit(id: number) {
    const e = edit[id];
    if (!e) return;
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: e.fullName,
        role: e.role,
        active: e.active,
        password: e.password || undefined,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Gagal menyimpan");
      return;
    }
    setEdit((m) => {
      const c = { ...m };
      delete c[id];
      return c;
    });
    await load();
  }

  async function remove(id: number) {
    if (!confirm("Hapus pengguna ini?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (!res.ok) return alert(d.error ?? "Gagal menghapus");
    await load();
  }

  return (
    <div className="rounded-xl border border-line bg-surface shadow-card">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold text-ink">
          <IconShield size={15} className="text-brand-700" /> Kelola Pengguna & Hak Akses (Super Admin)
        </div>
        <div className="text-[11.5px] text-ink-soft">
          Admin: kelola status BNBA, sumber dana, rangkuman, dan sinkronisasi. Super Admin: semua akses + pengguna, status, dan audit.
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[340px_1fr]">
        <form onSubmit={add} className="h-fit space-y-3 rounded-xl border border-dashed border-line bg-canvas/50 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            <IconPlus size={13} /> Tambah pengguna
          </div>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" className={inputCls} />
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Nama lengkap" className={inputCls} />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Kata sandi (min. 6 karakter)" className={inputCls} />
          <label className="flex items-center gap-2 text-xs font-bold text-ink">
            Hak akses
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "superadmin" })}
              className="rounded-lg border border-line bg-canvas/60 px-2.5 py-2 text-[13px] font-semibold"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </label>
          {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800">
            <IconPlus size={13} /> Tambah
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-brand-50/60 text-[11px] font-bold uppercase tracking-wider text-brand-900">
                <th className="px-4 py-2.5">Pengguna</th>
                <th className="px-4 py-2.5">Hak Akses</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Dibuat</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((u) => {
                const e = edit[u.id];
                const isMe = u.id === meId;
                return e ? (
                  <tr key={u.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3 font-bold text-ink" colSpan={2}>
                      @{u.username}
                      <input
                        value={e.fullName}
                        onChange={(ev) => setEdit({ ...edit, [u.id]: { ...e, fullName: ev.target.value } })}
                        className={inputCls + " mt-1.5"}
                      />
                    </td>
                    <td className="px-4 py-3" colSpan={2}>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={e.role}
                          onChange={(ev) => setEdit({ ...edit, [u.id]: { ...e, role: ev.target.value as "admin" | "superadmin" } })}
                          disabled={isMe}
                          className="rounded-lg border border-line bg-canvas/60 px-2 py-1.5 text-[12.5px] font-semibold disabled:opacity-50"
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                        <input
                          type="password"
                          value={e.password}
                          onChange={(ev) => setEdit({ ...edit, [u.id]: { ...e, password: ev.target.value } })}
                          placeholder="Reset sandi (opsional)"
                          className="w-40 rounded-lg border border-line bg-canvas/60 px-2 py-1.5 text-[12.5px]"
                        />
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-ink">
                          <input
                            type="checkbox"
                            checked={e.active}
                            disabled={isMe}
                            onChange={(ev) => setEdit({ ...edit, [u.id]: { ...e, active: ev.target.checked } })}
                            className="accent-brand-700"
                          />
                          Aktif
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => saveEdit(u.id)} className="inline-flex items-center gap-1 rounded-lg bg-brand-700 px-3 py-1.5 text-[11.5px] font-bold text-white">
                          <IconCheck size={12} /> Simpan
                        </button>
                        <button onClick={() => setEdit((m) => { const c = { ...m }; delete c[u.id]; return c; })} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-bold text-ink-soft">
                          <IconX size={12} /> Batal
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="border-b border-line/70 last:border-0 hover:bg-brand-50/30">
                    <td className="px-4 py-3">
                      <div className="font-bold text-ink">@{u.username}{isMe && <span className="ml-1.5 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-800">ANDA</span>}</div>
                      <div className="text-[11px] text-ink-soft">{u.fullName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "rounded-full px-2.5 py-1 text-[11px] font-bold " +
                          (u.role === "superadmin" ? "bg-accent-100 text-accent-800" : "bg-brand-100 text-brand-800")
                        }
                      >
                        {u.role === "superadmin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2.5 py-1 text-[11px] font-bold " + (u.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700")}>
                        {u.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-ink-soft">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEdit({ ...edit, [u.id]: { fullName: u.fullName, role: u.role, active: u.active, password: "" } })}
                          className="rounded-md border border-line p-2 text-ink-soft hover:bg-black/5 hover:text-ink"
                        >
                          <IconEdit size={13} />
                        </button>
                        <button
                          onClick={() => remove(u.id)}
                          disabled={isMe}
                          className="rounded-md border border-line p-2 text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
