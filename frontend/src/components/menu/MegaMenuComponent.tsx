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
} from "flowbite-react";
import {
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineShoppingCart,
  HiChevronRight,
} from "react-icons/hi";
import Logo from "../../assets/img/vite.svg"; // Replace with your restaurant logo path
import { useAuth } from "../../store/AuthContext";
import { useNotification } from "../Notification/NotificationContext";
import { fetchCategories } from "../../services/category/fetchCategories";
import type { Category } from "../../services/category/fetchCategories";
import { AxiosError } from "axios";

const MegaMenuComponent: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { notify } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);

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
              "Categories retrive. Please try again."
          );
          console.error("Categories retrive failed:", err.response?.data);
        } else {
          notify("error", "An unexpected error occurred. Please try again.");
          console.error("Unexpected error:", err);
        }
      }
    };
    loadCategories();
  }, []);

  return (
    <Navbar
      fluid
      className="fixed top-0 left-0 w-full z-50 shadow-lg !bg-stone-800 text-white">
      <NavbarBrand href="/">
        <img src={Logo} className="mr-3 h-8 sm:h-10" alt="Restaurant Logo" />
        <span className="self-center whitespace-nowrap text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          XYZ Restaurant
        </span>
      </NavbarBrand>
      <div className="flex md:order-2 space-x-4">
        {isLoggedIn && user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="flex items-center gap-2 min-w-[100px] max-w-[300px]">
                <div className="hidden sm:flex flex-col">
                  <span className="text-lg font-semibold text-yellow-400">
                    {user.name}
                  </span>
                </div>
                <Avatar
                  alt="User avatar"
                  img={user.avatarUrl || undefined} // null/undefined thì sẽ fallback
                  rounded
                  placeholderInitials={
                    user.name ? user.name.charAt(0).toUpperCase() : "?"
                  }
                />
              </div>
            }
            className="!bg-stone-800 shadow-lg rounded-lg">
            <DropdownHeader className="bg-stone-700 !text-yellow-400">
              <span className="block text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs">{user.email}</span>
            </DropdownHeader>
            <DropdownItem className="flex items-center gap-3 hover:!text-yellow-400">
              <HiOutlineUser className="text-yellow-400" />
              Hồ sơ
            </DropdownItem>
            <DropdownItem className="flex items-center gap-3 hover:!text-yellow-400">
              <HiOutlineShoppingCart className="text-yellow-400" />
              Đơn hàng
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              className="flex items-center gap-3 hover:!text-yellow-400"
              onClick={async () => {
                await logout(); // từ AuthContext
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
        <a href="/cart" className="flex items-center text-white">
          <HiOutlineShoppingCart className="h-6 w-6" />
          <span className="ml-2">Cart</span>
        </a>
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink
          href="/"
          className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
          Trang chủ
        </NavbarLink>
        <Dropdown
          label={
            <span className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors duration-200">
              Thực đơn
            </span>
          }
          inline
          className="w-screen !bg-stone-800 text-white border-none shadow-lg !left-0 !right-0 !ml-0 !pl-0 dropdown-fullwidth">
          <div className="py-8 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full !ml-0 !pl-0">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 ml-5 rounded-lg bg-stone-900/50 hover:bg-stone-900/80 transition-colors duration-200">
                  <h3 className="text-xl font-bold mb-4 text-yellow-400 border-b border-yellow-400/30 pb-2 flex items-center">
                    <HiChevronRight className="mr-2 text-yellow-400" />
                    {category.name}
                  </h3>
                  <ul className="space-y-2">
                    {category.children.length > 0 ? (
                      category.children.map((child) => (
                        <li
                          key={child.id}
                          className="group relative py-1 px-2 rounded-md hover:bg-yellow-400/10 transition-colors duration-200">
                          <a
                            href={`/menu/${child.name
                              .toLowerCase()
                              .replace(" ", "-")}`}
                            className="text-gray-200 group-hover:text-yellow-400 transition-colors duration-200 font-medium flex items-center">
                            <span className="w-1 h-1 bg-yellow-400 rounded-full mr-2 group-hover:scale-150 transition-transform duration-200"></span>
                            {child.name}
                          </a>
                          {child.children.length > 0 && (
                            <ul className="ml-6 mt-2 space-y-1.5 border-l border-gray-600/30 pl-2">
                              {child.children.map((subChild) => (
                                <li
                                  key={subChild.id}
                                  className="py-1 px-2 rounded-md hover:bg-yellow-400/10 transition-colors duration-200">
                                  <a
                                    href={`/menu/${subChild.name
                                      .toLowerCase()
                                      .replace(" ", "-")}`}
                                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm flex items-center">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                    {subChild.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="py-1 px-2 rounded-md hover:bg-yellow-400/10 transition-colors duration-200">
                        <a
                          href={`/menu/${category.name
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          className="text-gray-200 hover:text-yellow-400 transition-colors duration-200 font-medium flex items-center">
                          <span className="w-1 h-1 bg-yellow-400 rounded-full mr-2"></span>
                          {category.name}
                        </a>
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
          href="/book-table"
          className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
          Đặt bàn
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MegaMenuComponent;
