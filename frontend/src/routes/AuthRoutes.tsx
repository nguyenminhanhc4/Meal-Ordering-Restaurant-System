import { Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../pages/auth/LoginForm";
import RegisterForm from "../pages/auth/RegisterForm";

export default (
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<LoginForm />} />
    <Route path="/register" element={<RegisterForm />} />
  </Route>
);
