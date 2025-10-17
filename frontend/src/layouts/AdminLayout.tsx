import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Navbar,
  Sidebar,
  Dropdown,
  Avatar,
  SidebarLogo,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
  NavbarBrand,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
  Button,
  Tooltip,
} from "flowbite-react";
import { useAuth } from "../store/AuthContext";
import {
  HiChartPie,
  HiUser,
  HiShoppingBag,
  HiCog,
  HiLogout,
  HiCollection,
  HiMenuAlt1,
  HiX,
} from "react-icons/hi";
import logo from "../assets/img/vite.svg";
import "./AdminLayout.css";

interface SidebarItemButtonProps {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function AdminLayout() {
  const { user, logout, isChecking, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sidebarWidth = isSidebarOpen ? "w-64" : "w-[72px]";

  // 🔹 Menu chung cho cả ADMIN và STAFF
  const commonMenu = [
    { path: "/admin/dashboard", label: "Dashboard", icon: HiChartPie },
    { path: "/admin/orders", label: "Orders", icon: HiShoppingBag },
  ];

  // 🔹 Menu riêng cho ADMIN
  const adminMenu = [
    { path: "/admin/users", label: "Users", icon: HiUser },
    { path: "/admin/categories", label: "Categories", icon: HiCollection },
    { path: "/admin/menu-items", label: "Menu Items", icon: HiMenuAlt1 },
    { path: "/admin/settings", label: "Settings", icon: HiCog },
  ];

  // 🔹 Menu riêng cho STAFF
  const staffMenu = [
    { path: "/admin/my-tasks", label: "My Tasks", icon: HiCollection },
  ];

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Đang kiểm tra phiên...
      </div>
    );
  }

  if (!isLoggedIn) {
    navigate("/admin/login");
    return null;
  }

  if (!["ADMIN", "STAFF"].includes(user!.role)) {
    navigate("/");
    return null;
  }

  // Component render menu item (để tránh lặp code)
  const SidebarItemButton: React.FC<SidebarItemButtonProps> = ({
    path,
    label,
    icon: Icon,
  }) => {
    const isActive = location.pathname === path;
    return (
      <SidebarItem
        onClick={() => {
          navigate(path);
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }}
        className={`
          relative transition-all duration-200 cursor-pointer select-none text-gray-300
          ${
            isActive
              ? "!bg-gray-800 !text-white font-semibold border-l-4 border-blue-500"
              : "hover:!bg-gray-800 hover:!text-white"
          }
        `}>
        <div
          className={`flex items-center ${
            isSidebarOpen
              ? "gap-3 px-3 py-2 justify-start"
              : "justify-center py-3"
          }`}>
          {!isSidebarOpen ? (
            <Tooltip
              content={label}
              placement="right"
              trigger="hover"
              animation="duration-300"
              theme={{
                target: "inline-flex",
                base: "absolute z-10 inline-block text-sm transition-opacity duration-300",
                style: {
                  dark: "!bg-blue-600 !text-white",
                  light: "!bg-blue-600 !text-white",
                },
                arrow: {
                  style: {
                    dark: "!bg-blue-600",
                    light: "!bg-blue-600",
                  },
                },
              }}>
              <div>
                <Icon className="w-5 h-5 flex-shrink-0" />
              </div>
            </Tooltip>
          ) : (
            <Icon className="w-5 h-5 flex-shrink-0" />
          )}
          {isSidebarOpen && (
            <span className="truncate text-sm leading-none">{label}</span>
          )}
        </div>
      </SidebarItem>
    );
  };

