import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "../components/theme-provider";
import { ConvexClientProvider } from "./convex-client-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Planteria turns a specific product mission into an actionable plan with outcomes, deliverables, and doneWhen criteria in minutes.";

const title = "Planteria – Ship a crisp plan for your next feature";

const ogImageUrl = "https://planteria.app/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://planteria.app"),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "https://planteria.app/",
    siteName: "Planteria",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Planteria workspace showing structured plan outline",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImageUrl],
  },
  keywords: [
    "planteria",
    "ai planning tool",
    "product planning",
    "ship feature",
    "indie developer",
    "roadmap",
    "done when",
  ],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="dark" attribute="class">
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
