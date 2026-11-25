
import { Request, Response } from "express";
import prisma from "../config/prisma.js";

// ============================================
// DATE HELPERS
// ============================================

function getDateRange(startDate?: string, endDate?: string) {
  const now = new Date();

  const start = startDate
    ? new Date(`${startDate}T00:00:00`)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

  const end = endDate
    ? new Date(`${endDate}T23:59:59.999`)
    : now;

  return { start, end };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ============================================
// GET STORE SALES REPORT
// ============================================

export async function getSalesReport(req: Request, res: Response) {
  try {
    const ownerId = req.user!.id;

    const store = await prisma.store.findFirst({
      where: { ownerId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    const startDate =
      typeof req.query.startDate === "string"
        ? req.query.startDate
        : undefined;

    const endDate =
      typeof req.query.endDate === "string"
        ? req.query.endDate
        : undefined;

    const { start, end } = getDateRange(startDate, endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range.",
      });
    }

    const orderWhere = {
      storeId: store.id,
      status: "DELIVERED" as const,
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    // ========================================
    // SALES SUMMARY
    // ========================================

    const [salesAggregate, deliveredOrders, totalOrders, cancelledOrders] =
      await Promise.all([
        prisma.order.aggregate({
          where: orderWhere,
          _sum: {
            totalAmount: true,
            subtotal: true,
            deliveryFee: true,
          },
          _avg: {
            totalAmount: true,
          },
          _count: {
            id: true,
          },
        }),

        prisma.order.count({
          where: orderWhere,
        }),

        prisma.order.count({
          where: {
            storeId: store.id,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        }),

        prisma.order.count({
          where: {
            storeId: store.id,
            status: "CANCELLED",
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        }),
      ]);

    const totalRevenue = Number(
      salesAggregate._sum.totalAmount || 0
    );

    const totalSubtotal = Number(
      salesAggregate._sum.subtotal || 0
    );

    const totalDeliveryFees = Number(
      salesAggregate._sum.deliveryFee || 0
    );

    const averageOrderValue = Number(
      salesAggregate._avg.totalAmount || 0
    );

    // ========================================
    // DAILY SALES
    // ========================================

    const dailyOrders = await prisma.order.findMany({
      where: orderWhere,
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const dailySalesMap = new Map<
      string,
      { date: string; revenue: number; orders: number }
    >();

    // Fill dates with zero values
    const currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0);

    const lastDate = new Date(end);
    lastDate.setHours(0, 0, 0, 0);

    while (currentDate <= lastDate) {
      const key = formatDate(currentDate);

      dailySalesMap.set(key, {
        date: key,
        revenue: 0,
        orders: 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const order of dailyOrders) {
      const key = formatDate(order.createdAt);

      const existing = dailySalesMap.get(key);

      if (existing) {
        existing.revenue += Number(order.totalAmount);
        existing.orders += 1;
      }
    }

    const dailySales = Array.from(dailySalesMap.values());

    // ========================================
    // BEST-SELLING PRODUCTS
    // ========================================

    const productSales = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          is: orderWhere,
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    const productIds = productSales.map(
      (item: { productId: any; }) => item.productId
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        storeId: store.id,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    const productMap = new Map<string, { id: string; name: string; image: string | null }>(
      products.map((product: { id: string; name: string; image: string | null }) => [product.id, product] as const)
    );

    const topProducts = productSales.map((item: { productId: string; _sum: { quantity: any; subtotal: any; }; }) => {
      const product = productMap.get(item.productId);

      return {
        productId: item.productId,
        name: product?.name || "Unknown Product",
        image: product?.image || null,
        quantitySold: item._sum.quantity || 0,
        revenue: Number(item._sum.subtotal || 0),
      };
    });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,
      message: "Sales report retrieved successfully.",
      store: {
        id: store.id,
        name: store.name,
      },
      dateRange: {
        startDate: formatDate(start),
        endDate: formatDate(end),
      },
      summary: {
        totalRevenue,
        totalSubtotal,
        totalDeliveryFees,
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        averageOrderValue,
      },
      dailySales,
      topProducts,
    });
  } catch (error) {
    console.error("GET SALES REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sales report.",
    });
  }
}
