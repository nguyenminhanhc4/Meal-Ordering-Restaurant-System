import { Route } from "react-router-dom";
import MealLayout from "../layouts/MealLayout";
import MealPage from "../pages/customer/menu/MealPage";

export default (
  <Route element={<MealLayout />}>
    <Route path="/menu" element={<MealPage />} />
  </Route>
);
