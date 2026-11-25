
import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// ============================================
// HELPERS
// ============================================

async function getOwnerStore(ownerId: string) {
  return prisma.store.findFirst({
    where: { ownerId },
    select: { id: true },
  });
}

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

// Store owners can only manage these transitions.
// Rider/admin delivery statuses are handled by their own modules.
const allowedTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: [],
  ASSIGNED: [],
  PICKED_UP: [],
  OUT_FOR_DELIVERY: [],
  DELIVERED: [],
  CANCELLED: [],
};

// ============================================
// GET MY STORE ORDERS
// ============================================

export async function getMyOrders(req: Request, res: Response) {
  try {
    const ownerId = req.user!.id;

    const store = await getOwnerStore(ownerId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : "";

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    if (
      status &&
      !orderStatuses.includes(status as (typeof orderStatuses)[number])
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const where: any = {
      storeId: store.id,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                orderNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                customer: {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                customer: {
                  phone: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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
          delivery: {
            include: {
              rider: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
          zone: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      payment: order.payment
        ? {
            ...order.payment,
            amount: Number(order.payment.amount),
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders.",
    });
  }
}

// ============================================
// GET ORDER DETAILS
// ============================================

export async function getMyOrderById(
  req: Request,
  res: Response
) {
  try {
    const ownerId = req.user!.id;
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const store = await getOwnerStore(ownerId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        storeId: store.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
        delivery: {
          include: {
            rider: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        zone: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
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
      message: "Order details retrieved successfully.",
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        totalAmount: Number(order.totalAmount),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
        })),
        payment: order.payment
          ? {
              ...order.payment,
              amount: Number(order.payment.amount),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("GET ORDER DETAILS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order details.",
    });
  }
}

// ============================================
// UPDATE ORDER STATUS
// ============================================

const updateStatusSchema = z.object({
  status: z.enum(orderStatuses),
  remarks: z.string().max(500).optional(),
});

export async function updateMyOrderStatus(
  req: Request,
  res: Response
) {
  try {
    const ownerId = req.user!.id;
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data.",
        errors: validation.error.flatten(),
      });
    }

    const { status: newStatus, remarks } = validation.data;

    const store = await getOwnerStore(ownerId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        storeId: store.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
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

    const allowed = allowedTransitions[order.status] ?? [];

    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be changed from ${order.status} to ${newStatus}.`,
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: newStatus,
          remarks:
            remarks?.trim() ||
            `Order status changed to ${newStatus}.`,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.customerId,
          title: "Order Status Updated",
          message: `Your order ${order.orderNumber} is now ${newStatus.replaceAll("_", " ")}.`,
        },
      });

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order: {
        ...updatedOrder,
        subtotal: Number(updatedOrder.subtotal),
        deliveryFee: Number(updatedOrder.deliveryFee),
        totalAmount: Number(updatedOrder.totalAmount),
      },
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
}
