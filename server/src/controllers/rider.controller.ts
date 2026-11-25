
import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";

// ============================================
// GET RIDER PROFILE
// ============================================

export const getMyRiderProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!rider) {
      res.status(404).json({
        message: "Rider profile not found.",
      });
      return;
    }

    res.status(200).json({
      message: "Rider profile retrieved successfully.",
      rider,
    });
  } catch (error) {
    console.error("Get rider profile error:", error);

    res.status(500).json({
      message: "Failed to retrieve rider profile.",
    });
  }
};

// ============================================
// GET RIDER DASHBOARD
// ============================================

export const getRiderDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
    });

    if (!rider) {
      res.status(404).json({
        message: "Rider profile not found.",
      });
      return;
    }

    const [
      totalDeliveries,
      activeDeliveries,
      completedDeliveries,
      recentDeliveries,
    ] = await Promise.all([
      prisma.delivery.count({
        where: {
          riderId: rider.id,
        },
      }),

      prisma.delivery.count({
        where: {
          riderId: rider.id,
          order: {
            status: {
              in: ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"],
            },
          },
        },
      }),

      prisma.delivery.count({
        where: {
          riderId: rider.id,
          order: {
            status: "DELIVERED",
          },
        },
      }),

      prisma.delivery.findMany({
        where: {
          riderId: rider.id,
        },
        include: {
          order: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
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
                  name: true,
                  barangay: true,
                },
              },
              items: {
                include: {
                  product: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    res.status(200).json({
      message: "Rider dashboard retrieved successfully.",
      dashboard: {
        rider: {
          id: rider.id,
          vehicleType: rider.vehicleType,
          plateNumber: rider.plateNumber,
          availability: rider.availability,
        },
        statistics: {
          totalDeliveries,
          activeDeliveries,
          completedDeliveries,
        },
        recentDeliveries,
      },
    });
  } catch (error) {
    console.error("Get rider dashboard error:", error);

    res.status(500).json({
      message: "Failed to retrieve rider dashboard.",
    });
  }
};

// ============================================
// GET RIDER ASSIGNED DELIVERIES
// ============================================

export const getAssignedDeliveries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!rider) {
      res.status(404).json({
        message: "Rider profile not found.",
      });
      return;
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        riderId: rider.id,
        order: {
          status: {
            in: [
              "ASSIGNED",
              "PICKED_UP",
              "OUT_FOR_DELIVERY",
            ],
          },
        },
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    res.status(200).json({
      message: "Assigned deliveries retrieved successfully.",
      deliveries,
      total: deliveries.length,
    });
  } catch (error) {
    console.error("Get assigned deliveries error:", error);

    res.status(500).json({
      message: "Failed to retrieve assigned deliveries.",
    });
  }
};

// ============================================
// UPDATE RIDER DELIVERY STATUS
// ============================================

export const updateRiderDeliveryStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized.",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        message: "Invalid delivery ID.",
      });
      return;
    }

    const allowedStatuses = [
      "PICKED_UP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        message: "Invalid delivery status.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!rider) {
      res.status(404).json({
        message: "Rider profile not found.",
      });
      return;
    }

    const delivery = await prisma.delivery.findFirst({
      where: {
        id,
        riderId: rider.id,
      },
      include: {
        order: true,
      },
    });

    if (!delivery) {
      res.status(404).json({
        message: "Assigned delivery not found.",
      });
      return;
    }

    const currentStatus = delivery.order.status;

    const validTransitions: Record<string, string[]> = {
      ASSIGNED: ["PICKED_UP"],
      PICKED_UP: ["OUT_FOR_DELIVERY"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      res.status(400).json({
        message: `Cannot change delivery status from ${currentStatus} to ${status}.`,
      });
      return;
    }

    const updatedDelivery = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: delivery.orderId },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.orderId,
          status,
          remarks: `Delivery status updated by rider.`,
        },
      });

      const updated = await tx.delivery.update({
        where: { id: delivery.id },
        data: {
          ...(status === "PICKED_UP"
            ? { pickupTime: new Date() }
            : {}),
          ...(status === "DELIVERED"
            ? { deliveredAt: new Date() }
            : {}),
        },
      });

      await tx.notification.create({
        data: {
          userId: delivery.order.customerId,
          title: "Delivery Update",
          message: `Your order ${delivery.order.orderNumber} is now ${status.replaceAll("_", " ")}.`,
        },
      });

      return {
        ...updated,
        order: updatedOrder,
      };
    });

    res.status(200).json({
      message: "Delivery status updated successfully.",
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error("Update rider delivery status error:", error);

    res.status(500).json({
      message: "Failed to update delivery status.",
    });
  }
};

// ============================================
// GET AVAILABLE DELIVERIES FOR RIDER
// ============================================

