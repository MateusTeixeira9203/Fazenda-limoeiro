import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Limoeiro · Gestão de pessoas",
  description:
    "Demonstração interativa da gestão de funcionários da Fazenda Limoeiro.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
