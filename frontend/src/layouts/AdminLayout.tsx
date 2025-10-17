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

function AdminLayout() {
  const { user, logout, isChecking, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Giảm chiều rộng Sidebar để đỡ chiếm chỗ
  const sidebarWidth = isSidebarOpen ? "w-64" : "w-[72px]";

  // Menu cấu hình
  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: HiChartPie },
    { path: "/admin/users", label: "Users", icon: HiUser },
    { path: "/admin/categories", label: "Categories", icon: HiCollection },
    { path: "/admin/menu-items", label: "Menu Items", icon: HiMenuAlt1 },
    { path: "/admin/orders", label: "Orders", icon: HiShoppingBag },
    { path: "/admin/settings", label: "Settings", icon: HiCog },
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

  if (user?.role !== "ADMIN") {
    navigate("/");
    return null;
  }

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
            z-40 h-full border-r shadow-lg
            !bg-gray-900 !text-gray-100 
            ${sidebarWidth}
            overflow-y-auto overflow-x-hidden
          `}
          theme={{
            root: {
              inner: "h-full !bg-gray-900 !text-gray-100",
              base: "h-full",
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

          {/* Menu items */}
          <SidebarItems>
            <SidebarItemGroup>
              {menuItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <div key={path} className="relative group">
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
                            ? "gap-3 px-3 py-2"
                            : "justify-center py-2"
                        }`}>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && (
                          <span className="truncate text-sm">{label}</span>
                        )}
                      </div>
                    </SidebarItem>
                  </div>
                );
              })}
            </SidebarItemGroup>
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
