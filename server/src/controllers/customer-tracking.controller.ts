
import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

// ============================================
// GET CUSTOMER ORDER TRACKING
// ============================================

export async function getCustomerOrderTracking(
  req: Request,
  res: Response
) {
  try {
    const customerId = req.user?.id;
    const id = req.params.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        customerId,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        deliveryAddress: true,

        store: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          },
        },

        delivery: {
          select: {
            id: true,
            riderId: true,
            pickupTime: true,
            deliveredAt: true,
            proofImage: true,
            notes: true,
          },
        },

        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            status: true,
            remarks: true,
            createdAt: true,
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
      tracking: order,
    });
  } catch (error) {
    console.error("Customer order tracking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order tracking information.",
    });
  }
}
