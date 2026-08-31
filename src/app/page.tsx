import React from "react";
import Link from "next/link";
import prisma from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { Star, ShieldCheck, Truck, Clock, Sparkles } from "lucide-react";
import fs from "fs";
import path from "path";

// Server action to get featured products
async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { isFeatured: true },
      take: 2, // We'll show 2 large horizontal cards
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

// Server action to get best sellers
async function getBestSellers() {
  try {
    return await prisma.product.findMany({
      take: 4,
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

// Load Home settings dynamically
function getHomeSettings() {
  const filePath = path.join(process.cwd(), "src/data/homeSettings.json");
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading home settings file:", error);
  }
  return {
    heroHeadline: "Cakes made\nas fine art.",
    heroSubtitle: "Welcome to Sweet Delights, where pastry creation is elevated to modern design. Explore our collection of bespoke, organic confections built for milestones.",
    heroCta1Label: "Order Now",
    heroCta2Label: "Explore Collection",
    heroImageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?q=80&w=1200&auto=format&fit=crop"
  };
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const bestSellers = await getBestSellers();
  const settings = getHomeSettings();

  const testimonials = [
    {
      name: "Aishwarya Rai",
      role: "Milestone Celebration Customer",
      comment: "The wedding cake created by Sweet Delights was breathtaking. It became the centerpiece of our evening, and the raspberry buttercream layers were simply delicious!",
      rating: 5,
    },
    {
      name: "Rohit Sharma",
      role: "Frequent Gifter",
      comment: "I always order their Signature Chocolate Truffle Cake for office events. It is consistent, moist, rich, and they deliver it perfectly on time every single time.",
      rating: 5,
    },
    {
      name: "Vikram Malhotra",
      role: "Bespoke Custom Cake Client",
      comment: "They brought my daughter's dream birthday theme cake to life. The sugar craft flower detail was exceptional. A true luxury bakery experience.",
      rating: 5,
    },
  ];

  const whyChooseUs = [
    {
      title: "100% Organic Ingredients",
      description: "We use only organic flour, farm-fresh dairy, premium Belgian chocolates, and natural fruit compotes.",
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    },
    {
      title: "Handcrafted With Love",
      description: "Each cake is sculpted and styled individually by our team of award-winning master pastry chefs.",
      icon: <Sparkles className="w-5 h-5 text-primary" />,
    },
    {
      title: "Careful White-Glove Delivery",
      description: "Delivered in temperature-controlled custom boxes to ensure your cake arrives in pristine, chilled condition.",
      icon: <Truck className="w-5 h-5 text-primary" />,
    },
    {
      title: "Midnight Delivery Available",
      description: "Celebrate milestones the exact second they begin. Safe midnight drops across the capital region.",
      icon: <Clock className="w-5 h-5 text-primary" />,
    },
  ];

  return (
    <div className="flex flex-col gap-32 pb-32 bg-background transition-colors duration-300">
      
      {/* 1. Hero Section (Apple-style Split Layout) */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-card border-b border-border/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-16 sm:gap-24">
          
          {/* Left Side: Text */}
          <div className="flex flex-col gap-8 text-left max-w-xl">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-foreground/45 font-sans">
              Artisanal Gourmet Studio
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7.5xl font-bold tracking-tight text-foreground leading-[1.05] whitespace-pre-line">
              {settings.heroHeadline}
            </h1>
            <p className="text-[#4A4A4A] text-sm sm:text-base leading-relaxed max-w-md font-sans">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link
                href="/shop"
                className="py-4 px-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {settings.heroCta1Label}
              </Link>
              <Link
                href="/shop"
                className="py-4 px-9 rounded-full bg-secondary border border-border text-foreground hover:bg-foreground/5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm"
              >
                {settings.heroCta2Label}
              </Link>
            </div>
          </div>

          {/* Right Side: Luxury Cake Image */}
          <div className="w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] rounded-[20px] overflow-hidden bg-secondary relative shadow-sm border border-border/60">
            <img
              src={settings.heroImageUrl}
              alt="Luxury Custom Cake"
              className="w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

        </div>
      </section>

      {/* 2. Featured Section (Horizontal Premium Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-16">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-foreground/45">
            Boutique Selections
          </span>
          <h2 className="font-serif text-3.5xl sm:text-5xl font-bold text-foreground">
            Featured Confections
          </h2>
          <div className="w-12 h-[1px] bg-primary mt-3" />
        </div>

        {featuredProducts.length === 0 ? (
          <p className="text-center text-foreground/50 text-sm">No featured cakes at the moment.</p>
        ) : (
          <div className="flex flex-col gap-12">
            {featuredProducts.map((product, idx) => {
              const primaryImage = product.images && product.images.length > 0 ? product.images[0].url : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop";
              return (
                <div 
                  key={product.id} 
                  className={`bg-card border border-border rounded-[20px] overflow-hidden flex flex-col ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {/* Large Image Grid */}
                  <div className="w-full lg:w-1/2 aspect-[4/3] rounded-xl overflow-hidden bg-foreground/5 relative shadow-sm">
                    <img 
                      src={primaryImage} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    />
                  </div>
                  {/* Details */}
                  <div className="w-full lg:w-1/2 flex flex-col gap-6 text-left lg:px-6">
                    <span className="text-[10px] tracking-widest font-bold uppercase text-primary bg-secondary py-1 px-3 rounded-full self-start">
                      {product.category.name}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3.5xl font-bold text-foreground leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-sm text-foreground/60 leading-relaxed max-w-md">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-8 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-foreground/40 font-semibold">Price starts at</span>
                        <span className="text-xl font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</span>
                      </div>
                      <Link
                        href={`/product/${product.id}`}
                        className="py-3 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-sm transition-all"
                      >
                        Customize Selection
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Why Choose Us Section */}
      <section className="w-full bg-secondary/60 py-24 border-y border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center flex flex-col items-center gap-3 mb-20">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-foreground/45">
              Why Sweet Delights
            </span>
            <h2 className="font-serif text-3.5xl sm:text-5xl font-bold text-foreground">
              Our Baking Philosophy
            </h2>
            <div className="w-12 h-[1px] bg-primary mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-[20px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col gap-6 text-center items-center"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-foreground">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-foreground mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-foreground/60 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Best Sellers Section (Spacious Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-16">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-foreground/45">
            Customer Favorites
          </span>
          <h2 className="font-serif text-3.5xl sm:text-5xl font-bold text-foreground">
            Our Best Sellers
          </h2>
          <div className="w-12 h-[1px] bg-primary mt-3" />
        </div>

        {bestSellers.length === 0 ? (
          <p className="text-center text-foreground/50 text-sm">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Customer Testimonials */}
      <section className="w-full bg-secondary/60 py-24 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center flex flex-col items-center gap-3 mb-20">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-foreground/45">
              Client Appreciations
            </span>
            <h2 className="font-serif text-3.5xl sm:text-5xl font-bold text-foreground">
              Loved By Cake Lovers
            </h2>
            <div className="w-12 h-[1px] bg-primary mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-[20px] p-8 flex flex-col gap-5 shadow-sm relative text-foreground"
              >
                {/* Rating */}
                <div className="flex text-amber-400">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                {/* Comment */}
                <p className="text-xs italic text-foreground/75 leading-relaxed font-sans grow">
                  "{test.comment}"
                </p>
                {/* Author */}
                <div className="border-t border-border pt-4 mt-2">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">{test.name}</p>
                  <p className="text-[10px] text-foreground/45 uppercase tracking-wider font-semibold mt-0.5">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
