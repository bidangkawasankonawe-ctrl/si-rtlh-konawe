"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={
        "relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors " +
        (active
          ? "text-brand-900 bg-brand-100"
          : "text-ink-soft hover:text-ink hover:bg-black/5")
      }
    >
      {label}
    </Link>
  );
}
