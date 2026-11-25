
import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

// ============================================
// GET CUSTOMER ORDERS
// ============================================

export async function getCustomerOrders(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        customerId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true,
            address: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
            barangay: true,
            deliveryFee: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        payment: true,
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your orders.",
    });
  }
}

// ============================================
// GET CUSTOMER ORDER DETAILS
// ============================================

export async function getCustomerOrderById(
  req: Request,
  res: Response
) {
  try {
    const customerId = req.user?.id;
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        customerId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true,
            address: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
            barangay: true,
            deliveryFee: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        payment: true,
        delivery: true,
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get customer order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order details.",
    });
  }
}
