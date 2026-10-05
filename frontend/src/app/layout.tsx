import type { Metadata } from "next";
import { Outfit, Space_Grotesk, Roboto_Condensed, Instrument_Serif, Libre_Bodoni } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "./SmoothScroll";
import AuthWrapper from "./AuthWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const libreBodoni = Libre_Bodoni({
  weight: ["700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-libre-bodoni",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-condensed",
});

const atavian = localFont({
  src: "../../public/fonts/Atavian.otf",
  variable: "--font-atavian",
  display: "swap",
});

const tanPearl = localFont({
  src: "../../public/fonts/TAN-Pearl-Regular.otf",
  variable: "--font-tan-pearl",
  display: "swap",
});

const gmarketSans = localFont({
  src: [
    { path: "../../public/fonts/GmarketSansLight.otf", weight: "300" },
    { path: "../../public/fonts/GmarketSansMedium.otf", weight: "500" },
    { path: "../../public/fonts/GmarketSansBold.otf", weight: "700" },
  ],
  variable: "--font-gmarket-sans",
  display: "swap",
});

const boska = localFont({
  src: [
    { path: "../../public/fonts/Boska-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Boska-Bold.ttf", weight: "700" },
  ],
  variable: "--font-boska",
  display: "swap",
});

const zodiak = localFont({
  src: "../../public/fonts/Zodiak-Regular.otf",
  variable: "--font-zodiak",
  display: "swap",
}); // Force HMR

export const metadata: Metadata = {
  title: "Office of International Affairs | Bennett University",
  description:
    "Empowering Global Learning and Collaboration — Office of International Affairs at Bennett University. Explore programs, events, partnerships, and gallery.",
  keywords: [
    "Bennett University",
    "International Affairs",
    "OIA",
    "Global Learning",
    "Study Abroad",
    "International Programs",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable} ${libreBodoni.variable} ${robotoCondensed.variable} ${atavian.variable} ${tanPearl.variable} ${gmarketSans.variable} ${boska.variable} ${zodiak.variable} antialiased`}
    >
      <head>
        {/* DNS prefetch for external resources — saves 100-200ms of DNS lookup */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthWrapper>
          <SmoothScroll>{children}</SmoothScroll>
        </AuthWrapper>
      </body>
    </html>
  );
}
