import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Sign of the Times | Custom Signs and Banners in Vancouver, WA",
    template: "%s | Sign of the Times"
  },
  description:
    "Request custom signs, banners, yard signs, real estate signs, decals, storefront signage, and vehicle lettering from Sign of the Times in Vancouver, WA.",
  keywords: [
    "sign shop Vancouver WA",
    "custom signs Vancouver WA",
    "banners Vancouver WA",
    "yard signs Vancouver WA",
    "real estate signs Vancouver WA",
    "vehicle lettering Vancouver WA",
    "sign company Vancouver WA"
  ],
  openGraph: {
    title: "Sign of the Times | Vancouver WA Sign Company",
    description:
      "Custom signs, banners, decals, yard signs, real estate signs, storefront signage, and vehicle lettering for Vancouver, WA and Portland metro.",
    type: "website",
    locale: "en_US"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Anton&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
