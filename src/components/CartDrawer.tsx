"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
  } = useCart();

  if (!isCartOpen) return null;

  // Free shipping logic
  const freeShippingThreshold = 2000;
  const amountToFreeShipping = freeShippingThreshold - cartSubtotal;
  const shippingPercent = Math.min((cartSubtotal / freeShippingThreshold) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border flex flex-col shadow-2xl h-full animate-slide-left transition-colors duration-300">
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Your Selection ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator for Free Shipping */}
          {cart.length > 0 && (
            <div className="px-6 py-4 border-b border-border/50 bg-[#FBF8F3] dark:bg-accent/10 flex flex-col gap-2 transition-colors">
              <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                {amountToFreeShipping > 0 ? (
                  <>
                    Add <span className="font-bold text-primary">₹{amountToFreeShipping.toLocaleString("en-IN")}</span> more for <span className="font-semibold text-primary">Free Luxury Delivery</span>!
                  </>
                ) : (
                  <span className="text-primary font-semibold">🎉 You have unlocked Free Luxury Delivery!</span>
                )}
              </p>
              <div className="w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${shippingPercent}%` }} 
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border/40">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-primary/40" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold">Your cart is empty</h3>
                  <p className="text-sm text-foreground/60 mt-2 max-w-xs mx-auto">
                    Explore our cake collections and begin adding items to your boutique selection.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 py-2 px-6 rounded-xl border border-primary/50 text-primary font-bold text-xs hover:bg-primary/5 transition-all"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-5 py-5 items-start">
                  {/* Larger Image */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-border shadow-sm relative bg-foreground/5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="grow flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-foreground line-clamp-1 leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-foreground/50 font-semibold tracking-wide uppercase">
                      Portion: {item.weight}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      {/* Price */}
                      <span className="text-sm font-bold text-primary dark:text-primary-foreground">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>

                      {/* Cleaner Quantity Controls */}
                      <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden h-7">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-full px-2.5 hover:bg-foreground/5 text-foreground/60 transition-colors flex items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-full px-2.5 hover:bg-foreground/5 text-foreground/60 transition-colors flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 rounded-lg text-foreground/35 hover:text-red-500 transition-all shrink-0 mt-0.5"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer (Checkout Actions) */}
          {cart.length > 0 && (
            <div className="px-6 py-6 border-t border-border bg-[#FBF8F3] dark:bg-[#1C1315] flex flex-col gap-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/75">Selection Subtotal</span>
                <span className="font-serif text-lg font-bold text-primary dark:text-primary-foreground">
                  ₹{cartSubtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-xs text-foreground/50 leading-relaxed">
                Taxes, delivery fees, and custom boutique packaging details are added at final checkout.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="py-3.5 px-4 rounded-2xl border border-primary/50 text-primary dark:text-primary-foreground text-center text-xs font-bold hover:bg-primary/5 transition-all shadow-sm"
                >
                  View Selection
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground text-center text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  Secure Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-left {
          animation: slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
