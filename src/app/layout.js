import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LocationPopup from "./components/LocationPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PizzGer - Order Delicious Pizzas, Burgers & Fast Food Online",
  description: "Order fresh pizzas, crispy burgers, shawarmas, and exclusive deals online from PizzGer, Tipu Road Rawalpindi. Fast delivery!",
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
        <LocationPopup />
        <Header />
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}