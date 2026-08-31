"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { Heart, ShoppingBag, Plus, Minus, Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

interface ProductDetailsClientProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: {
      name: string;
      slug: string;
    };
    images: {
      url: string;
    }[];
    reviews: Review[];
  };
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const [activeImage, setActiveImage] = useState(
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop"
  );

  const [selectedWeight, setSelectedWeight] = useState("500g");
  const [quantity, setQuantity] = useState(1);

  // Review Form States
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);

  const isLiked = isInWishlist(product.id);

  // Dynamic pricing based on weight multiplier
  const getWeightMultiplier = (w: string) => {
    if (w === "1kg") return 1.8;
    if (w === "2kg") return 3.4;
    return 1.0; // 500g is base
  };

  const calculatedPrice = product.price * getWeightMultiplier(selectedWeight);

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    if (val > product.stock) {
      toast(`Only ${product.stock} items available in stock.`, "info");
      return;
    }
    setQuantity(val);
  };

  const handleAddToCart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (product.stock === 0) {
      toast("Sorry, this cake is currently out of stock.", "error");
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: calculatedPrice,
      image: activeImage,
      weight: selectedWeight,
      quantity,
    });
    toast(`Added ${quantity} x "${product.name} (${selectedWeight})" to cart!`, "success");
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      toast("Sorry, this cake is currently out of stock.", "error");
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: calculatedPrice,
      image: activeImage,
      weight: selectedWeight,
      quantity,
    });
    router.push("/cart");
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: activeImage,
      categoryName: product.category.name,
    });
    if (isLiked) {
      toast(`Removed "${product.name}" from wishlist.`, "info");
    } else {
      toast(`Added "${product.name}" to wishlist!`, "success");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewComment) {
      toast("Please fill in both name and review comment.", "error");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: newReviewRating,
          comment: newReviewComment,
          authorName: newReviewAuthor,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast("Thank you for your feedback! Review posted.", "success");
        setReviewsList([data.review, ...reviewsList]);
        setNewReviewAuthor("");
        setNewReviewComment("");
        setNewReviewRating(5);
      } else {
        toast("Failed to submit review. Try again.", "error");
      }
    } catch (err) {
      toast("Network error submitting review.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const averageRating =
    reviewsList.length > 0
      ? parseFloat(
          (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
        )
      : 5.0;

  return (
    <div className="flex flex-col gap-24">
      
      {/* 1. Image & Purchase Info Section (Apple Store Style Split Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Images Columns (Sticky Gallery) */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-28">
          
          {/* Active Image Box */}
          <div className="aspect-[4/3] w-full bg-secondary rounded-[20px] overflow-hidden border border-border relative shadow-sm">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all"
            />
          </div>

          {/* Thumbnails row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-24 h-20 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    activeImage === img.url
                      ? "border-foreground scale-105 shadow-sm"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Selectors Column */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-widest uppercase font-bold text-foreground/45">
              {product.category.name}
            </span>
            <h1 className="font-serif text-3xl sm:text-5.5xl font-bold text-foreground tracking-tight leading-[1.1]">
              {product.name}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2.5 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(averageRating) ? "fill-current" : "opacity-25"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                {averageRating} &bull; {reviewsList.length} Customer reviews
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="py-6 border-y border-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-foreground/40 tracking-widest">
                Portion Cost
              </span>
              <span className="font-sans text-2xl sm:text-3.5xl font-bold text-foreground mt-1">
                ₹{calculatedPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="text-right">
              {product.stock > 0 ? (
                <span className="text-[10px] font-bold text-emerald-500 py-1.5 px-3.5 bg-emerald-500/10 rounded-full uppercase tracking-wider">
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="text-[10px] font-bold text-red-500 py-1.5 px-3.5 bg-red-500/10 rounded-full uppercase tracking-wider">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/75 leading-relaxed font-sans">
            {product.description}
          </p>

          {/* Configuration Form */}
          <div className="flex flex-col gap-6 pt-2">
            
            {/* Weight selector */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/45">Select Portion Size</span>
              <div className="flex gap-3">
                {["500g", "1kg", "2kg"].map((weight) => (
                  <button
                    key={weight}
                    onClick={() => setSelectedWeight(weight)}
                    className={`py-2 px-6 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                      selectedWeight === weight
                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                        : "bg-secondary border-border text-foreground/70 hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
              
              {/* Quantity Controls */}
              <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
                <div className="flex items-center justify-between border border-border rounded-xl py-3 px-4 w-full sm:w-36 bg-secondary">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="text-foreground/70 hover:text-primary transition-colors p-1 cursor-pointer"
                    disabled={product.stock === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm text-foreground">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="text-foreground/70 hover:text-primary transition-colors p-1 cursor-pointer"
                    disabled={product.stock === 0}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons row */}
              <div className="flex gap-3 w-full grow">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 px-6 rounded-xl border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-foreground/5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 inline mr-1" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  Buy Now
                </button>
                
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isLiked
                      ? "text-red-500 border-red-500/15 bg-red-500/5 animate-pulse-once"
                      : "text-foreground/50 border-border hover:text-red-500 hover:border-red-500/20"
                  }`}
                  aria-label="Add to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. Reviews Section */}
      <div className="border-t border-border pt-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Left Side: Summary of Reviews & Form */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3.5xl font-bold text-foreground">Customer Reviews</h2>
            <p className="text-xs text-foreground/50 mt-2 font-sans leading-relaxed">
              Certified feedback from our luxury cake boutique patrons.
            </p>
          </div>

          <div className="p-8 bg-secondary border border-border rounded-[20px] flex flex-col gap-6">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-foreground" />
              Write a Review
            </h3>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rachel Green"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder-foreground/30 focus:outline-none focus:border-primary mt-1.5 shadow-sm"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">
                  Rating Star
                </label>
                <div className="flex gap-1.5 mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className={`text-2xl cursor-pointer ${
                        star <= newReviewRating ? "text-amber-400" : "text-foreground/15"
                      } transition-colors`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">
                  Comment
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details on texture, balance, and presentation..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder-foreground/30 focus:outline-none focus:border-primary mt-1.5 resize-none shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase tracking-widest transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: List of Reviews */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {reviewsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-secondary border border-border rounded-[20px] text-foreground/50 gap-2 h-56">
              <span className="text-sm font-bold font-serif text-foreground">No Reviews Yet</span>
              <p className="text-xs">Be the first to review this custom design confection!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 border border-border bg-card rounded-[20px] flex flex-col gap-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{rev.authorName}</h4>
                    <span className="text-[9px] text-foreground/45 font-bold uppercase tracking-wider">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-current" : "opacity-25"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed font-sans">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
