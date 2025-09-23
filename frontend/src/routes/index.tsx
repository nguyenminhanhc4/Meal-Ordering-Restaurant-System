import { Routes } from "react-router-dom";
import AuthRoutes from "./AuthRoutes";
import LandingRoutes from "./LandingRoutes";
// sau này có AdminRoutes, StaffRoutes, CustomerRoutes thì import thêm

export default function AppRoutes() {
  return (
    <Routes>
      {LandingRoutes}
      {AuthRoutes}
      {/* {AdminRoutes} */}
      {/* {StaffRoutes} */}
      {/* {CustomerRoutes} */}
    </Routes>
  );
}
