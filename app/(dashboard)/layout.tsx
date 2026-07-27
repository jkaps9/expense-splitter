import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import siteConfig from "@/data/site-config.json";
import { signOut } from "./actions";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: siteConfig.siteName,
  description: siteConfig.coreValueProp,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${ibmPlexMono.variable}`}>
      <body>
        <header>
          <div className="container row">
            <p>Hey, [DisplayName]</p>
            <form action={signOut} className="btn-form">
              <button className="btn" type="submit">
                Logout
              </button>
            </form>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
