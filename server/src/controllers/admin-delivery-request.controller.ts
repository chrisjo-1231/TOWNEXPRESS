
import type { Request, Response } from "express";
import {
  OrderStatus,
  DeliveryRequestStatus,
  Prisma,
} from "@prisma/client";
import prisma from "../config/prisma.js";

// ============================================
// GET ALL DELIVERY REQUESTS
// ============================================

export async function getAllDeliveryRequests(
    
  req: Request,
  res: Response
) {
  try {
    const {
      status = "PENDING",
      page = "1",
      limit = "20",
    } = req.query;
console.log("GET ALL DELIVERY REQUESTS CONTROLLER HIT");
console.log("QUERY:", req.query);
console.log("ADMIN USER:", req.user);
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));

    const validStatuses = Object.values(DeliveryRequestStatus);

    if (
      status !== "ALL" &&
      !validStatuses.includes(status as DeliveryRequestStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery request status.",
      });
    }

    const where: Prisma.DeliveryRequestWhereInput =
      status === "ALL"
        ? {}
        : { status: status as DeliveryRequestStatus };

    const [requests, total] = await Promise.all([
      prisma.deliveryRequest.findMany({
        where,
        include: {
          order: {
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
              zone: true,
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
            },
          },
          rider: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  isActive: true,
                },
              },
            },
          },
          reviewedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          requestedAt: "desc",
        },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      }),

      prisma.deliveryRequest.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      requests,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get delivery requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch delivery requests.",
    });
  }
}

// ============================================
// APPROVE DELIVERY REQUEST
// ============================================

export async function approveDeliveryRequest(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    const { adminNote } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery request ID.",
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication required.",
      });
    }

    if (
      adminNote !== undefined &&
      (typeof adminNote !== "string" || adminNote.length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin note must not exceed 500 characters.",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const deliveryRequest = await tx.deliveryRequest.findUnique({
          where: { id },
          include: {
            order: {
              include: {
                delivery: true,
              },
            },
            rider: {
              include: {
                user: true,
              },
            },
          },
        });

        if (!deliveryRequest) {
          throw new Error("REQUEST_NOT_FOUND");
        }

        if (deliveryRequest.status !== DeliveryRequestStatus.PENDING) {
          throw new Error("REQUEST_ALREADY_REVIEWED");
        }

        const order = deliveryRequest.order;
        const rider = deliveryRequest.rider;

        if (order.status !== OrderStatus.READY_FOR_PICKUP) {
          throw new Error("ORDER_NOT_READY");
        }

        if (order.delivery?.riderId) {
          throw new Error("ORDER_ALREADY_ASSIGNED");
        }

        if (
          !rider.user.isActive ||
          rider.availability !== "AVAILABLE"
        ) {
          throw new Error("RIDER_NOT_AVAILABLE");
        }

        // Reserve the rider.
        const riderReservation = await tx.riderProfile.updateMany({
          where: {
            id: rider.id,
            availability: "AVAILABLE",
            user: {
              isActive: true,
            },
          },
          data: {
            availability: "BUSY",
          },
        });

        if (riderReservation.count === 0) {
          throw new Error("RIDER_NOT_AVAILABLE");
        }

        // Reserve the order.
        const orderReservation = await tx.order.updateMany({
          where: {
            id: order.id,
            status: OrderStatus.READY_FOR_PICKUP,
            delivery: {
              is: {
                riderId: null,
              },
            },
          },
          data: {
            status: OrderStatus.ASSIGNED,
          },
        });

        // If no Delivery record exists yet, reserve by checking
        // the order status update and create the record below.
        if (orderReservation.count === 0) {
          const currentOrder = await tx.order.findUnique({
            where: { id: order.id },
            include: { delivery: true },
          });

          if (
            !currentOrder ||
            currentOrder.status !== OrderStatus.READY_FOR_PICKUP ||
            currentOrder.delivery?.riderId
          ) {
            throw new Error("ORDER_ALREADY_ASSIGNED");
          }

          // Handles orders without an existing Delivery record.
          const fallbackReservation = await tx.order.updateMany({
            where: {
              id: order.id,
              status: OrderStatus.READY_FOR_PICKUP,
            },
            data: {
              status: OrderStatus.ASSIGNED,
            },
          });

          if (fallbackReservation.count === 0) {
            throw new Error("ORDER_ALREADY_ASSIGNED");
          }
        }

        // Create or update Delivery.
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

        // Approve the selected request.
        const approvedRequest = await tx.deliveryRequest.updateMany({
          where: {
            id,
            status: DeliveryRequestStatus.PENDING,
          },
          data: {
            status: DeliveryRequestStatus.APPROVED,
            reviewedById: adminId,
            reviewedAt: new Date(),
            adminNote: adminNote?.trim() || null,
          },
        });

        if (approvedRequest.count === 0) {
          throw new Error("REQUEST_ALREADY_REVIEWED");
        }

        // Reject other pending requests for this order.
        const otherRequests = await tx.deliveryRequest.findMany({
          where: {
            orderId: order.id,
            id: { not: id },
            status: DeliveryRequestStatus.PENDING,
          },
          select: {
            id: true,
            riderId: true,
          },
        });

        await tx.deliveryRequest.updateMany({
          where: {
            orderId: order.id,
            id: { not: id },
            status: DeliveryRequestStatus.PENDING,
          },
          data: {
            status: DeliveryRequestStatus.REJECTED,
            reviewedById: adminId,
            reviewedAt: new Date(),
            adminNote: "Another rider was selected for this delivery.",
          },
        });

        // Order status history.
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: OrderStatus.ASSIGNED,
            remarks: `Delivery request approved. Rider: ${rider.user.name}.`,
          },
        });

        // Notify selected rider.
        await tx.notification.create({
          data: {
            userId: rider.userId,
            title: "Delivery Request Approved",
            message: `Your request for order ${order.orderNumber} has been approved.`,
          },
        });

        // Notify customer.
        await tx.notification.create({
          data: {
            userId: order.customerId,
            title: "Rider Assigned",
            message: `${rider.user.name} has been assigned to your order ${order.orderNumber}.`,
          },
        });

        // Notify other riders whose requests were rejected.
        for (const otherRequest of otherRequests) {
          const otherRider = await tx.riderProfile.findUnique({
            where: { id: otherRequest.riderId },
            select: { userId: true },
          });

          if (otherRider) {
            await tx.notification.create({
              data: {
                userId: otherRider.userId,
                title: "Delivery Request Not Selected",
                message: `Another rider was selected for order ${order.orderNumber}.`,
              },
            });
          }
        }

        return {
          requestId: id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          riderId: rider.id,
          riderName: rider.user.name,
          orderStatus: OrderStatus.ASSIGNED,
          riderAvailability: "BUSY",
          rejectedRequests: otherRequests.length,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Delivery request approved successfully.",
      approval: result,
    });
  } catch (error) {
    console.error("Approve delivery request error:", error);

    const message = error instanceof Error ? error.message : "";

    if (message === "REQUEST_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Delivery request not found.",
      });
    }

    if (message === "REQUEST_ALREADY_REVIEWED") {
      return res.status(400).json({
        success: false,
        message: "This delivery request has already been reviewed.",
      });
    }

    if (message === "ORDER_NOT_READY") {
      return res.status(400).json({
        success: false,
        message: "This order is no longer ready for pickup.",
      });
    }

    if (message === "ORDER_ALREADY_ASSIGNED") {
      return res.status(400).json({
        success: false,
        message: "This order already has an assigned rider.",
      });
    }

    if (message === "RIDER_NOT_AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "The rider is no longer available.",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return res.status(409).json({
        success: false,
        message: "A concurrent update occurred. Please refresh and try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to approve delivery request.",
    });
  }
}

