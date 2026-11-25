
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StoreOwnerRegistration from "./pages/StoreOwnerRegistration";
import StoreRegistrationSuccess from "./pages/StoreRegistrationSuccess";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StoreApplications from "./pages/admin/StoreApplications";
import StoreManagement from "./pages/admin/StoreManagement";
import UserManagement from "./pages/admin/UserManagement";
import DeliveryMonitoring from "./pages/admin/DeliveryMonitoring";
import RiderManagement from "./pages/admin/RiderManagement";
import AdminDeliveryZoneManagement from "./pages/admin/AdminDeliveryZones";
import AdminDeliveryRequests from "./pages/admin/AdminDeliveryRequests";

// Store Owner Pages
import StoreOwnerDashboard from "./pages/store-owner/StoreOwnerDashboard";
import ProductManagement from "./pages/store-owner/Products";
import OrderManagement from "./pages/store-owner/Orders";
import SalesReports from "./pages/store-owner/SalesReports";
import StoreProfile from "./pages/store-owner/StoreProfile";
import StoreStaffManagement from "./pages/store-owner/StaffManagement";
import StoreSettings from "./pages/store-owner/Settings";
import NotificationManagement from "./pages/store-owner/Notifications";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerBrowseStores from "./pages/customer/CustomerBrowseStores";
import CustomerCart from "./pages/customer/CutomerCart";
import CustomerCheckout from "./pages/customer/CustomerCheckout";
import CustomerMyOrders from "./pages/customer/CustomerMyOrder";
import CustomerOrderTracking from "./pages/customer/CustomerOrderTracking";
import CustomerOrderDetails from "./pages/customer/CustomerOrderDetails";
import CustomerNotifications from "./pages/customer/CustomerNotification";
import CustomerProfile from "./pages/customer/CustomerProfile";

// Rider Pages
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderAssignedDeliveries from "./pages/rider/RiderAssignedDeliveries";
import RiderLayout from "./components/rider/RiderLayout";
import RiderAvailableDeliveries from "./pages/rider/RiderAvailableDeliveries";
import RiderProfile from "./pages/rider/RiderProfile";
import RiderEarnings from "./pages/rider/RiderEarnings";
// ============================================
// UNAUTHORIZED PAGE
// ============================================

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          403 - Unauthorized
        </h1>

        <p className="mt-2 text-slate-500">
          You don't have permission to access this page.
        </p>

        <a
          href="/"
          className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

// ============================================
// APP
// ============================================

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />

        <Routes>
          {/* PUBLIC ROUTES */}

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/store-registration"
            element={<StoreOwnerRegistration />}
          />

          <Route
            path="/register-store"
            element={<Navigate to="/store-registration" replace />}
          />

          <Route
            path="/store-registration-success"
            element={<StoreRegistrationSuccess />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          {/* CUSTOMER ROUTES */}

          <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
            <Route
              path="/customer/customerdashboard"
              element={<CustomerDashboard />}
            />

            <Route
              path="/customer/browse-stores"
              element={<CustomerBrowseStores />}
            />

            <Route
              path="/customer/cart"
              element={<CustomerCart />}
            />

            <Route
              path="/customer/checkout"
              element={<CustomerCheckout />}
            />

            <Route
              path="/customer/my-orders"
              element={<CustomerMyOrders />}
            />

            <Route
              path="/customer/order-details/:id"
              element={<CustomerOrderDetails />}
            />

            <Route
              path="/customer/tracking/:id"
              element={<CustomerOrderTracking />}
            />

            <Route
              path="/customer/notifications"
              element={<CustomerNotifications />}
            />

            <Route
              path="/customer/profile"
              element={<CustomerProfile />}
            />
          </Route>

          {/* STORE OWNER ROUTES */}

          <Route element={<ProtectedRoute allowedRoles={["STORE_OWNER"]} />}>
            <Route
              path="/store-owner"
              element={<StoreOwnerDashboard />}
            />

            <Route
              path="/store-owner/products"
              element={<ProductManagement />}
            />

            <Route
              path="/store-owner/orders"
              element={<OrderManagement />}
            />

            <Route
              path="/store-owner/sales-reports"
              element={<SalesReports />}
            />

            <Route
              path="/profile"
              element={<StoreProfile />}
            />

            <Route
              path="/store-owner/staff"
              element={<StoreStaffManagement />}
            />

            <Route
              path="/store-owner/settings"
              element={<StoreSettings />}
            />

            <Route
              path="/store-owner/notifications"
              element={<NotificationManagement />}
            />
          </Route>

          {/* ADMIN ROUTES */}

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />

              <Route
                path="store-applications"
                element={<StoreApplications />}
              />

              <Route
                path="store-management"
                element={<StoreManagement />}
              />

              <Route
                path="users"
                element={<UserManagement />}
              />

              <Route
                path="deliveries"
                element={<DeliveryMonitoring />}
              />

              <Route
                path="delivery-zones"
                element={<AdminDeliveryZoneManagement />}
              />

              <Route
                path="rider-management"
                element={<RiderManagement />}
              />
              <Route
  path="delivery-requests"
  element={<AdminDeliveryRequests />}
/>
              <Route
                path="settings"
                element={
                  <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">
                      Admin Settings
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                      Manage your TownExpress administration settings.
                    </p>
                  </div>
                }
              />
            </Route>
          </Route>

<Route element={<ProtectedRoute allowedRoles={["RIDER"]} />}>
  <Route element={<RiderLayout />}>
    <Route
      path="/rider"
      element={<RiderDashboard />}
    />

    <Route
      path="/rider/assigned-deliveries"
      element={<RiderAssignedDeliveries />}
    />
    <Route
      path="/rider/available-deliveries"
      element={<RiderAvailableDeliveries />}
    />
  <Route
      path="/rider/earnings"
      element={<RiderEarnings />}
    />
    <Route
      path="/rider/profile"
      element={<RiderProfile />}
    />
  </Route>
</Route>

          {/* UNKNOWN ROUTES */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
