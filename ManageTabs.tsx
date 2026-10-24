"use client";

import { useCallback, useEffect, useState } from "react";
import { IconCheck, IconEdit, IconPlus, IconTrash, IconX } from "../icons";

const inputCls =
  "w-full rounded-lg border border-line bg-canvas/60 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

function Frame({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface shadow-card">
      <div className="border-b border-line px-5 py-4">
        <div className="text-sm font-bold text-ink">{title}</div>
        <div className="text-[11.5px] text-ink-soft">{desc}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ================= SUMBER DANA ================= */

export function SumberDanaTab({ nonce }: { nonce: number }) {
  const [rows, setRows] = useState<{ id: number; name: string; description: string | null; active: boolean }[] | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/sumber-dana");
    const d = await res.json();
    setRows(d.rows);
  }, []);
  useEffect(() => {
    load();
  }, [load, nonce]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/sumber-dana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc }),
    });
    const d = await res.json();
    if (!res.ok) return setErr(d.error ?? "Gagal");
    setName("");
    setDesc("");
    await load();
  }

  async function saveEdit(id: number) {
    const res = await fetch(`/api/sumber-dana/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    setEditId(null);
    if (res.ok) await load();
  }

  async function remove(id: number) {
    if (!confirm("Hapus / nonaktifkan sumber dana ini?")) return;
    await fetch(`/api/sumber-dana/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <Frame title="Kelola Sumber Dana" desc="Sumber dana yang dapat ditetapkan pada data BNBA oleh admin.">
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={add} className="h-fit space-y-3 rounded-xl border border-dashed border-line bg-canvas/50 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            <IconPlus size={13} /> Tambah sumber dana
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama, mis. APBD Kabupaten Konawe" className={inputCls} />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Deskripsi (opsional)" className={inputCls} />
          {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800">
            <IconPlus size={13} /> Tambah
          </button>
        </form>

        <ul className="space-y-2">
          {(rows ?? []).map((s) =>
            editId === s.id ? (
              <li key={s.id} className="space-y-2 rounded-lg border border-brand-300 bg-brand-50/50 p-3">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
                <input value={editDesc ?? ""} onChange={(e) => setEditDesc(e.target.value)} placeholder="Deskripsi" className={inputCls} />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(s.id)} className="inline-flex items-center gap-1 rounded-lg bg-brand-700 px-3 py-1.5 text-[11.5px] font-bold text-white hover:bg-brand-800">
                    <IconCheck size={12} /> Simpan
                  </button>
                  <button onClick={() => setEditId(null)} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-bold text-ink-soft hover:bg-black/5">
                    <IconX size={12} /> Batal
                  </button>
                </div>
              </li>
            ) : (
              <li key={s.id} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/40 px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className={"text-[13px] font-bold " + (s.active ? "text-ink" : "text-ink-soft line-through")}>
                    {s.name}
                    {!s.active && <span className="ml-2 rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-bold uppercase no-underline">nonaktif</span>}
                  </div>
                  {s.description && <div className="truncate text-[11px] text-ink-soft">{s.description}</div>}
                </div>
                <button
                  onClick={() => {
                    setEditId(s.id);
                    setEditName(s.name);
                    setEditDesc(s.description ?? "");
                  }}
                  className="rounded-md border border-line p-2 text-ink-soft hover:bg-black/5 hover:text-ink"
                  title="Ubah"
                >
                  <IconEdit size={13} />
                </button>
                <button onClick={() => remove(s.id)} className="rounded-md border border-line p-2 text-ink-soft hover:bg-red-50 hover:text-red-600" title="Hapus">
                  <IconTrash size={13} />
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
    </Frame>
  );
}

/* ================= RANGKUMAN BERANDA ================= */

export function RangkumanTab() {
  const [f, setF] = useState<{ title: string; tahun: string; anggaran: string; body: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/rangkuman")
      .then((r) => r.json())
      .then((d) => {
        if (d.row)
          setF({ title: d.row.title, tahun: d.row.tahun ?? "", anggaran: d.row.anggaran ?? "", body: d.row.body });
        else setF({ title: "", tahun: "", anggaran: "", body: "" });
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f) return;
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/rangkuman", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(d.error ?? "Gagal menyimpan");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  }

  if (!f) return <div className="rounded-xl border border-line bg-surface p-10 text-center text-sm text-ink-soft shadow-card">Memuat…</div>;

  return (
    <Frame title="Rangkuman Program Bantuan (Beranda)" desc="Narasi ini tampil pada kartu rangkuman di halaman Beranda.">
      <form onSubmit={save} className="max-w-2xl space-y-4">
        <label className="block">
          <span className="text-xs font-bold text-ink">Judul program</span>
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls + " mt-1.5"} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold text-ink">Tahun</span>
            <input value={f.tahun} onChange={(e) => setF({ ...f, tahun: e.target.value })} className={inputCls + " mt-1.5"} placeholder="2025" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-ink">Anggaran</span>
            <input value={f.anggaran} onChange={(e) => setF({ ...f, anggaran: e.target.value })} className={inputCls + " mt-1.5"} placeholder="Rp …" />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-bold text-ink">Narasi rangkuman</span>
          <textarea
            value={f.body}
            onChange={(e) => setF({ ...f, body: e.target.value })}
            rows={6}
            className={inputCls + " mt-1.5 leading-relaxed"}
          />
        </label>
        {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
        <div className="flex items-center gap-3">
          <button
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            <IconCheck size={13} /> {busy ? "Menyimpan…" : "Simpan rangkuman"}
          </button>
          {saved && <span className="text-xs font-bold text-emerald-700">Tersimpan ✓</span>}
        </div>
      </form>
    </Frame>
  );
}

/* ================= KELOLA STATUS (SUPER ADMIN) ================= */

export function StatusesTab() {
  const [rows, setRows] = useState<{ id: number; name: string; color: string; sortOrder: number }[] | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#b45309");
  const [order, setOrder] = useState("99");
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<Record<number, { name: string; color: string; order: string }>>({});

  const load = useCallback(async () => {
    const res = await fetch("/api/statuses");
    const d = await res.json();
    setRows(d.rows);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/statuses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, sortOrder: Number(order) }),
    });
    const d = await res.json();
    if (!res.ok) return setErr(d.error ?? "Gagal");
    setName("");
    setOrder(String((rows?.length ?? 0) + 1));
    await load();
  }

  async function saveEdit(id: number) {
    const e2 = edit[id];
    if (!e2) return;
    await fetch(`/api/statuses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: e2.name, color: e2.color, sortOrder: Number(e2.order) }),
    });
    setEdit((m) => {
      const c = { ...m };
      delete c[id];
      return c;
    });
    await load();
  }

  async function remove(id: number) {
    if (!confirm("Hapus status ini?")) return;
    const res = await fetch(`/api/statuses/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (!res.ok) alert(d.error ?? "Gagal menghapus");
    await load();
  }

  return (
    <Frame
      title="Pengelolaan Status Penanganan (Super Admin)"
      desc="Alur status Usulan Baru → Tahap Verifikasi → Masuk SK → Selesai dapat ditambah/ubah. Status yang masih dipakai data tidak dapat dihapus."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={add} className="h-fit space-y-3 rounded-xl border border-dashed border-line bg-canvas/50 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Tambah status baru</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama status, mis. Tahap Konstruksi" className={inputCls} />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-ink">
              Warna
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-12 cursor-pointer rounded border border-line bg-transparent" />
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-ink">
              Urutan
              <input type="number" min={1} value={order} onChange={(e) => setOrder(e.target.value)} className="w-16 rounded-lg border border-line bg-canvas/60 px-2 py-1.5 text-sm" />
            </label>
          </div>
          {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800">
            <IconPlus size={13} /> Tambah status
          </button>
        </form>

        <ul className="space-y-2">
          {(rows ?? []).map((s) => {
            const e = edit[s.id];
            return e ? (
              <li key={s.id} className="space-y-2 rounded-lg border border-brand-300 bg-brand-50/50 p-3">
                <div className="flex gap-2">
                  <input value={e.name} onChange={(ev) => setEdit({ ...edit, [s.id]: { ...e, name: ev.target.value } })} className={inputCls} />
                  <input type="color" value={e.color} onChange={(ev) => setEdit({ ...edit, [s.id]: { ...e, color: ev.target.value } })} className="h-9 w-12 cursor-pointer rounded border border-line" />
                  <input type="number" value={e.order} onChange={(ev) => setEdit({ ...edit, [s.id]: { ...e, order: ev.target.value } })} className="w-16 rounded-lg border border-line bg-canvas/60 px-2 text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(s.id)} className="inline-flex items-center gap-1 rounded-lg bg-brand-700 px-3 py-1.5 text-[11.5px] font-bold text-white">
                    <IconCheck size={12} /> Simpan
                  </button>
                  <button onClick={() => setEdit((m) => { const c = { ...m }; delete c[s.id]; return c; })} className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-bold text-ink-soft">
                    Batal
                  </button>
                </div>
              </li>
            ) : (
              <li key={s.id} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/40 px-3.5 py-2.5">
                <span className="h-3.5 w-3.5 rounded-full border border-white shadow" style={{ backgroundColor: s.color }} />
                <span className="flex-1 text-[13px] font-bold text-ink">{s.name}</span>
                <span className="text-[11px] font-semibold text-ink-soft">urutan {s.sortOrder}</span>
                <button
                  onClick={() => setEdit({ ...edit, [s.id]: { name: s.name, color: s.color, order: String(s.sortOrder) } })}
                  className="rounded-md border border-line p-2 text-ink-soft hover:bg-black/5 hover:text-ink"
                >
                  <IconEdit size={13} />
                </button>
                <button onClick={() => remove(s.id)} className="rounded-md border border-line p-2 text-ink-soft hover:bg-red-50 hover:text-red-600">
                  <IconTrash size={13} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Frame>
  );
}
