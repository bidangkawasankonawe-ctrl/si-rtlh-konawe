import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...props }: P, children: React.ReactNode) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: P) =>
  base(p, <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>);

export const IconSearch = (p: P) =>
  base(p, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);

export const IconMapPin = (p: P) =>
  base(p, <><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></>);

export const IconChart = (p: P) =>
  base(p, <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>);

export const IconUsers = (p: P) =>
  base(p, <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4" /><path d="M17.5 14.4a6.5 6.5 0 0 1 4 5.6" /></>);

export const IconShield = (p: P) =>
  base(p, <><path d="M12 3 4.5 6v5c0 5 3.2 8.4 7.5 10 4.3-1.6 7.5-5 7.5-10V6Z" /><path d="m9 11.5 2.2 2.2L15.5 9.5" /></>);

export const IconRefresh = (p: P) =>
  base(p, <><path d="M20 11a8 8 0 0 0-14.9-3" /><path d="M4 5v4h4" /><path d="M4 13a8 8 0 0 0 14.9 3" /><path d="M20 19v-4h-4" /></>);

export const IconDownload = (p: P) =>
  base(p, <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" /></>);

export const IconUpload = (p: P) =>
  base(p, <><path d="M12 15V3" /><path d="m7 8 5-5 5 5" /><path d="M4 21h16" /></>);

export const IconChevronRight = (p: P) => base(p, <path d="m9 5 7 7-7 7" />);
export const IconChevronLeft = (p: P) => base(p, <path d="m15 5-7 7 7 7" />);

export const IconLogout = (p: P) =>
  base(p, <><path d="M9 4H5v16h4" /><path d="m15 8 4 4-4 4" /><path d="M19 12H9" /></>);

export const IconPlus = (p: P) => base(p, <><path d="M12 5v14" /><path d="M5 12h14" /></>);
export const IconTrash = (p: P) =>
  base(p, <><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /><path d="M10 11v5M14 11v5" /></>);

export const IconEdit = (p: P) =>
  base(p, <><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17Z" /><path d="m13.5 6.5 3 3" /></>);

export const IconCheck = (p: P) => base(p, <path d="m4.5 12.5 5 5 10-11" />);
export const IconX = (p: P) => base(p, <><path d="m5 5 14 14" /><path d="M19 5 5 19" /></>);

export const IconInfo = (p: P) =>
  base(p, <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01" /><path d="M11 12h1v5h1" /></>);

export const IconAlert = (p: P) =>
  base(p, <><path d="M12 3 2.5 20h19Z" /><path d="M12 9.5V14" /><path d="M12 17h.01" /></>);

export const IconExternal = (p: P) =>
  base(p, <><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M19 13v7H4V5h7" /></>);

export const IconClock = (p: P) =>
  base(p, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>);

export const IconWallet = (p: P) =>
  base(p, <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M15 15h3" /></>);

export const IconHammer = (p: P) =>
  base(p, <><path d="m14 6 4 4" /><path d="M12 8 5 15a2.1 2.1 0 0 0 3 3l7-7" /><path d="M13 5.5 15 3.5a2.1 2.1 0 0 1 3 0l2.5 2.5a2.1 2.1 0 0 1 0 3L18.5 11" /></>);

export const IconFile = (p: P) =>
  base(p, <><path d="M13 3H6v18h12V7Z" /><path d="M13 3v4h4" /><path d="M9 12h6M9 16h6" /></>);

export const IconGrid = (p: P) =>
  base(p, <><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>);

export const IconCamera = (p: P) =>
  base(p, <><path d="M4 8h3l2-3h6l2 3h3v12H4Z" /><circle cx="12" cy="13" r="3.5" /></>);

/** Logo SI-RTLH: rumah dengan garis dasar. */
export function LogoMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      <rect x="1" y="1" width="38" height="38" rx="10" fill="var(--color-brand-700)" />
      <path d="M9 20.5 20 11l11 9.5" fill="none" stroke="#e3a13c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 19v10.5h15V19" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 29.5v-6h6v6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