export const getAvailableDeliveries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!rider || !rider.user.isActive) {
      res.status(404).json({
        success: false,
        message: "Active rider profile not found.",
      });
      return;
    }

    if (rider.availability !== "AVAILABLE") {
      res.status(400).json({
        success: false,
        message: "You must be available to view delivery requests.",
      });
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        status: "READY_FOR_PICKUP",
        deliveryRequests: {
          none: {
            status: "APPROVED",
          },
        },
        OR: [
          {
            delivery: {
              is: null,
            },
          },
          {
            delivery: {
              is: {
                riderId: null,
              },
            },
          },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
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
        deliveryRequests: {
          where: {
            riderId: rider.id,
          },
          orderBy: {
            requestedAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50,
    });

    res.status(200).json({
      success: true,
      message: "Available deliveries retrieved successfully.",
      deliveries: orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("Get available deliveries error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve available deliveries.",
    });
  }
};

// ============================================
// REQUEST A DELIVERY
// ============================================

export const requestDelivery = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const orderId =
      typeof req.params.orderId === "string"
        ? req.params.orderId
        : undefined;

    const { riderMessage } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
      return;
    }

    if (
      riderMessage !== undefined &&
      (typeof riderMessage !== "string" || riderMessage.length > 500)
    ) {
      res.status(400).json({
        success: false,
        message: "Rider message must be a string with a maximum of 500 characters.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!rider || !rider.user.isActive) {
      res.status(404).json({
        success: false,
        message: "Active rider profile not found.",
      });
      return;
    }

    if (rider.availability !== "AVAILABLE") {
      res.status(400).json({
        success: false,
        message: "You must be AVAILABLE before requesting a delivery.",
      });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        delivery: true,
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found.",
      });
      return;
    }

    if (order.status !== "READY_FOR_PICKUP") {
      res.status(400).json({
        success: false,
        message: "This order is not available for delivery requests.",
      });
      return;
    }

    if (order.delivery?.riderId) {
      res.status(400).json({
        success: false,
        message: "This order has already been assigned to a rider.",
      });
      return;
    }

    const approvedRequest = await prisma.deliveryRequest.findFirst({
      where: {
        orderId,
        status: "APPROVED",
      },
    });

    if (approvedRequest) {
      res.status(400).json({
        success: false,
        message: "This order already has an approved rider request.",
      });
      return;
    }

    const existingRequest = await prisma.deliveryRequest.findFirst({
      where: {
        orderId,
        riderId: rider.id,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      res.status(400).json({
        success: false,
        message: "You have already requested this delivery.",
        request: existingRequest,
      });
      return;
    }

    const deliveryRequest = await prisma.$transaction(async (tx) => {
      const newRequest = await tx.deliveryRequest.create({
        data: {
          orderId,
          riderId: rider.id,
          riderMessage:
            typeof riderMessage === "string" && riderMessage.trim()
              ? riderMessage.trim()
              : null,
          status: "PENDING",
        },
      });

      const admins = await tx.user.findMany({
        where: {
          role: "ADMIN",
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: "New Delivery Request",
            message: `${rider.user.name} requested delivery for order ${order.orderNumber}.`,
          })),
        });
      }

      return newRequest;
    });

    res.status(201).json({
      success: true,
      message: "Delivery request submitted successfully. Please wait for admin approval.",
      request: deliveryRequest,
    });
  } catch (error) {
    console.error("Request delivery error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit delivery request.",
    });
  }
};

// ============================================
// GET RIDER EARNINGS
// ============================================

export const getRiderEarnings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!rider) {
      res.status(404).json({
        success: false,
        message: "Rider profile not found.",
      });
      return;
    }

    const now = new Date();

    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

    const weekStart = new Date(todayStart);
    const dayOfWeek = weekStart.getUTCDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);

    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const completedDeliveries = await prisma.delivery.findMany({
      where: {
        riderId: rider.id,
        deliveredAt: {
          not: null,
        },
        order: {
          status: "DELIVERED",
        },
      },
      select: {
        deliveredAt: true,
        order: {
          select: {
            deliveryFee: true,
          },
        },
      },
    });

    let totalEarnings = 0;
    let todayEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;

    for (const delivery of completedDeliveries) {
      const fee = Number(delivery.order.deliveryFee);
      const deliveredAt = delivery.deliveredAt;

      totalEarnings += fee;

      if (deliveredAt && deliveredAt >= todayStart && deliveredAt < tomorrowStart) {
        todayEarnings += fee;
      }

      if (deliveredAt && deliveredAt >= weekStart && deliveredAt < tomorrowStart) {
        weeklyEarnings += fee;
      }

      if (deliveredAt && deliveredAt >= monthStart && deliveredAt < tomorrowStart) {
        monthlyEarnings += fee;
      }
    }

    res.status(200).json({
      success: true,
      message: "Rider earnings retrieved successfully.",
      earnings: {
        totalEarnings,
        todayEarnings,
        weeklyEarnings,
        monthlyEarnings,
        totalCompletedDeliveries: completedDeliveries.length,
        currency: "PHP",
        earningRate: "100% of delivery fee",
      },
    });
  } catch (error) {
    console.error("Get rider earnings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve rider earnings.",
    });
  }
};

