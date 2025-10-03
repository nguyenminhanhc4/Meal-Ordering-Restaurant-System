import { Route } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import {AdminUser} from "../pages/admin/AdminUser.tsx";

// import AdminDashboard from "./pages/AdminDashboard";

export default (
  <>
    {/* Login tách riêng */}
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* Các trang admin sau khi login thì dùng layout */}
    <Route element={<AdminLayout />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUser />} />
      {/* sau này thêm các trang khác ở đây */}
    </Route>
  </>
);
