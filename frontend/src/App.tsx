import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./store/ThemeContext";
import "./i18n";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
        <ScrollToTop />
      </ThemeProvider>
    </BrowserRouter>
  );
}