// ============================================
// REJECT DELIVERY REQUEST
// ============================================

export async function rejectDeliveryRequest(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    const { adminNote } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery request ID.",
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication required.",
      });
    }

    if (
      adminNote !== undefined &&
      (typeof adminNote !== "string" || adminNote.length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin note must not exceed 500 characters.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const deliveryRequest = await tx.deliveryRequest.findUnique({
        where: { id },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
          rider: {
            select: {
              userId: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!deliveryRequest) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      if (deliveryRequest.status !== DeliveryRequestStatus.PENDING) {
        throw new Error("REQUEST_ALREADY_REVIEWED");
      }

      const updated = await tx.deliveryRequest.updateMany({
        where: {
          id,
          status: DeliveryRequestStatus.PENDING,
        },
        data: {
          status: DeliveryRequestStatus.REJECTED,
          reviewedById: adminId,
          reviewedAt: new Date(),
          adminNote: adminNote?.trim() || null,
        },
      });

      if (updated.count === 0) {
        throw new Error("REQUEST_ALREADY_REVIEWED");
      }

      await tx.notification.create({
        data: {
          userId: deliveryRequest.rider.userId,
          title: "Delivery Request Rejected",
          message: adminNote?.trim()
            ? `Your request for order ${deliveryRequest.order.orderNumber} was rejected. Admin note: ${adminNote.trim()}`
            : `Your request for order ${deliveryRequest.order.orderNumber} was rejected.`,
        },
      });

      return {
        requestId: deliveryRequest.id,
        orderNumber: deliveryRequest.order.orderNumber,
        riderName: deliveryRequest.rider.user.name,
        status: DeliveryRequestStatus.REJECTED,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Delivery request rejected successfully.",
      rejection: result,
    });
  } catch (error) {
    console.error("Reject delivery request error:", error);

    const message = error instanceof Error ? error.message : "";

    if (message === "REQUEST_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Delivery request not found.",
      });
    }

    if (message === "REQUEST_ALREADY_REVIEWED") {
      return res.status(400).json({
        success: false,
        message: "This delivery request has already been reviewed.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to reject delivery request.",
    });
  }
}
