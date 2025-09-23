import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ParkEase - Smart Parking Management",
  description: "Modern parking lot management system with AI-powered insights",
  keywords: ["parking", "management", "smart", "AI", "dashboard"],
  authors: [{ name: "ParkEase Team" }],
  creator: "ParkEase",
  publisher: "ParkEase",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://parkease.com",
    title: "ParkEase - Smart Parking Management",
    description: "Modern parking lot management system with AI-powered insights",
    siteName: "ParkEase",
  },
  twitter: {
    card: "summary_large_image",
    title: "ParkEase - Smart Parking Management",
    description: "Modern parking lot management system with AI-powered insights",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarnings>
      <body className={inter.className} suppressHydrationWarnings>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}