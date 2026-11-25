import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

export async function getCustomerDeliveryZones(
  _req: Request,
  res: Response
) {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        barangay: true,
        deliveryFee: true,
      },
      orderBy: {
        barangay: "asc",
      },
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