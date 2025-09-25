import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ScrollToTop />
    </BrowserRouter>
  );
}
