import { Routes } from "react-router-dom";
import AuthRoutes from "./AuthRoutes";
import LandingRoutes from "./LandingRoutes";
import MealRoutes from "./MealRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {LandingRoutes}
      {AuthRoutes}
      {MealRoutes}
    </Routes>
  );
}
