import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400", "500", "600", "700", "800"] });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "SI-RTLH Kabupaten Konawe",
  description:
    "Sistem Informasi Rumah Tidak Layak Huni (RTLH) Kabupaten Konawe — pendataan BNBA, statistik, peta sebaran, dan pengelolaan status penanganan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${manrope.variable} ${grotesk.variable}`}>
      <body className="font-sans text-ink antialiased">
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line bg-surface">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="font-semibold">
                SI-RTLH Kabupaten Konawe · Dinas PUPR & Dinas Sosial
              </div>
              <div>
                Data pendataan berasal dari Google Form → Google Spreadsheet → disinkronkan otomatis.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
