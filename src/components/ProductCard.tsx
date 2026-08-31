"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { Heart, ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: {
      name: string;
      slug: string;
    };
    images: {
      url: string;
    }[];
    reviews: {
      rating: number;
    }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const isLiked = isInWishlist(product.id);
  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop";

  // Calculate average rating
  const ratings = product.reviews || [];
  const averageRating =
    ratings.length > 0
      ? parseFloat(
          (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        )
      : 5.0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage,
      weight: "500g", // default starting weight
      quantity: 1,
    });
    toast(`Added "${product.name} (500g)" to cart!`, "success");
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage,
      categoryName: product.category.name,
    });
    if (isLiked) {
      toast(`Removed "${product.name}" from wishlist.`, "info");
    } else {
      toast(`Added "${product.name}" to wishlist!`, "success");
    }
  };

  return (
    <div className="group bg-card border border-border rounded-[20px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1.5 relative">
      
      {/* Category badge & Wishlist trigger */}
      <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
        <span className="text-[10px] tracking-wider font-bold uppercase py-1 px-3 rounded-full bg-white/95 text-foreground shadow-sm">
          {product.category.name}
        </span>
        <button
          onClick={handleWishlistToggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md border transition-all duration-300 transform active:scale-90 bg-white/90 hover:bg-white ${
            isLiked
              ? "text-red-500 border-red-500/15"
              : "text-foreground/60 border-border hover:text-red-500 hover:border-red-500/20"
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4.5 h-4.5 ${isLiked ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link href={`/product/${product.id}`} className="block relative pt-[85%] overflow-hidden bg-foreground/5">
        <img
          src={primaryImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Details content */}
      <div className="p-5 flex flex-col grow gap-2.5">
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(averageRating) ? "fill-current" : "opacity-30"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-foreground/50 font-semibold mt-0.5">
            {averageRating} ({ratings.length})
          </span>
        </div>

        {/* Title */}
        <Link href={`/product/${product.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-serif text-base font-bold text-foreground line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between pt-3.5 mt-auto border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-foreground/40 font-semibold">
              Price starts at
            </span>
            <span className="text-base font-bold text-primary">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
