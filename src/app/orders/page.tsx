"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { ShoppingBag, Truck, Calendar, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  weight: string;
  product: {
    name: string;
    images: { url: string }[];
  };
}

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  deliveryDate: string;
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      } else {
        toast("Failed to load your order history.", "error");
      }
    } catch (e) {
      toast("Error fetching orders.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchOrders();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  // Color mapping based on order status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 py-1 px-3 rounded-full text-xs font-bold">Pending Receipt</span>;
      case "BAKING":
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300 py-1 px-3 rounded-full text-xs font-bold">In Oven (Baking)</span>;
      case "OUT_FOR_DELIVERY":
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-300 py-1 px-3 rounded-full text-xs font-bold">Out for Delivery</span>;
      case "DELIVERED":
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 py-1 px-3 rounded-full text-xs font-bold">Delivered</span>;
      default:
        return <span className="bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300 py-1 px-3 rounded-full text-xs font-bold">Cancelled</span>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 flex flex-col gap-6 items-center">
        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-primary/40" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold">Access Denied</h1>
          <p className="text-sm text-foreground/60 mt-1">Please login to view your cake order history.</p>
        </div>
        <Link href="/login" className="py-3 px-6 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10 min-h-[70vh]">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">My Cake Orders</h1>
        <p className="text-xs text-foreground/50 mt-1">Track the baking and delivery status of your purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 bg-card border border-border/40 rounded-3xl gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-primary/40" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold">No Orders Placed Yet</h2>
            <p className="text-xs text-foreground/60 mt-1">Your baking queue is empty. Visit our shop menu!</p>
          </div>
          <Link href="/shop" className="py-3 px-6 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
            Order a Cake
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border/40 rounded-3xl shadow-sm overflow-hidden flex flex-col"
            >
              
              {/* Order summary header */}
              <div className="bg-[#1E1611]/5 dark:bg-[#1E1611]/45 p-6 border-b border-border/40 flex flex-wrap justify-between items-center gap-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 grow">
                  <div>
                    <p className="text-foreground/45 uppercase tracking-wider font-semibold">Order ID</p>
                    <p className="font-mono font-bold mt-1 text-foreground/80 truncate max-w-[120px]">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-foreground/45 uppercase tracking-wider font-semibold">Date Placed</p>
                    <p className="font-bold mt-1 text-foreground/80">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/45 uppercase tracking-wider font-semibold">Total Cost</p>
                    <p className="font-bold mt-1 text-primary dark:text-primary-foreground">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/45 uppercase tracking-wider font-semibold">Scheduled For</p>
                    <p className="font-bold mt-1 text-foreground/80 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-secondary" />{" "}
                      {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order items list */}
              <div className="p-6 divide-y divide-border/20">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-border/40 relative bg-foreground/5">
                        <img
                          src={
                            item.product && item.product.images && item.product.images.length > 0
                              ? item.product.images[0].url
                              : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop"
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-foreground">
                          {item.product?.name || "Artisanal Cake"}
                        </h4>
                        <p className="text-xs text-foreground/50 mt-0.5">
                          Weight: {item.weight} | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-semibold text-foreground/80">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Baking/Delivery status steps details */}
              <div className="bg-[#1E1611]/5 dark:bg-[#1E1611]/45 p-6 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-foreground/50">Payment Status</span>
                <span className="font-bold flex items-center gap-1 text-foreground/80">
                  {order.paymentStatus === "PAID" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Paid Online
                    </>
                  ) : order.status === "CANCELLED" ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Order Cancelled
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 text-secondary" />
                      Cash Due on Delivery
                    </>
                  )}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
