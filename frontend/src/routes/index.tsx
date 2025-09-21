import { Routes } from "react-router-dom";
import AuthRoutes from "./AuthRoutes";
// sau này có AdminRoutes, StaffRoutes, CustomerRoutes thì import thêm

export default function AppRoutes() {
  return (
    <Routes>
      {AuthRoutes}
      {/* {AdminRoutes} */}
      {/* {StaffRoutes} */}
      {/* {CustomerRoutes} */}
    </Routes>
  );
}
