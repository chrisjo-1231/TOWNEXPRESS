
import type { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import prisma from "../config/prisma.js";

// ============================================
// GET ALL DELIVERIES
// ============================================

export async function getAllDeliveries(
  req: Request,
  res: Response
) {
  try {
    const {
      search,
      status,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(
      100,
      Math.max(1, Number(limit) || 20)
    );

    const validStatuses = Object.values(OrderStatus);

    if (
      status &&
      status !== "ALL" &&
      !validStatuses.includes(status as OrderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status.",
      });
    }

    const where: any = {
      OR: [
        {
          delivery: {
            isNot: null,
          },
        },
        {
          status: OrderStatus.READY_FOR_PICKUP,
        },
      ],
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (typeof search === "string" && search.trim()) {
      const keyword = search.trim();

      where.AND = [
        {
          OR: [
            {
              orderNumber: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              customer: {
                name: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
            },
            {
              store: {
                name: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
            },
            {
              delivery: {
                rider: {
                  is: {
                    user: {
                      name: {
                        contains: keyword,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      ];
    }

    const [deliveries, total] = await Promise.all([
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
          store: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
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
          delivery: {
            include: {
              rider: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
          payment: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      }),

      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      deliveries,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get all deliveries error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deliveries.",
    });
  }
}

// ============================================
// GET DELIVERY DETAILS
// ============================================

export async function getDeliveryDetails(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery ID.",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
        store: true,
        zone: true,
        items: {
          include: {
            product: true,
          },
        },
        delivery: {
          include: {
            rider: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
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
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found.",
      });
    }

    return res.status(200).json({
      success: true,
      delivery: order,
    });
  } catch (error) {
    console.error("Get delivery details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch delivery details.",
    });
  }
}

// ============================================
// GET AVAILABLE RIDERS
// ============================================

export async function getAvailableRiders(
  req: Request,
  res: Response
) {
  try {
    const riders = await prisma.riderProfile.findMany({
      where: {
        availability: "AVAILABLE",
        user: {
          isActive: true,
        },
      },
      select: {
        id: true,
        vehicleType: true,
        plateNumber: true,
        availability: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return res.status(200).json({
      success: true,
      riders,
      total: riders.length,
    });
  } catch (error) {
    console.error("Get available riders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available riders.",
    });
  }
}

// ============================================
// ASSIGN RIDER TO ORDER
// ============================================

export async function assignRider(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { riderId } = req.body;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    if (typeof riderId !== "string" || !riderId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rider ID is required.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id,
        },
        include: {
          delivery: true,
        },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.status !== OrderStatus.READY_FOR_PICKUP) {
        throw new Error("ORDER_NOT_READY");
      }

      const rider = await tx.riderProfile.findFirst({
        where: {
          id: riderId,
          availability: "AVAILABLE",
          user: {
            isActive: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!rider) {
        throw new Error("RIDER_NOT_AVAILABLE");
      }

      if (order.delivery?.riderId) {
        throw new Error("ORDER_ALREADY_ASSIGNED");
      }

      // Reserve the rider.
      const riderReservation = await tx.riderProfile.updateMany({
        where: {
          id: rider.id,
          availability: "AVAILABLE",
        },
        data: {
          availability: "BUSY",
        },
      });

      if (riderReservation.count === 0) {
        throw new Error("RIDER_NOT_AVAILABLE");
      }

      // Create or update the delivery record.
      if (order.delivery) {
        await tx.delivery.update({
          where: {
            id: order.delivery.id,
          },
          data: {
            riderId: rider.id,
          },
        });
      } else {
        await tx.delivery.create({
          data: {
            orderId: order.id,
            riderId: rider.id,
          },
        });
      }

      // Update order status.
      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: OrderStatus.ASSIGNED,
        },
      });

      // Record order status history.
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.ASSIGNED,
          remarks: `Rider ${rider.user.name} assigned by administrator.`,
        },
      });

      // Notify rider.
      await tx.notification.create({
        data: {
          userId: rider.userId,
          title: "New Delivery Assignment",
          message: `You have been assigned order ${order.orderNumber}.`,
        },
      });

      // Notify customer.
      await tx.notification.create({
        data: {
          userId: order.customerId,
          title: "Rider Assigned",
          message: `A rider has been assigned to your order ${order.orderNumber}.`,
        },
      });

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        riderId: rider.id,
        riderName: rider.user.name,
        availability: "BUSY",
      };
    });

    return res.status(200).json({
      success: true,
      message: "Rider assigned successfully.",
      assignment: result,
    });
  } catch (error) {
    console.error("Assign rider error:", error);

    const message =
      error instanceof Error ? error.message : "";

    if (message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (message === "ORDER_NOT_READY") {
      return res.status(400).json({
        success: false,
        message: "Only orders ready for pickup can be assigned.",
      });
    }

    if (message === "RIDER_NOT_AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Rider is no longer available. Please select another rider.",
      });
    }

    if (message === "ORDER_ALREADY_ASSIGNED") {
      return res.status(400).json({
        success: false,
        message: "This order already has an assigned rider.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to assign rider.",
    });
  }
}
