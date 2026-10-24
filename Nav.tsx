import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { LogoMark, IconLogout } from "./icons";
import { NavLink } from "./NavLink";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/data-bnba", label: "Data BNBA" },
  { href: "/statistik", label: "Statistik" },
  { href: "/peta", label: "Peta Sebaran" },
  { href: "/admin", label: "Admin" },
];

export default async function Nav() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <LogoMark size={36} />
          <div className="leading-tight">
            <div className="font-display text-[15px] font-bold tracking-tight text-brand-900">
              SI-RTLH
            </div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Kabupaten Konawe
            </div>
          </div>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 overflow-x-auto">
          {LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-line">
          {user ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                {user.fullName.slice(0, 1).toUpperCase()}
              </div>
              <div className="leading-tight max-w-[130px]">
                <div className="truncate text-xs font-bold text-ink">{user.fullName}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                  {user.role === "superadmin" ? "Super Admin" : "Admin"}
                </div>
              </div>
              <Link
                href="/api/auth/logout"
                title="Keluar"
                className="ml-1 rounded-lg p-2 text-ink-soft hover:bg-black/5 hover:text-ink"
              >
                <IconLogout size={16} />
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-card hover:bg-brand-800"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
