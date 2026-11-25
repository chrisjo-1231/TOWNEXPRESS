
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

// ============================================
// ROUTE IMPORTS
// ============================================

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import storeOwnerRoutes from "./routes/store-owner.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminUserRoutes from "./routes/admin-user.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import salesReportRoutes from "./routes/sales-report.routes.js";
import storeStaffRoutes from "./routes/store-staff.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import customerStoreRoutes from "./routes/customer-store.routes.js";
import customerOrderRoutes from "./routes/customer-order.routes.js";
import customerZoneRoutes from "./routes/customer-zone.routes.js";
import myOrdersRoutes from "./routes/customer-my-orders.routes.js";
import customerTrackingRoutes from "./routes/customer-tracking.routes.js";
import adminDeliveryZoneRoutes from "./routes/admin-delivery-zone.routes.js";
import customerNotificationRoutes from "./routes/customer-notification.routes.js";
import customerProfileRoutes from "./routes/customer-profile.routes.js";
import riderRoutes from "./routes/rider.routes.js";
import adminDeliveryRoutes from "./routes/admin-delivery.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

// ============================================
// SECURITY AND MIDDLEWARE
// ============================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// ============================================
// STATIC UPLOADS
// ============================================

const uploadsDirectory = path.join(process.cwd(), "uploads");

app.use("/uploads", express.static(uploadsDirectory));

// ============================================
// MAIN API ROUTE
// ============================================

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "TownExpress API is running!",
  });
});

// ============================================
// HEALTH AND AUTH ROUTES
// ============================================

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// ============================================
// STORE OWNER ROUTES
// ============================================

app.use("/api/store-owners", storeOwnerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sales-reports", salesReportRoutes);
app.use("/api/store-staff", storeStaffRoutes);
app.use("/api/notifications", notificationRoutes);

// ============================================
// ADMIN ROUTES
// ============================================

app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/delivery-zones", adminDeliveryZoneRoutes);
app.use("/api/admin/deliveries", adminDeliveryRoutes);
app.use("/api/admin", adminRoutes);

// ============================================
// CUSTOMER ROUTES
// ============================================

app.use("/api/customer/stores", customerStoreRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/customer/delivery-zones", customerZoneRoutes);
app.use("/api/customer/my-orders", myOrdersRoutes);
app.use("/api/customer/tracking", customerTrackingRoutes);
app.use("/api/customer/notifications", customerNotificationRoutes);
app.use("/api/customer/profile", customerProfileRoutes);

// ============================================
// RIDER ROUTES
// ============================================

app.use("/api/rider", riderRoutes);

app.get("/api/rider-test", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Rider API is loaded!",
  });
});


// ============================================
// EXPORT
// ============================================

export default app;