// ============================================
// GET RIDER DELIVERY HISTORY
// ============================================

export const getRiderDeliveryHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!rider) {
      res.status(404).json({
        success: false,
        message: "Rider profile not found.",
      });
      return;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const startDate =
      typeof req.query.startDate === "string"
        ? req.query.startDate
        : undefined;

    const endDate =
      typeof req.query.endDate === "string"
        ? req.query.endDate
        : undefined;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (
      (startDate && !dateRegex.test(startDate)) ||
      (endDate && !dateRegex.test(endDate))
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
      return;
    }

    const start = startDate
      ? new Date(`${startDate}T00:00:00.000Z`)
      : undefined;

    const end = endDate
      ? new Date(`${endDate}T23:59:59.999Z`)
      : undefined;

    if (
      (start && Number.isNaN(start.getTime())) ||
      (end && Number.isNaN(end.getTime()))
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid date value.",
      });
      return;
    }

    if (start && end && start > end) {
      res.status(400).json({
        success: false,
        message: "Start date cannot be later than end date.",
      });
      return;
    }

    const where = {
      riderId: rider.id,
      deliveredAt: {
        not: null,
        ...(start ? { gte: start } : {}),
        ...(end ? { lte: end } : {}),
      },
      order: {
        status: "DELIVERED" as const,
      },
    };

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        include: {
          order: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
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
            },
          },
        },
        orderBy: {
          deliveredAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.delivery.count({ where }),
    ]);

    const formattedDeliveries = deliveries.map((delivery) => ({
      ...delivery,
      earnings: Number(delivery.order.deliveryFee),
    }));

    const totalEarnings = formattedDeliveries.reduce(
      (total, delivery) => total + delivery.earnings,
      0
    );

    res.status(200).json({
      success: true,
      message: "Rider delivery history retrieved successfully.",
      deliveries: formattedDeliveries,
      summary: {
        totalDeliveries: total,
        currentPageEarnings: totalEarnings,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get rider delivery history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve rider delivery history.",
    });
  }
};

// ============================================
// UPDATE RIDER PROFILE
// ============================================

export const updateRiderProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, phone, vehicleType, plateNumber } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Name is required and must not exceed 100 characters.",
      });
      return;
    }

    if (
      phone !== undefined &&
      phone !== null &&
      (typeof phone !== "string" || phone.length > 20)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid phone number.",
      });
      return;
    }

    if (
      vehicleType !== undefined &&
      vehicleType !== null &&
      (typeof vehicleType !== "string" || vehicleType.length > 50)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid vehicle type.",
      });
      return;
    }

    if (
      plateNumber !== undefined &&
      plateNumber !== null &&
      (typeof plateNumber !== "string" || plateNumber.length > 30)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid plate number.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
    });

    if (!rider) {
      res.status(404).json({
        success: false,
        message: "Rider profile not found.",
      });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: name.trim(),
          ...(phone !== undefined
            ? { phone: phone?.trim() || null }
            : {}),
        },
      });

      return tx.riderProfile.update({
        where: { userId },
        data: {
          ...(vehicleType !== undefined
            ? { vehicleType: vehicleType?.trim() || null }
            : {}),
          ...(plateNumber !== undefined
            ? { plateNumber: plateNumber?.trim() || null }
            : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
              isActive: true,
            },
          },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Rider profile updated successfully.",
      rider: updated,
    });
  } catch (error) {
    console.error("Update rider profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update rider profile.",
    });
  }
};

// ============================================
// UPDATE RIDER AVAILABILITY
// ============================================

export const updateRiderAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { availability } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    if (!["AVAILABLE", "OFFLINE"].includes(availability)) {
      res.status(400).json({
        success: false,
        message: "Availability must be AVAILABLE or OFFLINE.",
      });
      return;
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!rider || !rider.user.isActive) {
      res.status(404).json({
        success: false,
        message: "Active rider profile not found.",
      });
      return;
    }

    const activeDeliveries = await prisma.delivery.count({
      where: {
        riderId: rider.id,
        order: {
          status: {
            in: ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"],
          },
        },
      },
    });

    if (availability === "OFFLINE" && activeDeliveries > 0) {
      res.status(400).json({
        success: false,
        message:
          "You cannot go offline while you have active deliveries.",
      });
      return;
    }

    if (availability === "AVAILABLE" && activeDeliveries > 0) {
      res.status(400).json({
        success: false,
        message:
          "You cannot become available while you have active deliveries.",
      });
      return;
    }

    const updatedRider = await prisma.riderProfile.update({
      where: { id: rider.id },
      data: { availability },
    });

    res.status(200).json({
      success: true,
      message: `Your availability is now ${availability}.`,
      availability: updatedRider.availability,
    });
  } catch (error) {
    console.error("Update rider availability error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update rider availability.",
    });
  }
};

// ============================================
// CHANGE RIDER PASSWORD
// ============================================

export const changeRiderPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
      return;
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change rider password error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};