  return (
    <section className="admin-layout">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}></div>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          aria-label="Sidebar"
          className={`
            flex-shrink-0 transition-all duration-300 ease-in-out 
            z-[60] h-full border-r shadow-lg
            ${sidebarWidth}
          `}
          theme={{
            root: {
              inner:
                "h-full !bg-gray-900 !text-gray-100 relative !overflow-visible",
              base: "h-full relative !rounded-l-none",
            },
            item: {
              base: "hover:!bg-gray-800 hover:!text-white cursor-pointer text-gray-200",
            },
          }}>
          {/* Nút đóng Sidebar (mobile) */}
          <div className="flex justify-end p-2 md:hidden">
            <Button
              color="gray"
              onClick={toggleSidebar}
              className="!bg-transparent !border-none !text-white">
              <HiX className="w-6 h-6" />
            </Button>
          </div>

          {/* Logo */}
          <SidebarLogo
            href="/admin/dashboard"
            img={`${logo}`}
            imgAlt="Logo"
            className={`!text-white flex items-center py-3 ${
              isSidebarOpen ? "px-4" : "justify-center"
            }`}>
            {isSidebarOpen && (
              <span className="ml-2 text-lg font-semibold tracking-wide">
                Admin Panel
              </span>
            )}
          </SidebarLogo>

          {/* Sidebar content */}
          <SidebarItems>
            {/* 🔹 Menu chung */}
            <SidebarItemGroup>
              <h6
                className={`${
                  isSidebarOpen ? "px-3 mb-1" : "hidden"
                } text-xs uppercase tracking-wide text-gray-400`}>
                Chung
              </h6>
              {commonMenu.map((item) => (
                <SidebarItemButton key={item.path} {...item} />
              ))}
            </SidebarItemGroup>

            <hr className="my-2 border-gray-700" />

            {/* 🔹 Menu riêng ADMIN */}
            {user?.role === "ADMIN" && (
              <SidebarItemGroup>
                <h6
                  className={`${
                    isSidebarOpen ? "px-3 mb-1" : "hidden"
                  } text-xs uppercase tracking-wide text-gray-400`}>
                  Quản trị hệ thống
                </h6>
                {adminMenu.map((item) => (
                  <SidebarItemButton key={item.path} {...item} />
                ))}
              </SidebarItemGroup>
            )}

            {/* 🔹 Menu riêng STAFF */}
            {user?.role === "STAFF" && (
              <SidebarItemGroup>
                <h6
                  className={`${
                    isSidebarOpen ? "px-3 mb-1" : "hidden"
                  } text-xs uppercase tracking-wide text-gray-400`}>
                  Tác vụ nhân viên
                </h6>
                {staffMenu.map((item) => (
                  <SidebarItemButton key={item.path} {...item} />
                ))}
              </SidebarItemGroup>
            )}
          </SidebarItems>
        </Sidebar>

        {/* Content area */}
        <div className="flex flex-col flex-1">
          {/* Navbar */}
          <Navbar
            fluid
            className="border-b !border-gray-200 !bg-white shadow-sm">
            <div className="flex items-center">
              <Button
                onClick={toggleSidebar}
                color="gray"
                className="mr-3 p-2 !bg-transparent !border-none text-gray-600 hover:!bg-gray-100">
                <HiMenuAlt1 className="w-6 h-6" />
              </Button>

              <NavbarBrand>
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-800">
                  {user?.name || "Admin"}
                </span>
              </NavbarBrand>
            </div>

            <div className="flex md:order-2">
              <Dropdown
                inline
                label={
                  <Avatar
                    alt="Admin avatar"
                    img={user?.avatarUrl || logo}
                    rounded
                  />
                }>
                <DropdownHeader>
                  <span className="block text-sm">{user?.name}</span>
                  <span className="block truncate text-sm font-medium">
                    {user?.email}
                  </span>
                </DropdownHeader>
                <DropdownItem as={Link} to="/admin/settings">
                  Cài đặt
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  icon={HiLogout}
                  onClick={async () => {
                    await logout();
                    navigate("/admin/login");
                  }}>
                  Đăng xuất
                </DropdownItem>
              </Dropdown>
            </div>
          </Navbar>

          {/* Main content */}
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </section>
  );
}

export default AdminLayout;
