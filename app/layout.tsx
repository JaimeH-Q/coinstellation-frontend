import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Cargamos la fuente Nunito oficial con los pesos utilizados en el diseño (400, 600 y 800)
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coinstellation - Panel de Control",
  description: "Estado global del ecosistema y monitoreo en tiempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <head>
        {/* FontAwesome CDN para toda la iconografía minimalista del dashboard */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
