import { Outlet } from "react-router-dom";
import NavbarLanding from "../components/landing/NavbarLanding";
import FooterLanding from "../components/landing/FooterLanding";

export default function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar cố định */}
      <NavbarLanding />

      {/* Nội dung page */}
      <main className="flex-1 pt-10">
        <Outlet /> {/* chỉ cần 1 outlet */}
      </main>

      {/* Footer */}
      <FooterLanding />
    </div>
  );
}
