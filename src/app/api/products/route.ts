import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// GET /api/products - Get products list with filtering, search and sorting
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort"); // price_asc, price_desc, popularity, latest
    const featured = searchParams.get("featured");

    // Build Prisma query clauses
    let whereClause: any = {};

    if (categorySlug) {
      whereClause.category = {
        slug: categorySlug,
      };
    }

    if (featured === "true") {
      whereClause.isFeatured = true;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderByClause: any = {};
    if (sort === "price_asc") {
      orderByClause = { price: "asc" };
    } else if (sort === "price_desc") {
      orderByClause = { price: "desc" };
    } else if (sort === "latest") {
      orderByClause = { createdAt: "desc" };
    } else {
      // Default: popularity/latest (popularity can be sorted by number of reviews or featured status)
      orderByClause = { createdAt: "desc" };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (Admin only)
export async function POST(req: NextRequest) {
  try {
    // Authenticate Admin
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, price, categoryId, stock, isFeatured, images } =
      await req.json();

    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, description, price, and category are required" },
        { status: 400 }
      );
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        stock: parseInt(stock) || 10,
        isFeatured: !!isFeatured,
      },
    });

    // Create images relation
    if (images && Array.isArray(images) && images.length > 0) {
      const imagesData = images.map((url: string) => ({
        url,
        productId: product.id,
      }));
      await prisma.productImage.createMany({
        data: imagesData,
      });
    }

    // Fetch complete product to return
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });

    return NextResponse.json({
      message: "Product created successfully",
      product: fullProduct,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
