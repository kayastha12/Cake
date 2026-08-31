import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// GET /api/orders - Get order history (for user or all for admin)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    let orders;
    if (decoded.role === "ADMIN") {
      // Admin sees all orders
      orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      });
    } else {
      // Customer sees only their own orders
      orders = await prisma.order.findMany({
        where: { userId: decoded.userId },
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders - Place a new order
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    let userId = null;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryZip,
      deliveryDate,
      items,
      totalAmount,
      discountAmount,
      couponCode,
      paymentMethod,
      whatsappOrder,
    } = await req.json();

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !deliveryAddress ||
      !deliveryCity ||
      !deliveryZip ||
      !deliveryDate ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json({ error: "Missing required checkout fields" }, { status: 400 });
    }

    // 1. Determine payment details based on checkout selection
    const paymentStatus = paymentMethod === "COD" || whatsappOrder ? "PENDING" : "PAID";
    // For test simulation, generate a mock Razorpay ID
    const paymentId =
      paymentMethod === "ONLINE" && !whatsappOrder
        ? `pay_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        : null;

    // 2. Perform order transaction (create order & orderItems, adjust inventory stocks)
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const createdOrder = await tx.order.create({
        data: {
          userId,
          customerName,
          customerEmail,
          customerPhone,
          deliveryAddress,
          deliveryCity,
          deliveryZip,
          deliveryDate,
          totalAmount: parseFloat(totalAmount),
          discountAmount: parseFloat(discountAmount) || 0,
          couponCode,
          paymentStatus,
          paymentId,
          whatsappOrder: !!whatsappOrder,
          status: "PENDING",
        },
      });

      // Create order items & update product stock
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price),
            weight: item.weight,
          },
        });

        // Deduct product stock
        const dbProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (dbProduct) {
          const newStock = Math.max(0, dbProduct.stock - item.quantity);
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          });
        }
      }

      return createdOrder;
    });

    return NextResponse.json({
      message: "Order placed successfully",
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("Place order error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
