import React, { Suspense } from "react";
import prisma from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/ShopFilters";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

// Server Action/Query helper to fetch filtered products
async function getProducts(filters: {
  category?: string;
  search?: string;
  sort?: string;
}) {
  try {
    let whereClause: any = {};

    if (filters.category) {
      whereClause.category = {
        slug: filters.category,
      };
    }

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    let orderByClause: any = {};
    if (filters.sort === "price_asc") {
      orderByClause = { price: "asc" };
    } else if (filters.sort === "price_desc") {
      orderByClause = { price: "desc" };
    } else if (filters.sort === "latest") {
      orderByClause = { createdAt: "desc" };
    } else {
      orderByClause = { createdAt: "desc" }; // default sorting
    }

    return await prisma.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });
  } catch (error) {
    console.error("Error loading products on shop:", error);
    return [];
  }
}

// Server helper to fetch categories
async function getCategories() {
  try {
    return await prisma.category.findMany();
  } catch (error) {
    console.error("Error loading categories on shop:", error);
    return [];
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  
  const products = await getProducts({
    category: resolvedParams.category,
    search: resolvedParams.search,
    sort: resolvedParams.sort,
  });

  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col gap-16 min-h-[70vh]">
      {/* Page Header */}
      <div className="text-left flex flex-col gap-4">
        <span className="text-xs font-bold tracking-[0.25em] uppercase text-foreground/45">
          Boutique Catalog
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
          Our Cake Collection
        </h1>
        <p className="text-sm text-foreground/60 max-w-xl leading-relaxed">
          Browse our seasonal selection of freshly baked luxury cakes. Filter by boutique category, search by flavor, or sort to find your perfect celebration cake.
        </p>
      </div>

      {/* Filters Area */}
      <Suspense fallback={<div className="h-10 bg-secondary animate-pulse rounded-2xl w-full" />}>
        <ShopFilters categories={categories} />
      </Suspense>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 bg-card border border-border rounded-[20px] gap-4">
          <div className="font-serif text-lg font-bold">No Cakes Found</div>
          <p className="text-sm text-foreground/50 max-w-xs leading-relaxed">
            We couldn't find any cakes matching your search criteria. Try removing filters or searching for something else.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
