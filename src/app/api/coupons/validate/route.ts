import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/coupons/validate - Validate coupon during checkout
export async function POST(req: NextRequest) {
  try {
    const { code, cartSubtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 400 });
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    // Check min order value
    if (cartSubtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
