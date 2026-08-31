"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Plus, Minus, Trash2, ArrowRight, Tag, ShieldCheck, Ticket, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [shippingMethod, setShippingMethod] = useState("standard"); // standard, express

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartSubtotal }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon(data.coupon);
        toast(`Coupon "${data.coupon.code}" applied successfully!`, "success");
      } else {
        const data = await res.json();
        toast(data.error || "Invalid coupon code.", "error");
      }
    } catch (err) {
      toast("Error applying coupon code.", "error");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast("Coupon removed.", "info");
  };

  // Shipping Calculations
  const shippingCost = shippingMethod === "express" ? 250 : cartSubtotal > 1500 ? 0 : 99;

  // Coupon discount calculation
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "PERCENTAGE") {
      return (cartSubtotal * appliedCoupon.discountValue) / 100;
    } else {
      return Math.min(appliedCoupon.discountValue, cartSubtotal); // can't exceed subtotal
    }
  };

  const discountAmount = calculateDiscount();
  const grandTotal = cartSubtotal - discountAmount + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center gap-6 min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border border-border">
          <ShoppingBag className="w-10 h-10 text-foreground/40" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-2xl font-bold">Your Cake Basket is Empty</h1>
          <p className="text-xs text-foreground/60 max-w-sm">
            You haven't chosen any fresh cakes yet. Explore our collection to find your perfect celebration cake.
          </p>
        </div>
        <Link
          href="/shop"
          className="py-4 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col gap-16">
      
      {/* Page Header */}
      <div className="text-left flex flex-col gap-3">
        <span className="text-xs font-bold tracking-[0.25em] uppercase text-foreground/45">
          Your Selection
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-foreground">Shopping Cart</h1>
        <p className="text-sm text-foreground/60 leading-relaxed max-w-lg">Review your selections and proceed to checkout.</p>
        <div className="w-full h-[1px] bg-border mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
        
        {/* Cart Item Cards/Table (Left Col - 2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-[20px] overflow-hidden shadow-sm p-8 flex flex-col gap-8">
            
            {/* Header label for large screens */}
            <div className="hidden sm:grid grid-cols-5 text-[9px] font-bold uppercase tracking-widest text-foreground/40 border-b border-border pb-4">
              <span className="col-span-2">Cake Selection</span>
              <span className="text-center">Weight</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total Price</span>
            </div>

            {/* List */}
            <div className="divide-y divide-border flex flex-col">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-5 items-center gap-6 py-6 first:pt-0 last:pb-0"
                >
                  
                  {/* Product Details (Col 2) */}
                  <div className="sm:col-span-2 flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-border shrink-0 relative bg-secondary">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="grow">
                      <h3 className="text-sm font-bold line-clamp-1 text-foreground leading-snug">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-1.5 mt-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Weight column */}
                  <div className="text-left sm:text-center flex sm:flex-col justify-between sm:justify-center border-b border-border/40 pb-2 sm:pb-0 sm:border-b-0">
                    <span className="text-[9px] font-bold uppercase tracking-widest sm:hidden text-foreground/50">Weight:</span>
                    <span className="text-xs font-bold text-foreground/80 uppercase">{item.weight}</span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex sm:justify-center items-center justify-between border-b border-border/40 pb-2 sm:pb-0 sm:border-b-0">
                    <span className="text-[9px] font-bold uppercase tracking-widest sm:hidden text-foreground/50">Qty:</span>
                    <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden h-8 scale-90">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-full px-2.5 hover:bg-foreground/5 text-foreground/60 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-full px-2.5 hover:bg-foreground/5 text-foreground/60 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                    <span className="text-[9px] font-bold uppercase tracking-widest sm:hidden text-foreground/50">Total:</span>
                    <span className="text-sm font-bold text-foreground">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Coupon and Shipping Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Coupon Section */}
            <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-foreground">
                <Ticket className="w-4 h-4" /> Coupon Discount
              </h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Apply a promo code to receive instant savings on your cakes.
              </p>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary border border-border">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-foreground/80" />
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {appliedCoupon.code} applied!
                      </p>
                      <p className="text-[10px] text-foreground/50 uppercase mt-0.5">
                        Saved ₹{discountAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (SWEET10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-foreground uppercase font-bold tracking-widest shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={isValidatingCoupon || !couponCode}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all disabled:opacity-50 uppercase tracking-widest cursor-pointer"
                  >
                    {isValidatingCoupon ? "..." : "Apply"}
                  </button>
                </form>
              )}
            </div>

            {/* Shipping Selector Section */}
            <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-foreground">
                <ShieldCheck className="w-4.5 h-4.5" /> Delivery Shipping
              </h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Select your preferred delivery speed. Free standard shipping on orders above ₹1,500!
              </p>

              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-[#FBFBFB] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">Standard Delivery</p>
                      <p className="text-[10px] text-foreground/50">Chilled transit within 24h</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground/80">
                    {cartSubtotal > 1500 ? "FREE" : "₹99"}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-[#FBFBFB] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">Express Delivery</p>
                      <p className="text-[10px] text-foreground/50">Same-day priority dispatch</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground/80">₹250</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Order Summary (Right Col - 1/3) */}
        <div className="bg-card border border-border rounded-[20px] p-8 shadow-sm flex flex-col gap-6 lg:sticky lg:top-28">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground border-b border-border pb-4">
            Order Summary
          </h3>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-xs text-foreground/75">
              <span>Bag Subtotal</span>
              <span className="font-semibold text-foreground">
                ₹{cartSubtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-foreground font-semibold">
                <span>Coupon Discount</span>
                <span>
                  -₹{discountAmount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="flex justify-between text-xs text-foreground/75">
              <span>Shipping & Delivery</span>
              <span className="font-semibold text-foreground">
                {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
              </span>
            </div>

            <div className="border-t border-border pt-4 mt-2 flex justify-between items-center">
              <span className="text-sm font-bold text-foreground">Total Price</span>
              <span className="font-sans text-xl font-bold text-foreground">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Link
            href={`/checkout?coupon=${appliedCoupon ? appliedCoupon.code : ""}&shipping=${shippingMethod}`}
            className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-center font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
}
