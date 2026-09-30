import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

export const metadata: Metadata = {
  title: "AI for Everyone",
  description: "A twelve-week AI course",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <nav className="border-b border-line">
          <div className="max-w-3xl mx-auto px-8 py-4 flex items-center gap-8 text-sm">
            <Link href="/" className="font-display font-bold text-lg text-ink">
              AI for Everyone
            </Link>
            <Link href="/dashboard" className="text-slate hover:text-steel">
              My submissions
            </Link>
            <Link href="/instructor" className="text-slate hover:text-steel">
              Instructor
            </Link>
            <Link href="/login" className="text-steel font-semibold ml-auto">
              Sign in
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}