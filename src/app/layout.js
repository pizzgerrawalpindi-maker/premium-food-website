import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LocationPopup from "./components/LocationPopup";
import RestaurantSchema from "./components/RestaurantSchema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://pizzgerfoods.pk'),
  title: "PizzGer Foods | Best Pizza & Fast Food Delivery in Rawalpindi & Islamabad",
  description: "Craving hot pizza or crispy zinger burger? Order online from PizzGer Foods. Fast food & late night delivery across Rawalpindi & Islamabad.",
  keywords: [
    "pizza rawalpindi",
    "pizza islamabad",
    "best pizza in rawalpindi",
    "best pizza in islamabad",
    "food delivery rawalpindi",
    "food delivery islamabad",
    "late night food delivery rawalpindi",
    "late night food delivery islamabad",
    "best zinger burger in rawalpindi",
    "pizza deals rawalpindi",
    "pizza deals islamabad",
    "fast food delivery near me",
    "pizzger menu",
    "pizzger foods",
    "shawarma rawalpindi",
    "paratha rawalpindi",
    "pasta rawalpindi",
    "chicken wings islamabad",
    "chaat rawalpindi",
    "gol gappay rawalpindi",
    "milkshake rawalpindi",
    "best shawarma in rawalpindi",
    "Tipu road rawalpindi food",
    "late night burgers islamabad",
    "burger rawalpindi",
    "fast food deals rawalpindi",
    "online food order rawalpindi",
    "best fast food in islamabad",
    "online pizza order islamabad",
    "large pizza deals rawalpindi"
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "PizzGer Foods | Best Pizza & Fast Food Delivery in Rawalpindi & Islamabad",
    description: "Order fresh pizza, zinger burgers, and exclusive deals online from PizzGer Foods. Delivering across Rawalpindi and Islamabad.",
    url: "https://pizzgerfoods.pk",
    siteName: "PizzGer Foods",
    images: [{ url: "/images/logo.webp", width: 800, height: 800 }],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PizzGer Foods | Best Pizza & Fast Food Delivery in Rawalpindi & Islamabad",
    description: "Order fresh pizza, zinger burgers, and exclusive deals online from PizzGer Foods. Delivering across Rawalpindi and Islamabad.",
    images: ["/images/logo.webp"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 flex flex-col min-h-screen`}
      >
        <RestaurantSchema />
        <LocationPopup />
        <Header />
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}