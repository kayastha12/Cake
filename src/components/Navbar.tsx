"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import {
  User,
  Heart,
  ShoppingBag,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    await logout();
    toast("Logged out successfully", "info");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Sweet Delights
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-foreground/40 font-medium -mt-1 font-sans">
                Luxury Cake Boutique
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links (Spaced Out & Clean Indicator) */}
          <nav className="hidden md:flex space-x-12">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold tracking-widest uppercase transition-all relative py-1 hover:opacity-100 ${
                    isActive
                      ? "text-primary font-bold"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary rounded-full animate-fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-foreground/5 text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="p-2 rounded-full hover:bg-foreground/5 text-foreground/80 hover:text-foreground transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger (Redirects Directly to Dedicated Cart Page) */}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-foreground/5 text-foreground/80 hover:text-foreground transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth Menu */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full hover:bg-foreground/5 border border-border transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span className="hidden sm:inline text-xs font-bold max-w-[80px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2.5 w-48 rounded-xl shadow-xl border border-border bg-card py-2 z-50 animate-slide-in">
                      <div className="px-4 py-2 border-b border-border/80">
                        <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-semibold">Signed in as</p>
                        <p className="text-xs font-bold truncate text-primary mt-0.5">{user.email}</p>
                      </div>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-primary hover:bg-foreground/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-primary hover:bg-foreground/5 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        My Orders
                      </Link>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 py-2 px-4.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-foreground/5 text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-slide-in">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/75 hover:bg-foreground/5 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
