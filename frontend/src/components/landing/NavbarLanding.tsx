import {
  Navbar,
  NavbarBrand,
  NavbarToggle,
  NavbarCollapse,
  NavbarLink,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
  Dropdown,
  Avatar,
  Button,
} from "flowbite-react";
import {
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineShoppingCart,
} from "react-icons/hi";
import Logo from "../../assets/img/vite.svg";
import { useAuth } from "../../store/AuthContext";
import { useNotification } from "../../components/Notification/NotificationContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationBell from "../../components/bell/NotificationBell";
import LanguageSelector from "../../components/LanguageSelector";

export default function NavbarLanding() {
  const { t } = useTranslation();
  const { isLoggedIn, user, logout } = useAuth();
  const { notify } = useNotification();
  const [activeSection, setActiveSection] = useState("hero");

  const handleLangClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "menu", "booking", "about"];
      let current = "hero";

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            current = id;
            break;
          }
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Navbar
      fluid
      className="fixed top-0 left-0 w-full z-50 shadow-lg !bg-stone-800 text-white">
      <div className="flex w-full items-center justify-between">
        {/* Brand */}
        <NavbarBrand href="/">
          <img src={Logo} className="mr-3 h-8 sm:h-10" alt="Restaurant Logo" />
          <span className="self-center whitespace-nowrap text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {t("navbarLanding.brand.name")}
          </span>
        </NavbarBrand>

        {/* Menu items */}
        <NavbarCollapse className="flex-1.5 justify-center">
          <NavbarLink
            href="#hero"
            active={activeSection === "hero"}
            className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
            {t("navbarLanding.menu.home")}
          </NavbarLink>
          <NavbarLink
            href="#menu"
            active={activeSection === "menu"}
            className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
            {t("navbarLanding.menu.menu")}
          </NavbarLink>
          <NavbarLink
            href="#about"
            active={activeSection === "about"}
            className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
            {t("navbarLanding.menu.about")}
          </NavbarLink>
          <NavbarLink
            href="#booking"
            active={activeSection === "booking"}
            className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
            {t("navbarLanding.menu.booking")}
          </NavbarLink>
        </NavbarCollapse>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn && user && <NotificationBell />}
          {isLoggedIn && user ? (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <div className="flex items-center gap-3">
                  <Avatar
                    alt="User avatar"
                    img={user.avatarUrl || undefined}
                    rounded
                    size="md"
                    className="w-10 h-10"
                    placeholderInitials={
                      user.name ? user.name.charAt(0).toUpperCase() : "?"
                    }
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-base font-semibold text-yellow-400 truncate max-w-[160px]">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-400 truncate max-w-[160px]">
                      {user.email}
                    </span>
                  </div>
                </div>
              }
              className="!bg-stone-800 shadow-lg rounded-lg">
              <DropdownHeader className="bg-stone-700 !text-yellow-400">
                <span className="block text-sm font-semibold">{user.name}</span>
                <span className="block truncate text-xs">{user.email}</span>
              </DropdownHeader>
              <DropdownItem
                className="flex items-center gap-3 hover:!text-yellow-400"
                href="/profile">
                <HiOutlineUser className="text-yellow-400" />
                {t("navbarLanding.dropdown.profile")}
              </DropdownItem>
              <DropdownItem
                className="flex items-center gap-3 hover:!text-yellow-400"
                href="/order">
                <HiOutlineShoppingCart className="text-yellow-400" />
                {t("navbarLanding.dropdown.orders")}
              </DropdownItem>
              <DropdownItem
                className="flex flex-col items-start gap-2 hover:!bg-stone-700"
                onClick={handleLangClick as unknown as () => void}>
                <LanguageSelector compact />
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem
                className="flex items-center gap-3 hover:!text-yellow-400"
                onClick={async () => {
                  await logout();
                  notify("success", t("navbarLanding.dropdown.logoutSuccess"));
                }}>
                <HiOutlineLogout className="text-yellow-400" />
                {t("navbarLanding.dropdown.logout")}
              </DropdownItem>
            </Dropdown>
          ) : (
            <Button
              className="bg-yellow-600 hover:bg-yellow-500 text-stone-900 font-semibold shadow-md"
              href="/login">
              {t("navbarLanding.login")}
            </Button>
          )}

          {/* Toggle button for mobile */}
          <NavbarToggle className="text-yellow-500 hover:text-yellow-400" />
        </div>
      </div>
    </Navbar>
  );
}
