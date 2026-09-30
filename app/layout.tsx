import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "AI for Everyone",
  description: "A twelve-week AI course",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b bg-white">
          <div className="max-w-4xl mx-auto px-8 py-3 flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="font-bold">
              AI for Everyone
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-black">
              My submissions
            </Link>
            <Link href="/instructor" className="text-gray-600 hover:text-black">
              Instructor
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-black ml-auto">
              Sign in
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}