import { Route } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import { AdminUser } from "../pages/admin/AdminUser.tsx";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminMenuItems from "../pages/admin/menu/AdminMenuItems.tsx";
import AdminCombos from "../pages/admin/menu/AdminCombos.tsx";
import { AdminOrderFood } from "../pages/admin/orders/AdminOrderFood.tsx";
import { AdminTableOrders } from "../pages/admin/orders/AdminTableOrders.tsx";
import NotificationList from "../components/Notification/NotificationList.tsx";
import AdminTables from "../pages/admin/AdminTablePage";
import IngredientPage from "../pages/admin/AdminIngredientPage.tsx";
import SettingsPage from "../pages/admin/settings/SettingsPage.tsx";

export default (
  <>
    {/* Login tách riêng */}
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* Các trang admin sau khi login thì dùng layout */}
    <Route element={<AdminLayout />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUser />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/menu-items" element={<AdminMenuItems />} />
      <Route path="/admin/combos" element={<AdminCombos />} />
      <Route path="/admin/orders/food" element={<AdminOrderFood />} />
      <Route path="/admin/orders/tables" element={<AdminTableOrders />} />
      <Route path="/admin/notifications" element={<NotificationList />} />
      <Route path="/admin/tables" element={<AdminTables />} />
      <Route path="/admin/ingredients" element={<IngredientPage />} />
      <Route path="/admin/settings" element={<SettingsPage />} />
    </Route>
  </>
);
