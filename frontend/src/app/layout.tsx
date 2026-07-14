import type { Metadata } from "next";
import { Outfit, Space_Grotesk, Space_Mono, Roboto_Condensed, Instrument_Serif, Libre_Bodoni } from "next/font/google";
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

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-condensed",
});

const gastonHoney = localFont({
  src: "../../public/fonts/gaston Honey.otf",
  variable: "--font-gaston-honey",
  display: "swap",
});

const universo = localFont({
  src: [
    { path: "../../public/fonts/Fontspring-DEMO-universo-thin.otf", weight: "100" },
    { path: "../../public/fonts/Fontspring-DEMO-universo-light.otf", weight: "300" },
    { path: "../../public/fonts/Fontspring-DEMO-universo-regular.otf", weight: "400" },
    { path: "../../public/fonts/Fontspring-DEMO-universo-bold.otf", weight: "700" },
    { path: "../../public/fonts/Fontspring-DEMO-universo-black.otf", weight: "900" },
  ],
  variable: "--font-universo",
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

const gallery = localFont({
  src: "../../public/fonts/Gallery.otf",
  variable: "--font-gallery",
  display: "swap",
});

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
      className={`${outfit.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${robotoCondensed.variable} ${gastonHoney.variable} ${instrumentSerif.variable} ${universo.variable} ${libreBodoni.variable} ${gmarketSans.variable} ${gallery.variable}`}
    >
      <body className="antialiased">
        <AuthWrapper>
          <SmoothScroll>{children}</SmoothScroll>
        </AuthWrapper>
      </body>
    </html>
  );
}
