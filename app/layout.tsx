import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://quinvo-app.vercel.app"),

  title: {
    default: "Quinvo",
    template: "%s • Quinvo",
  },

  description:
    "Gérez simplement votre activité d’auto-entrepreneur. Facturation, suivi du chiffre d’affaires et préparation des déclarations fiscales en quelques secondes.",
  applicationName: "Quinvo",
  generator: "Next.js",
  creator: "Julien Fernandes",
  publisher: "Julien Fernandes",
  keywords: [
    "Quinvo",
    "facture",
    "auto-entrepreneur",
    "micro-entrepreneur",
    "france",
    "clients",
  ],
  authors: [
    { name: "Julien Fernandes", url: "https://julien-fernandes.vercel.app" },
  ],

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    siteName: "Quinvo",
    title: "Quinvo",
    description:
      "La solution simple et moderne pour gérer votre activité d’auto-entrepreneur.",
    url: "https://quinvo-app.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Quinvo – Facturation simplifiée pour auto-entrepreneurs",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Quinvo",
    description:
      "La solution simple et moderne pour gérer votre activité d’auto-entrepreneur.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  appleWebApp: {
    capable: true,
    title: "Quinvo",
    statusBarStyle: "default",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        <SpeedInsights />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
