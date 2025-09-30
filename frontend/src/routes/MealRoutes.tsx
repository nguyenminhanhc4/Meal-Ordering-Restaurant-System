import { Route } from "react-router-dom";
import MealLayout from "../layouts/MealLayout";
import MealPage from "../pages/customer/menu/MealPage";
import ProductDetail from "../pages/customer/menu/ProductDetail";
import CartPage from "../pages/customer/cart/CartPage";
import OrderListPage from "../pages/customer/order/OrderListPage";

export default (
  <Route element={<MealLayout />}>
    <Route path="/menu" element={<MealPage />} />
    <Route path="/menu/:categorySlug" element={<MealPage />} />
    <Route path="/menu/product/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/order" element={<OrderListPage />} />
  </Route>
);
