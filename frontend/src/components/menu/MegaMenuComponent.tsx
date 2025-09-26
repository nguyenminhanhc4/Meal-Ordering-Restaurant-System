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
} from "react-icons/hi";
import Logo from "../../assets/img/vite.svg"; // Replace with your restaurant logo path
import { useAuth } from "../../store/AuthContext";
import { useNotification } from "../Notification/NotificationContext";
import { fetchCategories } from "../../services/fetchCategories";
import type { Category } from "../../services/fetchCategories";
import { AxiosError } from "axios";

const MegaMenuComponent: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { notify } = useNotification();
  const [, setIsMenuOpen] = useState(false);
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
            err.response?.data.message || "Login failed. Please try again."
          );
          console.error("Login failed:", err.response?.data);
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
                  img={
                    user.avatarUrl ||
                    "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  }
                  rounded
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
          Home
        </NavbarLink>
        <Dropdown
          label={
            <span className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
              Menu
            </span>
          }
          inline
          className="w-screen dropdown-fullwidth !left-0 ml-0 mt-2 !bg-stone-800 text-white border-none shadow-lg"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}>
          <div className="py-6 grid grid-cols-4  gap-8 w-full max-w-screen-xl mx-0 pl-4">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id}>
                  <h3 className="text-lg font-semibold mb-4 text-white">
                    {category.name}
                  </h3>
                  <ul className="space-y-2">
                    {category.children.length > 0 ? (
                      category.children.map((child) => (
                        <li key={child.id}>
                          <a
                            href={`/menu/${child.name
                              .toLowerCase()
                              .replace(" ", "-")}`}
                            className="text-gray-300 hover:text-white">
                            {child.name}
                          </a>
                          {child.children.length > 0 && (
                            <ul className="ml-4 mt-2 space-y-2">
                              {child.children.map((subChild) => (
                                <li key={subChild.id}>
                                  <a
                                    href={`/menu/${subChild.name
                                      .toLowerCase()
                                      .replace(" ", "-")}`}
                                    className="text-gray-400 hover:text-white text-sm">
                                    {subChild.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>
                        <a
                          href={`/menu/${category.name
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          className="text-gray-300 hover:text-white">
                          {category.name}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              ))
            ) : (
              <div className="text-gray-400">Không có danh mục</div>
            )}
          </div>
        </Dropdown>
        <NavbarLink
          href="/book-table"
          className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
          Book Table
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MegaMenuComponent;
