import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://humanize.afifzafri.com";

export const metadata: Metadata = {
  title: "Talk Like Human - AI Text Humanizer & Detector Bypass",
  description: "Instantly transform robotic AI text into natural, engaging content. Bypass AI detectors, improve readability, and connect genuinely with your audience.",
  keywords: ["ai humanizer", "bypass ai detection", "rewrite ai text", "chatgpt humanizer", "ai text converter", "undetectable ai"],
  authors: [{ name: "Talk Like Human" }],
  creator: "Talk Like Human",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "Talk Like Human - AI Text Humanizer",
    description: "Transform robotic AI text into natural, human-sounding writing. Bypass AI detectors.",
    siteName: "Talk Like Human",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Talk Like Human Preview",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talk Like Human - AI Text Humanizer",
    description: "Transform robotic AI text into natural, human-sounding writing.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest'
      }
    ]
  },
  metadataBase: new URL(appUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Talk Like Human",
    "description": "AI Text Humanizer that rewrites AI-generated text to sound natural and fluid.",
    "url": appUrl,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen bg-[#fafafa] text-gray-900 selection:bg-blue-100 selection:text-blue-900`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
