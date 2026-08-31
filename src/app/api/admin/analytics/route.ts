import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
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

    // 1. Core KPIs
    const allOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    const totalOrdersCount = allOrders.length;

    // Calculate revenue
    const totalRevenue = allOrders
      .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Calculate pending revenue
    const pendingRevenue = allOrders
      .filter((o) => o.paymentStatus !== "PAID" && o.status !== "CANCELLED" && o.status !== "DELIVERED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Customers count
    const uniqueCustomers = new Set(allOrders.map((o) => o.customerEmail));
    const totalCustomersCount = uniqueCustomers.size;

    // Inventory status
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    const lowStockCount = products.filter((p) => p.stock <= 5).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    // 2. Sales by Category
    const categoryCounts: { [key: string]: number } = {};
    const categoryRevenue: { [key: string]: number } = {};
    
    const categories = await prisma.category.findMany();
    categories.forEach((cat) => {
      categoryCounts[cat.name] = 0;
      categoryRevenue[cat.name] = 0;
    });

    // Detailed products category inventory counts
    products.forEach((p) => {
      if (categoryCounts[p.category.name] !== undefined) {
        categoryCounts[p.category.name] += p.stock;
      }
    });

    // Detailed orders category revenue
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: { include: { category: true } },
        order: true,
      },
    });

    orderItems.forEach((item) => {
      if (
        (item.order.paymentStatus === "PAID" || item.order.status === "DELIVERED") &&
        item.product &&
        item.product.category
      ) {
        const catName = item.product.category.name;
        if (categoryRevenue[catName] !== undefined) {
          categoryRevenue[catName] += item.price * item.quantity;
        }
      }
    });

    const categoryBreakdown = Object.keys(categoryCounts).map((name) => ({
      name,
      stock: categoryCounts[name],
      revenue: categoryRevenue[name] || 0,
    }));

    // 3. Sales Trend (Last 7 days revenue)
    const salesTrendMap: { [key: string]: number } = {};
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      last7Days.push(dateStr);
      salesTrendMap[dateStr] = 0;
    }

    allOrders.forEach((o) => {
      if (o.paymentStatus === "PAID" || o.status === "DELIVERED") {
        const orderDateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });
        if (salesTrendMap[orderDateStr] !== undefined) {
          salesTrendMap[orderDateStr] += o.totalAmount;
        }
      }
    });

    const salesTrend = last7Days.map((date) => ({
      date,
      revenue: salesTrendMap[date],
    }));

    // 4. Recent Customers
    const recentCustomers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      kpis: {
        totalRevenue,
        pendingRevenue,
        totalOrdersCount,
        totalCustomersCount,
        lowStockCount,
        outOfStockCount,
      },
      categoryBreakdown,
      salesTrend,
      recentCustomers,
    });
  } catch (error: any) {
    console.error("Fetch analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
