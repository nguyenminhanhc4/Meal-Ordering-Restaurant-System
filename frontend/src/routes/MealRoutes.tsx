import { Route } from "react-router-dom";
import MealLayout from "../layouts/MealLayout";
import MealPage from "../pages/customer/menu/MealPage";
import ProductDetail from "../pages/customer/menu/ProductDetail";
import CartPage from "../pages/customer/cart/CartPage";
import OrderListPage from "../pages/customer/order/OrderListPage";
import OrderDetailPage from "../pages/customer/order/OrderDetailPage";
import PaymentPage from "../pages/payment/PaymentPage";
import MockPaymentPage from "../pages/payment/MockPaymentPage";
import PaymentSuccessPage from "../pages/payment/PaymentSuccessPage";
import PaymentFailedPage from "../pages/payment/PaymentFailedPage";
import TableSeatMap from "../pages/customer/table/TableSeatMap";
import ProfilePage from "../pages/customer/profile/ProfilePage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

export default (
  <Route element={<MealLayout />}>
    <Route path="/menu" element={<MealPage />} />
    <Route path="/menu/:categorySlug" element={<MealPage />} />
    <Route path="/menu/product/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/order" element={<OrderListPage />} />
    <Route path="/orders/:orderId" element={<OrderDetailPage />} />
    <Route path="/orders/:orderId/payment" element={<PaymentPage />} />
    <Route
      path="/mock-payments/checkout/:publicId"
      element={<MockPaymentPage />}
    />
    <Route path="/payments/success" element={<PaymentSuccessPage />} />
    <Route path="/payments/failed" element={<PaymentFailedPage />} />
    <Route path="/table" element={<TableSeatMap />}></Route>
    <Route path="/profile" element={<ProfilePage />}></Route>
    <Route path="/reset-password" element={<ResetPasswordPage />}></Route>
  </Route>
);
