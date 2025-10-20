import { Route } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import { AdminUser } from "../pages/admin/AdminUser.tsx";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminMenuItems from "../pages/admin/AdminMenuItems";
import { AdminOrderFood } from "../pages/admin/orders/AdminOrderFood.tsx";

// import AdminDashboard from "./pages/AdminDashboard";

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
      <Route path="/admin/orders/food" element={<AdminOrderFood />} />
      {/* sau này thêm các trang khác ở đây */}
    </Route>
  </>
);
