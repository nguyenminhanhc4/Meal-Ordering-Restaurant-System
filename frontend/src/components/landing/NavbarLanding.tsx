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
export default function NavbarLanding() {
  const { isLoggedIn, user, logout } = useAuth();
  const { notify } = useNotification();

  return (
    <Navbar
      fluid
      className="fixed top-0 left-0 w-full z-50 shadow-lg !bg-stone-800 text-white">
      <div className="flex w-full items-center justify-between">
        {/* Brand */}
        <NavbarBrand href="/">
          <img src={Logo} className="mr-3 h-8 sm:h-10" alt="Restaurant Logo" />
          <span className="self-center whitespace-nowrap text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            XYZ Restaurant
          </span>
        </NavbarBrand>

        {/* Toggle button cho mobile */}
        <NavbarToggle className="text-yellow-500 hover:text-yellow-400" />

        {/* Menu items */}
        <NavbarCollapse className="flex-1.5 justify-center">
          <NavbarLink
            href="/"
            active
            className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
            Trang chủ
          </NavbarLink>
          <NavbarLink
            href="/menu"
            className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
            Thực đơn
          </NavbarLink>
          <NavbarLink
            href="/booking"
            className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
            Đặt bàn
          </NavbarLink>
          <NavbarLink
            href="/about"
            className="text-gray-200 text-lg hover:!text-yellow-400 transition-colors">
            Giới thiệu
          </NavbarLink>
        </NavbarCollapse>

        {/* Bên phải */}
        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </Navbar>
  );
}
