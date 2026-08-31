"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ShopFiltersProps {
  categories: Category[];
}

export default function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial states from URL params
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "latest";
  const currentSearch = searchParams.get("search") || "";

  const [searchVal, setSearchVal] = useState(currentSearch);

  // Sync state with URL when search params change externally
  useEffect(() => {
    setSearchVal(currentSearch);
  }, [currentSearch]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", searchVal);
  };

  const clearAllFilters = () => {
    setSearchVal("");
    router.push("/shop");
  };

  return (
    <div className="flex flex-col gap-8 w-full border-b border-border pb-8">
      {/* Search and Sort row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-xs uppercase tracking-wider font-bold placeholder-foreground/30 focus:outline-none focus:border-foreground transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45" />
          <button type="submit" className="hidden">Search</button>
        </form>

        {/* Sorting selector */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
          <SlidersHorizontal className="w-4 h-4 text-foreground/50 hidden sm:inline" />
          <select
            value={currentSort}
            onChange={(e) => updateFilters("sort", e.target.value)}
            className="bg-secondary border border-border rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-foreground w-full sm:w-48 text-foreground/80 shadow-sm cursor-pointer"
          >
            <option value="latest">Latest Arrivals</option>
            <option value="popularity">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Reset button */}
          {(currentCategory || currentSearch || currentSort !== "latest") && (
            <button
              onClick={clearAllFilters}
              className="p-3 bg-secondary border border-border hover:bg-foreground/5 rounded-xl text-foreground transition-all cursor-pointer"
              title="Clear Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Chips row (Luxury minimalism buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => updateFilters("category", "")}
          className={`py-2 px-5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border cursor-pointer ${
            !currentCategory
              ? "bg-primary border-primary text-primary-foreground shadow-sm"
              : "bg-secondary border-border text-foreground/70 hover:border-foreground hover:text-foreground"
          }`}
        >
          All Cakes
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateFilters("category", cat.slug)}
            className={`py-2 px-5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border cursor-pointer ${
              currentCategory === cat.slug
                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                : "bg-secondary border-border text-foreground/70 hover:border-foreground hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
