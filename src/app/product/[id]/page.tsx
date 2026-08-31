import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft } from "lucide-react";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Server helper to fetch product details
async function getProductDetails(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

// Server helper to fetch related products
async function getRelatedProducts(categoryId: string, currentProductId: string) {
  try {
    return await prisma.product.findMany({
      where: {
        categoryId,
        NOT: { id: currentProductId },
      },
      take: 4,
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductDetails(id);

  if (!product) {
    notFound();
  }

  // Parse review dates to ISO strings for safe serialization to Client Component
  const serializedProduct = {
    ...product,
    reviews: product.reviews.map((rev) => ({
      ...rev,
      createdAt: rev.createdAt.toISOString(),
    })),
  };

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-16">
      {/* Back button */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-primary transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collection
        </Link>
      </div>

      {/* Main product purchase area (Client Side Controls) */}
      <ProductDetailsClient product={serializedProduct} />

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border/20 pt-16 flex flex-col gap-10">
          <div className="text-left flex flex-col gap-2">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              You May Also Delight In
            </h2>
            <p className="text-xs text-foreground/50">
              Handcrafted cakes from the same fine collection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
