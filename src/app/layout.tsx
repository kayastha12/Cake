import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sweet Delights | Luxury Cake Boutique & Artisanal Desserts",
  description: "Experience Handcrafted Cakes Made With Love. Order customizable birthday, anniversary, and wedding cakes online from Sweet Delights Cake Boutique. Eggless options available.",
  keywords: ["cakes", "birthday cake", "wedding cake", "custom cakes", "sweet delights", "chocolate cake", "bakery online"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <CartProvider>
                <WishlistProvider>
                  <Navbar />
                  <CartDrawer />
                  <main className="grow">{children}</main>
                  <Footer />
                </WishlistProvider>
              </CartProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
