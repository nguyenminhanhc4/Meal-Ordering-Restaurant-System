import { Route } from "react-router-dom";
import LandingLayout from "../layouts/LandingLayout";
import LandingPage from "../pages/customer/landing/LandingPage";
// import AboutPage from "../pages/customer/landing/AboutPage";
// import MenuPage from "../pages/customer/landing/MenuPage";
// import BookingPage from "../pages/customer/landing/BookingPage";

export default (
  <Route element={<LandingLayout />}>
    <Route path="/" element={<LandingPage />} />
  </Route>
);
