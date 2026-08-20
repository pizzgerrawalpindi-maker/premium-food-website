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
  title: "PizzGer - Order Delicious Pizzas, Burgers & Fast Food Online",
  description: "Order fresh pizzas, crispy burgers, shawarmas, and exclusive deals online from PizzGer, Tipu Road Rawalpindi. Fast delivery!",
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
    title: "PizzGer - Order Delicious Pizzas, Burgers & Fast Food Online",
    description: "Order fresh pizzas, crispy burgers, shawarmas, and exclusive deals online from PizzGer, Tipu Road Rawalpindi. Fast delivery!",
    url: "https://pizzgerfoods.pk",
    siteName: "Pizzger",
    images: [{ url: "/images/logo.webp", width: 800, height: 800 }],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PizzGer - Order Delicious Pizzas, Burgers & Fast Food Online",
    description: "Order fresh pizzas, crispy burgers, shawarmas, and exclusive deals online from PizzGer, Tipu Road Rawalpindi.",
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