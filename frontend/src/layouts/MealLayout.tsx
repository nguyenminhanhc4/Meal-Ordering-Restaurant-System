import { Outlet } from "react-router-dom";
import MegaMenu from "../components/menu/MegaMenuComponent";
import FooterLanding from "../components/landing/FooterLanding";

export default function MealLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar cố định */}
      <MegaMenu />

      {/* Nội dung page */}
      <main className="flex-grow">
        <Outlet /> {/* chỉ cần 1 outlet */}
      </main>

      {/* Footer */}
      <FooterLanding />
    </div>
  );
}
