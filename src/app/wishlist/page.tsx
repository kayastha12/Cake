"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Trash2, ShoppingCart, Heart, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (item: any) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      weight: "500g",
      quantity: 1,
    });
    toast(`Added "${item.name} (500g)" to cart!`, "success");
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 flex flex-col gap-6 items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
          <Heart className="w-10 h-10 text-primary/40" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-2xl font-bold">Your Wishlist is Empty</h1>
          <p className="text-sm text-foreground/60">
            Save your favorite delicious cakes here to order them later.
          </p>
        </div>
        <Link
          href="/shop"
          className="py-3 px-6 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">My Wishlist</h1>
        <p className="text-xs text-foreground/50 mt-1">Cakes you saved for later.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {wishlist.map((item) => (
          <div
            key={item.productId}
            className="group bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full relative"
          >
            {/* Remove trigger button */}
            <button
              onClick={() => {
                removeFromWishlist(item.productId);
                toast(`Removed "${item.name}" from wishlist.`, "info");
              }}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/95 dark:bg-black/75 shadow-md flex items-center justify-center hover:text-red-500 transition-colors"
              title="Remove from Wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Image */}
            <Link href={`/product/${item.productId}`} className="block relative pt-[85%] overflow-hidden bg-foreground/5">
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            {/* Details */}
            <div className="p-5 flex flex-col grow gap-2 border-t border-border/10">
              <span className="text-[9px] uppercase tracking-wider text-foreground/45 font-bold">
                {item.categoryName}
              </span>
              <Link href={`/product/${item.productId}`}>
                <h3 className="font-serif text-base font-bold text-foreground line-clamp-1 hover:text-primary transition-colors">
                  {item.name}
                </h3>
              </Link>
              <p className="text-sm font-bold text-primary dark:text-primary-foreground mt-1">
                ₹{item.price.toLocaleString("en-IN")}
              </p>

              {/* Add to cart CTA */}
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 mt-4"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
