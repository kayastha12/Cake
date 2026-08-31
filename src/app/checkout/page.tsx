"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, CheckCircle, Smartphone, Loader, Calendar } from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, cartSubtotal, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();

  // URL coupon/shipping parameters passed from Cart Page
  const urlCoupon = searchParams.get("coupon") || "";
  const urlShipping = searchParams.get("shipping") || "standard";

  // Checkout Step State
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping");

  // Form States
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD" | "WHATSAPP">("ONLINE");
  const [couponCode, setCouponCode] = useState(urlCoupon);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);

  // Success screen & Payment spinner states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Sync Auth User info on mount
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Load Coupon discount on load if code passed
  useEffect(() => {
    if (urlCoupon) {
      validateAndApplyCoupon(urlCoupon);
    }
  }, [urlCoupon]);

  const validateAndApplyCoupon = async (code: string) => {
    setIsLoadingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartSubtotal }),
      });

      if (res.ok) {
        const data = await res.json();
        setCouponCode(data.coupon.code);
        
        // Calculate discount
        if (data.coupon.discountType === "PERCENTAGE") {
          setCouponDiscount((cartSubtotal * data.coupon.discountValue) / 100);
        } else {
          setCouponDiscount(Math.min(data.coupon.discountValue, cartSubtotal));
        }
      } else {
        setCouponDiscount(0);
        setCouponCode("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCoupon(false);
    }
  };

  if (cart.length === 0 && step !== "confirmation") {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4 flex flex-col gap-6 min-h-[60vh] justify-center items-center">
        <h1 className="font-serif text-2xl font-bold">No Items to Checkout</h1>
        <p className="text-xs text-foreground/60 leading-relaxed">Add some delicious cakes to your shopping cart first.</p>
        <Link href="/shop" className="py-3.5 px-8 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:bg-primary/95 transition-all">
          Go to Shop
        </Link>
      </div>
    );
  }

  // Shipping cost
  const shippingCost = urlShipping === "express" ? 250 : cartSubtotal > 1500 ? 0 : 99;
  const grandTotal = cartSubtotal - couponDiscount + shippingCost;

  // Validate step 1 and proceed to step 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !address || !city || !zip || !deliveryDate) {
      toast("Please fill in all required delivery fields.", "error");
      return;
    }
    setStep("payment");
  };

  // Place order
  const handleSubmit = async () => {
    setIsProcessingPayment(true);

    const isWhatsapp = paymentMethod === "WHATSAPP";

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName: name,
          shippingEmail: email,
          shippingPhone: phone,
          shippingAddress: address,
          shippingCity: city,
          shippingZip: zip,
          deliveryDate,
          items: cart.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            image: i.image,
            quantity: i.quantity,
            weight: i.weight,
          })),
          totalAmount: grandTotal,
          discountAmount: couponDiscount,
          couponCode: couponCode || null,
          paymentMethod: paymentMethod === "WHATSAPP" ? "COD" : paymentMethod,
          whatsappOrder: isWhatsapp,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlacedOrderId(data.orderId);
        setIsProcessingPayment(false);
        clearCart();
        setStep("confirmation");
        toast("Order placed successfully!", "success");

        // If WhatsApp order, open Chat with structured message
        if (isWhatsapp) {
          const itemsList = cart
            .map((i) => `- ${i.name} (${i.weight}) x ${i.quantity}`)
            .join("%0A");
          const waMessage = `Hi Sweet Delights! I want to confirm my order:%0A%0A*Order ID:* ${data.orderId}%0A*Name:* ${name}%0A*Delivery Date:* ${deliveryDate}%0A*Address:* ${address}, ${city} (${zip})%0A%0A*Cakes:*%0A${itemsList}%0A%0A*Total Amount:* ₹${grandTotal.toLocaleString("en-IN")}%0A%0AThank you!`;
          
          // Open WhatsApp in new tab
          window.open(`https://wa.me/919876543210?text=${waMessage}`, "_blank");
        }
      } else {
        const data = await res.json();
        toast(data.error || "Order placement failed.", "error");
        setIsProcessingPayment(false);
      }
    } catch (err) {
      toast("Error submitting order.", "error");
      setIsProcessingPayment(false);
    }
  };

  // STEP 3: CONFIRMATION SCREEN (Luxury Apple-like layout)
  if (step === "confirmation") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center gap-8 min-h-[70vh]">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border border-border">
          <CheckCircle className="w-10 h-10 text-foreground" />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[10px] tracking-[0.25em] font-bold uppercase text-foreground/45">
            Order Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Thank You For Your Order
          </h1>
          <p className="text-xs text-foreground/60 max-w-md mx-auto leading-relaxed">
            Your fresh custom cake is scheduled for baking. A copy of the receipt has been emailed to <span className="font-bold text-foreground">{email}</span>.
          </p>
        </div>

        {/* Order Details summary box */}
        <div className="w-full bg-card border border-border rounded-[20px] p-6 text-left flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="text-xs text-foreground/50 font-medium">Order Reference ID</span>
            <span className="text-xs font-bold font-mono text-foreground">{placedOrderId}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-foreground/50">Delivery Address</p>
              <p className="font-bold mt-1 text-foreground/80 leading-relaxed">
                {address}, {city} - {zip}
              </p>
            </div>
            <div>
              <p className="text-foreground/50">Scheduled Delivery Date</p>
              <p className="font-bold mt-1 text-foreground/80 flex items-center gap-1.5 leading-relaxed">
                <Calendar className="w-3.5 h-3.5 text-foreground/50" /> {deliveryDate}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full justify-center">
          <Link
            href="/orders"
            className="py-3 px-6 rounded-full bg-secondary border border-border hover:bg-foreground/5 text-foreground font-bold text-xs uppercase tracking-widest shadow-sm transition-all"
          >
            My Orders
          </Link>
          <Link
            href="/"
            className="py-3 px-6 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-md transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col gap-12">
      
      {/* 3-Step Progress Indicator */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between mb-4 relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-border z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-foreground transition-all duration-300 z-0" 
          style={{ width: step === "shipping" ? "0%" : "100%" }}
        />
        
        {/* Step 1 */}
        <div className="flex flex-col items-center gap-2 z-10 relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
            step === "shipping" 
              ? "bg-primary border-primary text-primary-foreground" 
              : "bg-card border-foreground text-foreground"
          }`}>
            1
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">Shipping</span>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center gap-2 z-10 relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
            step === "payment" 
              ? "bg-primary border-primary text-primary-foreground animate-pulse-once" 
              : "bg-card border-border text-foreground/40"
          }`}>
            2
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${step === "payment" ? "text-foreground" : "text-foreground/40"}`}>Payment</span>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center gap-2 z-10 relative">
          <div className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-card text-xs font-bold text-foreground/40">
            3
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">Confirm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start mt-4">
        
        {/* Checkout Forms Column (Left Col - 2/3) */}
        <div className="lg:col-span-2">
          {step === "shipping" ? (
            <form onSubmit={handleProceedToPayment} className="bg-card border border-border rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
              <div className="text-left border-b border-border pb-4">
                <h2 className="font-serif text-2xl font-bold">Shipping Information</h2>
                <p className="text-xs text-foreground/50 mt-1">Please enter your delivery and baking instructions.</p>
              </div>

              {/* Delivery Grid Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rachel Green"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rachel@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">Scheduled Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm font-semibold cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">Delivery Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat/House No, Building, Street Name"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">Postal Code (PIN) *</label>
                  <input
                    type="text"
                    required
                    placeholder="110001"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm font-semibold"
                  />
                </div>
              </div>

              {/* Continue Action */}
              <button
                type="submit"
                className="py-4 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-center font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                Continue to Payment
              </button>
            </form>
          ) : (
            <div className="bg-card border border-border rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
              {/* Back to Step 1 */}
              <button
                onClick={() => setStep("shipping")}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/50 hover:text-primary transition-all self-start cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Shipping
              </button>

              <div className="text-left border-b border-border pb-4">
                <h2 className="font-serif text-2xl font-bold">Select Payment Method</h2>
                <p className="text-xs text-foreground/50 mt-1">Select how you wish to settle the luxury patisserie dues.</p>
              </div>

              {/* Delivery Address Summary Panel */}
              <div className="p-4 bg-secondary border border-border rounded-xl text-left text-xs leading-relaxed">
                <p className="font-bold text-foreground uppercase tracking-widest text-[9px]">Delivering to:</p>
                <p className="mt-1 text-foreground/80 font-semibold">{name} &bull; {phone}</p>
                <p className="text-foreground/70">{address}, {city} ({zip})</p>
                <p className="text-foreground/70 flex items-center gap-1 mt-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 opacity-55" /> Scheduled for: {deliveryDate}
                </p>
              </div>

              {/* Payment Methods radio selectors */}
              <div className="flex flex-col gap-4">
                <label className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer hover:bg-secondary transition-all ${
                  paymentMethod === "ONLINE" ? "border-foreground bg-secondary" : "border-border"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                    className="mt-0.5 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="text-left grow">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide">Secure Credit/Debit Card (Razorpay)</p>
                    <p className="text-[10px] text-foreground/50 mt-1">
                      Pay instantly online using credit cards, UPI, netbanking or mobile wallets. Securely encrypted.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer hover:bg-secondary transition-all ${
                  paymentMethod === "COD" ? "border-foreground bg-secondary" : "border-border"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-0.5 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="text-left grow">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-foreground/50 mt-1">
                      Settle payment in cash or UPI at the doorstep upon receiving your freshly chilled cake.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer hover:bg-secondary transition-all ${
                  paymentMethod === "WHATSAPP" ? "border-foreground bg-secondary" : "border-border"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "WHATSAPP"}
                    onChange={() => setPaymentMethod("WHATSAPP")}
                    className="mt-0.5 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="text-left grow">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                      Order via WhatsApp <Smartphone className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                    </p>
                    <p className="text-[10px] text-foreground/50 mt-1">
                      Place order instantly in the database and complete checkout on WhatsApp with our chat representative.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar (Col 1/3) */}
        <div className="flex flex-col gap-6 sticky top-28">
          
          <div className="bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
            <h2 className="font-serif text-lg font-bold text-foreground border-b border-border pb-3">
              Order Summary
            </h2>

            {/* List items briefly */}
            <div className="flex flex-col gap-3.5 divide-y divide-border max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs py-2 first:pt-0">
                  <div className="text-left">
                    <p className="font-bold truncate max-w-[150px]">{item.name}</p>
                    <p className="text-[10px] text-foreground/50 mt-0.5 uppercase font-bold tracking-wider">
                      {item.weight} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <div className="flex justify-between text-xs text-foreground/75">
                <span>Items Subtotal</span>
                <span className="font-semibold">₹{cartSubtotal.toLocaleString("en-IN")}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-xs text-foreground font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-foreground/75">
                <span>Shipping fee</span>
                <span className="font-semibold">{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
              </div>

              <div className="border-t border-border pt-3.5 mt-1 flex justify-between items-center">
                <span className="text-sm font-bold text-foreground">Total Price</span>
                <span className="font-sans text-lg font-bold text-foreground">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Place Order CTA Button (Only active in step 2) */}
          {step === "payment" && (
            <button
              onClick={handleSubmit}
              disabled={isProcessingPayment}
              className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-center font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-85 cursor-pointer"
            >
              {isProcessingPayment ? (
                <>
                  <Loader className="w-4 h-4 animate-spin text-primary-foreground/70" />
                  Processing Order...
                </>
              ) : paymentMethod === "WHATSAPP" ? (
                "Confirm & Open WhatsApp Chat"
              ) : (
                "Complete Purchase & Order"
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
