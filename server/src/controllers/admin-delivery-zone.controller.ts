
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

const zoneSchema = z.object({
  name: z.string().trim().min(2).max(100),
  barangay: z.string().trim().min(2).max(100),
  deliveryFee: z.coerce.number().min(0),
  isActive: z.boolean().optional().default(true),
});

// GET ALL DELIVERY ZONES
export async function getDeliveryZones(
  _req: Request,
  res: Response
) {
  try {
    const zones = await prisma.deliveryZone.findMany({
      orderBy: { barangay: "asc" },
    });

    return res.status(200).json({
      success: true,
      zones: zones.map((zone) => ({
        ...zone,
        deliveryFee: Number(zone.deliveryFee),
      })),
    });
  } catch (error) {
    console.error("GET DELIVERY ZONES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve delivery zones.",
    });
  }
}

// CREATE DELIVERY ZONE
export async function createDeliveryZone(
  req: Request,
  res: Response
) {
  try {
    const validation = zoneSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery zone information.",
        errors: validation.error.flatten(),
      });
    }

    const { name, barangay, deliveryFee, isActive } = validation.data;

    const existing = await prisma.deliveryZone.findFirst({
      where: { barangay },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This barangay already has a delivery zone.",
      });
    }

    const zone = await prisma.deliveryZone.create({
      data: {
        name,
        barangay,
        deliveryFee,
        isActive,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Delivery zone created successfully.",
      zone: {
        ...zone,
        deliveryFee: Number(zone.deliveryFee),
      },
    });
  } catch (error) {
    console.error("CREATE DELIVERY ZONE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create delivery zone.",
    });
  }
}

// UPDATE DELIVERY ZONE
export async function updateDeliveryZone(
  req: Request,
  res: Response
) {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Delivery zone ID is required.",
      });
    }

    const validation = zoneSchema.partial().safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery zone information.",
        errors: validation.error.flatten(),
      });
    }

    const existing = await prisma.deliveryZone.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Delivery zone not found.",
      });
    }

    const data = validation.data;

    if (data.barangay) {
      const duplicate = await prisma.deliveryZone.findFirst({
        where: {
          barangay: data.barangay,
          NOT: { id },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "This barangay already has a delivery zone.",
        });
      }
    }

    const zone = await prisma.deliveryZone.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Delivery zone updated successfully.",
      zone: {
        ...zone,
        deliveryFee: Number(zone.deliveryFee),
      },
    });
  } catch (error) {
    console.error("UPDATE DELIVERY ZONE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update delivery zone.",
    });
  }
}

// DELETE DELIVERY ZONE
export async function deleteDeliveryZone(
  req: Request,
  res: Response
) {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Delivery zone ID is required.",
      });
    }

    const existing = await prisma.deliveryZone.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Delivery zone not found.",
      });
    }

    const linkedOrders = await prisma.order.count({
      where: { zoneId: id },
    });

    if (linkedOrders > 0) {
      return res.status(409).json({
        success: false,
        message: "This zone is already used by orders. Deactivate it instead.",
      });
    }

    await prisma.deliveryZone.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Delivery zone deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE DELIVERY ZONE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete delivery zone.",
    });
  }
}
