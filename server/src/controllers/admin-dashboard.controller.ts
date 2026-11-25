
import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const getAdminDashboardStats = async (
  _req: Request,
  res: Response
) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalStoreOwners,
      totalStores,
      totalRiders,
      activeRiders,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: { role: "CUSTOMER" },
      }),

      prisma.user.count({
        where: { role: "STORE_OWNER" },
      }),

      prisma.store.count(),

      prisma.user.count({
        where: { role: "RIDER" },
      }),

      prisma.user.count({
        where: {
          role: "RIDER",
          isActive: true,
        },
      }),

      prisma.order.count(),

      prisma.order.count({
        where: { status: "PENDING" },
      }),

      prisma.order.count({
        where: { status: "DELIVERED" },
      }),

      prisma.order.count({
        where: { status: "CANCELLED" },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully.",
      stats: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          storeOwners: totalStoreOwners,
        },
        stores: {
          total: totalStores,
        },
        riders: {
          total: totalRiders,
          active: activeRiders,
          inactive: totalRiders - activeRiders,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard statistics.",
    });
  }
};
