import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import ScrollToTop from "./components/ScrollToTop";
import "./i18n";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ScrollToTop />
    </BrowserRouter>
  );
}
