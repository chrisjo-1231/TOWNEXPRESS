
import { Router } from "express";
import prisma from "../config/prisma.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "TownExpress API is healthy!",
  });
});

router.get("/db", async (_req, res) => {
  try {
    const userCount = await prisma.user.count();
    const storeCount = await prisma.store.count();
    const orderCount = await prisma.order.count();

    res.json({
      success: true,
      database: "Connected",
      statistics: {
        users: userCount,
        stores: storeCount,
        orders: orderCount,
      },
    });
  } catch (error) {
    console.error("Database test failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

export default router;
