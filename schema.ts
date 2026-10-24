import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  doublePrecision,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["admin", "superadmin"]);

export type User = typeof users.$inferSelect;
export type Bnba = typeof bnba.$inferSelect;
export type Status = typeof statuses.$inferSelect;
export type SumberDana = typeof sumberDana.$inferSelect;

/* ============ USERS ============ */
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull().unique(),
  passwordHash: text().notNull(),
  fullName: text().notNull(),
  role: roleEnum().notNull().default("admin"),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============ STATUS PENANGANAN ============ */
export const statuses = pgTable("statuses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  color: text().notNull().default("#b45309"),
  sortOrder: integer().notNull().default(0),
});

/* ============ SUMBER DANA ============ */
export const sumberDana = pgTable("sumber_dana", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  description: text(),
  active: boolean().notNull().default(true),
});

/* ============ DATA BNBA (hasil Google Form via Spreadsheet) ============ */
export const bnba = pgTable(
  "bnba",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    // Kunci sinkronisasi: NIK jika tersedia, selain itu slug nama+kecamatan+desa
    extKey: text("ext_key").notNull().unique(),
    nik: text().notNull(),
    nama: text().notNull(),
    jenisKelamin: text().notNull().default("Laki-laki"),
    umur: integer(),
    pekerjaan: text(),
    pendidikan: text(),
    jumlahTanggungan: integer(),
    penghasilan: text(),
    kondisiKhusus: text(),
    alamat: text(),
    rtRw: text(),
    desaKelurahan: text().notNull(),
    kecamatan: text().notNull(),
    lat: doublePrecision(),
    lng: doublePrecision(),
    kondisiRumah: text(),
    luasRumah: integer(),
    bahanDinding: text(),
    bahanAtap: text(),
    bahanLantai: text(),
    photoUrl: text(),
    catatan: text(),
    statusId: integer("status_id")
      .notNull()
      .references(() => statuses.id),
    sumberDanaId: integer("sumber_dana_id").references(() => sumberDana.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("bnba_kecamatan_idx").on(t.kecamatan),
    index("bnba_status_idx").on(t.statusId),
    index("bnba_desa_idx").on(t.desaKelurahan),
  ],
);

/* ============ RIWAYAT PERUBAHAN STATUS ============ */
export const bnbaHistory = pgTable("bnba_status_history", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  bnbaId: integer("bnba_id")
    .notNull()
    .references(() => bnba.id, { onDelete: "cascade" }),
  statusId: integer("status_id").notNull().references(() => statuses.id),
  note: text(),
  changedBy: text(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============ RANGKUMAN PROGRAM (beranda, editable admin) ============ */
export const rangkuman = pgTable("program_rangkuman", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text().notNull(),
  body: text().notNull(),
  tahun: text(),
  anggaran: text(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============ AUDIT LOG ============ */
export const auditLog = pgTable("audit_log", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull(),
  action: text().notNull(),
  entity: text(),
  entityId: text(),
  details: text(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============ LOG SINKRONISASI SPREADSHEET ============ */
export const syncLog = pgTable("sync_log", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  source: text().notNull(),
  message: text().notNull(),
  rowsAdded: integer().notNull().default(0),
  rowsUpdated: integer().notNull().default(0),
  rowsTotal: integer().notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
