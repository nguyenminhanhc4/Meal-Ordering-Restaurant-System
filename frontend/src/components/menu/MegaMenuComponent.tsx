import React, { useEffect, useState } from "react";
import {
  Navbar,
  Dropdown,
  Button,
  Avatar,
  NavbarBrand,
  NavbarToggle,
  NavbarCollapse,
  NavbarLink,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
  Badge,
} from "flowbite-react";
import {
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineShoppingCart,
  HiChevronRight,
} from "react-icons/hi";
import Logo from "../../assets/img/vite.svg";
import { useAuth } from "../../store/AuthContext";
import { useNotification } from "../Notification/NotificationContext";
import {
  fetchCategories,
  fetchCategoryById,
} from "../../services/category/fetchCategories";
import type { Category } from "../../services/category/fetchCategories";
import { AxiosError } from "axios";
import { useLocation } from "react-router-dom";
import { useCart } from "../../store/CartContext";
import {
  useRealtimeUpdate,
  useRealtimeDelete,
} from "../../api/useRealtimeUpdate";
import NotificationBell from "../../components/bell/NotificationBell";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";
import { Link } from "react-router-dom";

const MegaMenuComponent: React.FC = () => {
  const { t } = useTranslation();
  const { isLoggedIn, user, logout } = useAuth();
  const { notify } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cartItemCount, isLoading } = useCart();
  const [openChildIds, setOpenChildIds] = useState<number[]>([]);

  const toggleChild = (id: number) => {
    setOpenChildIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLangClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          notify(
            "error",
            err.response?.data.message ||
              t("component.megaMenu.loadCategoriesError")
          );
          console.error("Categories retrieve failed:", err.response?.data);
        } else {
          notify("error", t("component.megaMenu.unexpectedError"));
          console.error("Unexpected error:", err);
        }
      }
    };
    loadCategories();
  }, [notify, t]);

  // WS logic giữ nguyên
  useRealtimeUpdate<Category, number, { categoryId: number; name: string }>(
    "/topic/category/new",
    fetchCategoryById,
    async (newCategory) => {
      try {
        const allCategories = await fetchCategories();
        setCategories(allCategories);
        notify(
          "success",
          t("component.megaMenu.newCategoryAdded", { name: newCategory.name })
        );
      } catch (error) {
        console.error("Failed to refresh categories after WS update", error);
      }
    },
    (msg) => msg.categoryId
  );

  useRealtimeUpdate<Category, number, { categoryId: number; name: string }>(
    "/topic/category/update",
    fetchCategoryById,
    async (updatedCategory) => {
      try {
        const allCategories = await fetchCategories();
        setCategories(allCategories);
        notify(
          "info",
          t("component.megaMenu.categoryUpdated", {
            name: updatedCategory.name,
          })
        );
      } catch (error) {
        console.error("Failed to refresh categories after update WS", error);
      }
    },
    (msg) => msg.categoryId
  );

  useRealtimeDelete<{ categoryId: number }>(
    "/topic/category/delete",
    async (msg) => {
      console.log("Received delete message:", msg);
      try {
        const allCategories = await fetchCategories();
        setCategories(allCategories);
        notify("warning", t("component.megaMenu.categoryDeleted"));
      } catch (error) {
        console.error("Failed to refresh categories after delete WS", error);
      }
    }
  );

  const isLinkActive = (path: string): boolean => {
    if (path === "/") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isMenuDropdownActive = isMenuOpen || isLinkActive("/menu");

  const menuLinkClasses = `text-lg transition-colors duration-200 ${
    isMenuDropdownActive
      ? "!text-yellow-400 font-bold"
      : "!text-gray-400 hover:!text-yellow-400"
  }`;

  const getActiveClass = (path: string) =>
    isLinkActive(path)
      ? "!text-yellow-400 font-bold"
      : "text-gray-200 hover:!text-yellow-400";

  return (
    <Navbar
      fluid
      className="fixed top-0 left-0 w-full z-50 shadow-lg !bg-stone-800 text-white h-16">
      <Link to="/">
        <NavbarBrand>
          <img src={Logo} className="mr-3 h-8 sm:h-10" alt="Logo" />
          <span className="text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            XYZ Restaurant
          </span>
        </NavbarBrand>
      </Link>

      <div className="flex items-center gap-6 md:order-2">
        {isLoggedIn && user && (
          <Link
            to="/cart"
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 transition text-white shadow">
            <HiOutlineShoppingCart className="h-5 w-5 text-yellow-400" />
            <span className="hidden sm:inline font-medium">
              {t("component.megaMenu.cart")}
            </span>

            {!isLoading && cartItemCount > 0 && (
              <Badge
                color="failure"
                size="sm"
                className="absolute -top-1 -right-1 !p-0.5 !h-4 !w-4 flex items-center justify-center text-xs">
                {cartItemCount}
              </Badge>
            )}
          </Link>
        )}

        {isLoggedIn && user && <NotificationBell />}

        {isLoggedIn && user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="flex items-center gap-4">
                <Avatar
                  alt={t("component.megaMenu.userAvatarAlt")}
                  img={user.avatarUrl || undefined}
                  rounded
                  size="md"
                  placeholderInitials={
                    user.name ? user.name.charAt(0).toUpperCase() : "?"
                  }
                />
              </div>
            }
            className="!bg-stone-800 shadow-lg rounded-lg"
            theme={{
              floating: {
                base: "!bg-stone-800 !text-gray-200 border border-stone-700 shadow-xl rounded-xl overflow-hidden",
                item: {
                  base: "flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:!bg-stone-700 hover:!text-yellow-400 transition-colors rounded-md mx-1",
                },
                header:
                  "!bg-stone-700 text-yellow-400 px-4 py-3 border-b border-stone-600 text-sm font-semibold",
                divider: "border-stone-700 mx-2",
              },
            }}>
            <DropdownHeader className="bg-stone-700 text-yellow-400 px-4 py-3">
              <span className="block text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs">{user.email}</span>
            </DropdownHeader>
            <Link to="/profile">
              <DropdownItem className="flex items-center gap-3 hover:!text-yellow-400 hover:!bg-stone-700">
                <HiOutlineUser className="text-yellow-400" />
                {t("component.megaMenu.profile")}
              </DropdownItem>
            </Link>
            <Link to="/order">
              <DropdownItem className="flex items-center gap-3 hover:!text-yellow-400 hover:!bg-stone-700">
                <HiOutlineShoppingCart className="text-yellow-400" />
                {t("component.megaMenu.orders")}
              </DropdownItem>
            </Link>
            <DropdownItem
              className="flex flex-col items-start gap-2 px-4 py-2 hover:!bg-stone-700"
              onClick={handleLangClick as unknown as () => void}>
              <LanguageSelector
                compact
                accentColor="text-yellow-400"
                hoverColor="hover:text-yellow-400"
                activeBg="bg-stone-800 border-yellow-400"
                inactiveText="text-gray-400"
                labelColor="text-gray-200"
              />
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              className="flex items-center gap-3 hover:!text-yellow-400 hover:!bg-stone-700"
              onClick={async () => {
                await logout();
                notify("success", t("component.megaMenu.logoutSuccess"));
              }}>
              <HiOutlineLogout className="text-yellow-400" />
              {t("component.megaMenu.logout")}
            </DropdownItem>
          </Dropdown>
        ) : (
          <Link to="/login">
            <Button className="bg-yellow-600 hover:bg-yellow-500 text-stone-900 font-semibold shadow-md">
              {t("component.megaMenu.login")}
            </Button>
          </Link>
        )}

        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <Link to="/">
          <NavbarLink
            className={`text-lg transition-colors duration-200 ${getActiveClass(
              "/"
            )}`}>
            {t("component.megaMenu.home")}
          </NavbarLink>
        </Link>

        <Dropdown
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
          label={
            <span className={menuLinkClasses}>
              {t("component.megaMenu.menu")}
            </span>
          }
          inline
          className="w-screen !bg-stone-800 border-none shadow-lg !left-0 !right-0 !ml-0 !pl-0 dropdown-fullwidth">
          <div className="py-8 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            <div className="px-3 py-2 rounded-lg bg-stone-800/50 border border-stone-700 hover:bg-stone-700/40 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer col-span-full md:col-span-2 lg:col-span-4">
              <Link
                to="/menu"
                className="text-sm font-semibold text-amber-300 hover:text-amber-400">
                {t("component.megaMenu.viewAllMenu")}
              </Link>

              <span className="text-xs text-stone-300">
                {t("component.megaMenu.allDishes")}
              </span>
            </div>

            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 rounded-xl bg-stone-900/50 hover:bg-stone-900/80 transition-colors duration-200">
                  <div className="text-xl font-bold mb-4 text-yellow-400 border-b border-yellow-400/30 pb-2 flex items-center cursor-default select-none">
                    <HiChevronRight className="mr-2 text-yellow-400" />
                    {category.name}
                  </div>

                  <ul className="space-y-2">
                    {category.children?.length > 0 &&
                      category.children.map((child) => {
                        const isOpen = openChildIds.includes(child.id);

                        return (
                          <li
                            key={child.id}
                            className="group relative cursor-pointer select-none">
                            <div
                              className="py-1.5 px-2 rounded-lg text-gray-200 font-medium flex items-center justify-between transition-colors duration-200 hover:bg-yellow-400/10"
                              onClick={() => toggleChild(child.id)}>
                              <div className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                                {child.name}
                              </div>
                              {child.children?.length > 0 && (
                                <span className="ml-2 text-gray-400">
                                  {isOpen ? "▾" : "▸"}
                                </span>
                              )}
                            </div>

                            {child.children?.length > 0 && isOpen && (
                              <ul className="ml-5 mt-2 space-y-1.5 border-l border-gray-600/30 pl-3">
                                {child.children.map((subChild) => (
                                  <li key={subChild.id}>
                                    <Link
                                      to={`/menu/${subChild.name
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}`}
                                      className="py-1 px-2 block rounded-md text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                      {subChild.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center col-span-full">
                {t("component.megaMenu.noCategory")}
              </div>
            )}
          </div>
        </Dropdown>

        <Link to="/table">
          <NavbarLink
            className={`text-lg transition-colors duration-200 ${getActiveClass(
              "/table"
            )}`}>
            {t("component.megaMenu.tableBooking")}
          </NavbarLink>
        </Link>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MegaMenuComponent;
