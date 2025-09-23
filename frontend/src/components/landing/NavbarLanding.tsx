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
import Logo from "../../assets/img/vite.svg";

export default function NavbarLanding() {
  const isLoggedIn = false; // sau này thay state login thực tế

  return (
    <Navbar
      fluid
      className="fixed top-0 left-0 w-full z-50 shadow-lg !bg-stone-800 text-white">
      <div className="flex w-full items-center justify-between">
        {/* Brand */}
        <NavbarBrand href="/">
          <img src={Logo} className="mr-3 h-8 sm:h-10" alt="Restaurant Logo" />
          <span className="self-center whitespace-nowrap text-xl font-bold text-yellow-500">
            XYZ Restaurant
          </span>
        </NavbarBrand>

        {/* Toggle button cho mobile */}
        <NavbarToggle className="text-yellow-500 hover:text-yellow-400" />

        {/* Menu items */}
        <NavbarCollapse className="flex-2 justify-center">
          <NavbarLink
            href="/"
            active
            className="text-gray-200 hover:text-yellow-400 transition-colors">
            Trang chủ
          </NavbarLink>
          <NavbarLink
            href="/menu"
            className="text-gray-200 hover:text-yellow-400 transition-colors">
            Thực đơn
          </NavbarLink>
          <NavbarLink
            href="/booking"
            className="text-gray-200 hover:text-yellow-400 transition-colors">
            Đặt bàn
          </NavbarLink>
          <NavbarLink
            href="/about"
            className="text-gray-200 hover:text-yellow-400 transition-colors">
            Giới thiệu
          </NavbarLink>
        </NavbarCollapse>

        {/* Bên phải */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt="User settings"
                  img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  rounded
                />
              }>
              <DropdownHeader>
                <span className="block text-sm">Nguyen Van A</span>
                <span className="block truncate text-sm font-medium">
                  user@example.com
                </span>
              </DropdownHeader>
              <DropdownItem>Hồ sơ</DropdownItem>
              <DropdownItem>Đơn hàng</DropdownItem>
              <DropdownDivider />
              <DropdownItem>Đăng xuất</DropdownItem>
            </Dropdown>
          ) : (
            <Button
              className="bg-yellow-600 hover:bg-yellow-500 text-stone-900 font-semibold shadow-md"
              href="/login">
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </Navbar>
  );
}
