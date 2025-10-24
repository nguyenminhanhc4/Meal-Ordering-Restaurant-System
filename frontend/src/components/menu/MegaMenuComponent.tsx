import React, { useState, useEffect } from "react";
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

const MegaMenuComponent: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { notify } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cartItemCount, isLoading } = useCart();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          notify(
            "error",
            err.response?.data.message || "Lỗi tải danh mục. Vui lòng thử lại."
          );
          console.error("Categories retrieve failed:", err.response?.data);
        } else {
          notify("error", "Đã xảy ra lỗi không mong muốn.");
          console.error("Unexpected error:", err);
        }
      }
    };
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ WS cho category (giữ nguyên)
  useRealtimeUpdate<Category, number, { categoryId: number; name: string }>(
    "/topic/category/new",
    fetchCategoryById,
    async (newCategory) => {
      try {
        const allCategories = await fetchCategories();
        setCategories(allCategories);
        notify("success", `Danh mục "${newCategory.name}" đã được thêm mới!`);
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
        notify("info", `Danh mục "${updatedCategory.name}" đã được cập nhật!`);
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
        notify("warning", `Một danh mục đã bị xóa!`);
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
      <NavbarBrand href="/">
        <img src={Logo} className="mr-3 h-8 sm:h-10" alt="Restaurant Logo" />
        <span className="self-center whitespace-nowrap text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          XYZ Restaurant
        </span>
      </NavbarBrand>

      <div className="flex items-center gap-6 md:order-2">
        {/* 🛒 Cart */}
        {isLoggedIn && user && (
          <a
            href="/cart"
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 transition text-white shadow">
            <HiOutlineShoppingCart className="h-5 w-5 text-yellow-400" />
            <span className="hidden sm:inline font-medium">Giỏ hàng</span>

            {!isLoading && cartItemCount > 0 && (
              <Badge
                color="failure"
                size="sm"
                className="absolute -top-1 -right-1 !p-0.5 !h-4 !w-4 flex items-center justify-center text-xs">
                {cartItemCount}
              </Badge>
            )}
          </a>
        )}

        {/* 🔔 Notification Bell */}
        {isLoggedIn && user && <NotificationBell />}

        {/* 👤 User Dropdown */}
        {isLoggedIn && user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="flex items-center gap-4">
                <Avatar
                  alt="User avatar"
                  img={user.avatarUrl || undefined}
                  rounded
                  size="md"
                  placeholderInitials={
                    user.name ? user.name.charAt(0).toUpperCase() : "?"
                  }
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-base font-semibold text-yellow-400 truncate max-w-[180px]">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-300 truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
              </div>
            }
            className="!bg-stone-800 shadow-lg rounded-lg">
            <DropdownHeader className="bg-stone-700 !text-yellow-400 flex flex-col items-start">
              <span className="block text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs">{user.email}</span>
            </DropdownHeader>
            <DropdownItem
              className="flex items-center gap-3 hover:!text-yellow-400"
              href="/profile">
              <HiOutlineUser className="text-yellow-400" />
              Hồ sơ
            </DropdownItem>
            <DropdownItem
              className="flex items-center gap-3 hover:!text-yellow-400"
              href="/order">
              <HiOutlineShoppingCart className="text-yellow-400" />
              Đơn hàng
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              className="flex items-center gap-3 hover:!text-yellow-400"
              onClick={async () => {
                await logout();
                notify("success", "Đăng xuất thành công!");
              }}>
              <HiOutlineLogout className="text-yellow-400" />
              Đăng xuất
            </DropdownItem>
          </Dropdown>
        ) : (
          <Button
            className="bg-yellow-600 hover:bg-yellow-500 text-stone-900 font-semibold shadow-md"
            href="/login">
            Đăng nhập
          </Button>
        )}

        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <NavbarLink
          href="/"
          className={`text-lg transition-colors duration-200 ${getActiveClass(
            "/"
          )}`}>
          Trang chủ
        </NavbarLink>

        <Dropdown
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
          label={<span className={menuLinkClasses}>Thực đơn</span>}
          inline
          className="w-screen !bg-stone-800 border-none shadow-lg !left-0 !right-0 !ml-0 !pl-0 dropdown-fullwidth">
          <div className="py-8 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
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
                    {category.children?.length > 0 ? (
                      category.children.map((child) => (
                        <li
                          key={child.id}
                          className="group relative cursor-default select-none">
                          <div className="py-1.5 px-2 rounded-lg text-gray-200 font-medium flex items-center transition-colors duration-200 group-hover:bg-yellow-400/10">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                            {child.name}
                          </div>

                          {child.children?.length > 0 && (
                            <ul className="ml-5 mt-2 space-y-1.5 border-l border-gray-600/30 pl-3">
                              {child.children.map((subChild) => (
                                <li key={subChild.id}>
                                  <a
                                    href={`/menu/${subChild.name
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")}`}
                                    className="py-1 px-2 block rounded-md text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                    {subChild.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="py-1 px-2 rounded-md">
                        <div className="text-gray-200 font-medium flex items-center">
                          <span className="w-1 h-1 bg-yellow-400 rounded-full mr-2"></span>
                          {category.name}
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center col-span-full">
                Không có danh mục
              </div>
            )}
          </div>
        </Dropdown>

        <NavbarLink
          href="/table"
          className={`text-lg transition-colors duration-200 ${getActiveClass(
            "/table"
          )}`}>
          Đặt bàn
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MegaMenuComponent;
