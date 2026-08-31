import React from "react";
import { Star, Heart, Award, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  const team = [
    {
      name: "Chef Amrita Sen",
      role: "Founder & Master Pastry Chef",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=400&auto=format&fit=crop",
      bio: "Trained at Le Cordon Bleu, Paris. Amrita has spent 15+ years perfecting French patisserie techniques, blending them with traditional Indian dessert sensibilities.",
    },
    {
      name: "Chef David Miller",
      role: "Lead Cake Designer",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400&auto=format&fit=crop",
      bio: "David is the artist behind our custom structures. He transforms sugar, fondant, and edible gold leaf into high-fashion centerpieces for luxury celebrations.",
    },
  ];

  const milestones = [
    { year: "2018", title: "Boutique Opened", desc: "First opened our micro-bakery door in New Delhi." },
    { year: "2020", title: "Best Bakery Award", desc: "Awarded Capital Patisserie of the Year." },
    { year: "2023", title: "Organic Initiative", desc: "Completely switched to 100% certified organic dairy & flour." },
  ];

  return (
    <div className="flex flex-col gap-28 pb-28 bg-[#FFFDF8] dark:bg-[#181213] transition-colors duration-300">
      
      {/* 1. Header Banner */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-[#FFFDF8] dark:bg-[#181213]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4">
          <span className="text-primary tracking-[0.25em] uppercase text-xs font-semibold">
            Our Story
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Crafting Culinary Masterpieces
          </h1>
          <div className="w-12 h-[2px] bg-primary mt-2" />
        </div>
      </section>

      {/* 2. Bakery Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-border shadow-sm relative">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop"
            alt="Baking Fresh Cakes"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-6 text-left">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-snug">
            Baking With Precision, Passion, And Love
          </h2>
          <p className="text-sm text-foreground/70 leading-relaxed">
            Sweet Delights began in 2018 as a small passion project in a home kitchen. Our goal has always been simple: to craft premium cakes that taste as sensational as they look, creating unforgettable culinary centerpieces for your special moments.
          </p>
          <p className="text-sm text-foreground/70 leading-relaxed">
            Over the years, we have grown into a high-end cake boutique known for our uncompromising standard of ingredients. We never use artificial preservatives or premixed elements. Every cream layer, fruit jam insert, and sugar flower petal is made completely from scratch by our dedicated culinary artists.
          </p>
          <div className="flex items-center gap-8 mt-4">
            <div className="flex flex-col">
              <span className="text-3xl font-serif font-bold text-primary">25k+</span>
              <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-semibold mt-1">
                Cakes Baked
              </span>
            </div>
            <div className="w-[1px] h-8 bg-border" />
            <div className="flex flex-col">
              <span className="text-3xl font-serif font-bold text-primary">150+</span>
              <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-semibold mt-1">
                Unique Recipes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values Grid */}
      <section className="w-full bg-[#FBF8F3] dark:bg-card/20 py-24 border-y border-border/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center flex flex-col items-center gap-3 mb-20">
            <span className="text-primary uppercase tracking-[0.2em] font-bold text-[10px]">
              Our Foundation
            </span>
            <h2 className="font-serif text-3xl font-bold text-foreground">Mission & Core Values</h2>
            <div className="w-12 h-[2px] bg-primary rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Uncompromising Quality",
                desc: "We source organic flour, organic eggs, real Madagascar vanilla beans, and single-origin chocolates.",
                icon: <Award className="w-6 h-6 text-primary" />,
              },
              {
                title: "Exceptional Artistry",
                desc: "We view baking as a fine art form. Each custom cake represents hours of meticulous hand-sculpted details.",
                icon: <Heart className="w-6 h-6 text-primary" />,
              },
              {
                title: "Reliable Celebrations",
                desc: "A cake is a celebration. We guarantee prompt deliveries in safe custom boxes, exactly when scheduled.",
                icon: <ShieldCheck className="w-6 h-6 text-primary" />,
              },
            ].map((value, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col gap-5 text-center items-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/40 dark:bg-primary/10 flex items-center justify-center">
                  {value.icon}
                </div>
                <h3 className="font-serif text-base font-bold text-foreground">{value.title}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center flex flex-col items-center gap-3 mb-20">
          <span className="text-primary uppercase tracking-[0.2em] font-bold text-[10px]">
            Master Artisans
          </span>
          <h2 className="font-serif text-3xl font-bold text-foreground">Meet Our Culinary Artists</h2>
          <div className="w-12 h-[2px] bg-primary rounded-full mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {team.map((chef, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start"
            >
              <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-border relative bg-foreground/5">
                <img src={chef.image} alt={chef.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left flex flex-col gap-3 grow">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">{chef.name}</h3>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-1">
                    {chef.role}
                  </p>
                </div>
                <p className="text-xs text-foreground/65 leading-relaxed">{chef.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Milestones Chronology */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <h2 className="font-serif text-2xl font-bold text-foreground">Our Boutique Timeline</h2>
          <div className="w-12 h-[2px] bg-primary rounded-full mt-2" />
        </div>

        <div className="flex flex-col gap-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/80">
          {milestones.map((mil, i) => (
            <div key={i} className="flex gap-6 relative pl-10 items-start">
              <span className="absolute left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-[#FFFDF8] dark:border-[#181213]" />
              <div className="flex flex-col gap-2 text-left">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{mil.year}</span>
                <h3 className="text-base font-bold font-serif leading-snug">{mil.title}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">{mil.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
