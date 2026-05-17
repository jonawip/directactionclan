import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { Nav } from "@/components/Nav";
import { SessionKeeper } from "@/components/SessionKeeper";
import "./globals.css";

const futura = Jost({
  variable: "--font-futura",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Direct Action Games",
  description: "Post games and join your clan's sessions",
  icons: {
    icon: "/images/brand/da-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body className={`${futura.variable} font-body`} suppressHydrationWarning>
        <SessionKeeper />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="site-wrap">
          <Nav />
          <main id="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
