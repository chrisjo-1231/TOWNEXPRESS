
import type { Request, Response } from "express";
import { RiderAvailability, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/prisma.js";

// ============================================
// GET ALL RIDERS
// ============================================

export async function getAllRiders(
  req: Request,
  res: Response
) {
  try {
    const { search, availability, status } = req.query;

    const where: any = {
      role: UserRole.RIDER,
    };

    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "INACTIVE") {
      where.isActive = false;
    }

    if (
      availability &&
      availability !== "ALL" &&
      Object.values(RiderAvailability).includes(
        availability as RiderAvailability
      )
    ) {
      where.riderProfile = {
        is: {
          availability,
        },
      };
    }

    if (typeof search === "string" && search.trim()) {
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
      ];
    }

    const riders = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        riderProfile: {
          select: {
            id: true,
            vehicleType: true,
            plateNumber: true,
            availability: true,
            _count: {
              select: {
                deliveries: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: riders.length,
      riders,
    });
  } catch (error) {
    console.error("Get riders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch riders.",
    });
  }
}

// ============================================
// REGISTER RIDER
// ============================================

const registerRiderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().min(10).max(20).optional(),
  password: z.string().min(8).max(72),
  vehicleType: z.string().trim().min(2).max(50),
  plateNumber: z.string().trim().min(2).max(30).optional(),
});

export async function registerRider(
  req: Request,
  res: Response
) {
  try {
    const parsed = registerRiderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider information.",
        errors: parsed.error.flatten(),
      });
    }

    const {
      name,
      email,
      phone,
      password,
      vehicleType,
      plateNumber,
    } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const rider = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          passwordHash,
          role: UserRole.RIDER,
          isActive: true,
          riderProfile: {
            create: {
              vehicleType,
              plateNumber: plateNumber || null,
              availability: RiderAvailability.OFFLINE,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          riderProfile: true,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Rider registered successfully.",
      rider,
    });
  } catch (error) {
    console.error("Register rider error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register rider.",
    });
  }
}

// ============================================
// GET RIDER DETAILS
// ============================================

export async function getRiderDetails(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID.",
      });
    }

    const rider = await prisma.user.findFirst({
      where: {
        id,
        role: UserRole.RIDER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        riderProfile: {
          include: {
            _count: {
              select: {
                deliveries: true,
              },
            },
            deliveries: {
              take: 10,
              orderBy: {
                createdAt: "desc",
              },
              include: {
                order: {
                  select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    totalAmount: true,
                    deliveryAddress: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found.",
      });
    }

    return res.status(200).json({
      success: true,
      rider,
    });
  } catch (error) {
    console.error("Get rider details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch rider details.",
    });
  }
}

// ============================================
// ACTIVATE / DEACTIVATE RIDER
// ============================================

const riderStatusSchema = z.object({
  isActive: z.boolean(),
});

export async function updateRiderStatus(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID.",
      });
    }

    const parsed = riderStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean.",
      });
    }

    const rider = await prisma.user.findFirst({
      where: {
        id,
        role: UserRole.RIDER,
      },
      include: {
        riderProfile: true,
      },
    });

    if (!rider || !rider.riderProfile) {
      return res.status(404).json({
        success: false,
        message: "Rider not found.",
      });
    }

    if (!parsed.data.isActive) {
      const activeDeliveries = await prisma.delivery.count({
        where: {
          riderId: rider.riderProfile.id,
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
      });

      if (activeDeliveries > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot deactivate rider with active deliveries.",
        });
      }
    }

    const updatedRider = await prisma.user.update({
      where: { id },
      data: {
        isActive: parsed.data.isActive,
        ...(parsed.data.isActive
          ? {}
          : {
              riderProfile: {
                update: {
                  availability: RiderAvailability.OFFLINE,
                },
              },
            }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        riderProfile: {
          select: {
            availability: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: parsed.data.isActive
        ? "Rider activated successfully."
        : "Rider deactivated successfully.",
      rider: updatedRider,
    });
  } catch (error) {
    console.error("Update rider status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update rider status.",
    });
  }
}

// ============================================
// UPDATE RIDER AVAILABILITY
// ============================================

const availabilitySchema = z.object({
  availability: z.nativeEnum(RiderAvailability),
});

export async function updateRiderAvailability(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID.",
      });
    }

    const parsed = availabilitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider availability.",
      });
    }

    const rider = await prisma.user.findFirst({
      where: {
        id,
        role: UserRole.RIDER,
      },
      include: {
        riderProfile: true,
      },
    });

    if (!rider || !rider.riderProfile) {
      return res.status(404).json({
        success: false,
        message: "Rider not found.",
      });
    }

    if (!rider.isActive && parsed.data.availability !== "OFFLINE") {
      return res.status(400).json({
        success: false,
        message: "Inactive riders cannot change availability.",
      });
    }

    const updatedProfile = await prisma.riderProfile.update({
      where: {
        userId: id,
      },
      data: {
        availability: parsed.data.availability,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Rider availability updated successfully.",
      riderProfile: updatedProfile,
    });
  } catch (error) {
    console.error("Update rider availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update rider availability.",
    });
  }
}
