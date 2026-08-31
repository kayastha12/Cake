import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// POST /api/reviews - Add customer review for a cake
export async function POST(req: NextRequest) {
  try {
    const { productId, rating, comment, authorName } = await req.json();

    if (!productId || !rating || !comment || !authorName) {
      return NextResponse.json({ error: "Missing required review fields" }, { status: 400 });
    }

    // Authenticate user optionally
    const token = req.cookies.get("token")?.value;
    let userId = null;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) userId = decoded.userId;
    }

    const review = await prisma.review.create({
      data: {
        productId,
        rating: parseInt(rating),
        comment,
        authorName,
        userId,
      },
    });

    return NextResponse.json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Add review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
