"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast("Thank you for subscribing to our newsletter!", "success");
    setEmail("");
  };

  return (
    <footer className="bg-card text-foreground/70 border-t border-border pt-20 pb-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Sweet Delights
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-foreground/40 font-medium -mt-1 font-sans">
                Luxury Cake Boutique
              </span>
            </Link>
            <p className="text-xs text-foreground/60 leading-relaxed max-w-xs mt-2">
              Handcrafting artisanal, gourmet cakes and sweet pastries using only the finest premium organic ingredients. Made with love, designed for your most precious milestones.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-secondary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-foreground"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-secondary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-foreground"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-secondary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-foreground"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-6">Explore</h3>
            <ul className="space-y-4">
              {[
                { label: "Home", href: "/" },
                { label: "Our Collection", href: "/shop" },
                { label: "Our Story", href: "/about" },
                { label: "Contact Us", href: "/contact" },
                { label: "FAQ & Help", href: "/contact#faq" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-semibold uppercase tracking-wider text-foreground/60 hover:text-foreground transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts & Address */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-6">
              Boutique Hours
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-foreground/60 shrink-0 mt-0.5" />
                <div className="text-xs text-foreground/60">
                  <p className="font-semibold text-foreground">Mon - Sat</p>
                  <p className="text-[11px] mt-0.5">9:00 AM - 9:00 PM</p>
                  <p className="font-semibold text-foreground mt-2">Sunday</p>
                  <p className="text-[11px] mt-0.5">10:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-foreground/60 shrink-0 mt-0.5" />
                <span className="text-xs text-foreground/60 leading-relaxed">
                  123 Baker's Street, Luxury Arcade, Connaught Place, New Delhi - 110001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-foreground/60 shrink-0" />
                <span className="text-xs text-foreground/60 font-semibold">+91 98765 43210</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Newsletter
            </h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Subscribe to receive updates, cake care tips, and exclusive boutique offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary w-full"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar Divider */}
        <div className="border-t border-border pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-foreground/40">
            &copy; {new Date().getFullYear()} Sweet Delights Cake Boutique. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[11px] text-foreground/40">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms & Conditions
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
